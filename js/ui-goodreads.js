import { state, saveBooks, normalizeBooks } from './state.js';
import { renderBooks, updateStats } from './ui-render.js';

// ── CSV parser (handles quoted fields with commas) ────────────────────────────
function parseCSV(text) {
  const lines = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
  return lines.map(line => {
    const fields = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    fields.push(cur.trim());
    return fields;
  }).filter(r => r.some(Boolean));
}

// ── Map Goodreads shelf → Libra status ────────────────────────────────────────
function mapStatus(shelf) {
  if (shelf === 'read')              return 'completed';
  if (shelf === 'currently-reading') return 'reading';
  return 'to-read';
}

// ── Generate a slug id from title+author ─────────────────────────────────────
function makeId(title, author) {
  return `${title}-${author}`
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 80);
}

// ── Parse completed date from "YYYY/MM/DD" ───────────────────────────────────
function parseCompletedDate(status, dateRead) {
  if (status !== 'completed' || !dateRead) return undefined;
  const d = new Date(dateRead.replaceAll('/', '-'));
  return Number.isNaN(d.getTime())
    ? undefined
    : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ── Build a single book record from a CSV row ─────────────────────────────────
function buildBook(row, indices, existing) {
  const { titleIdx, authorIdx, ratingIdx, pagesIdx, dateIdx, shelfIdx, reviewIdx } = indices;
  const get = i => (i >= 0 ? (row[i] || '').trim() : '');

  const title  = get(titleIdx).slice(0, 160);
  const author = get(authorIdx).slice(0, 120);
  if (!title || !author) return null;

  const id = makeId(title, author);
  if (!id || existing.has(id)) return null;

  const ratingRaw = Number.parseInt(get(ratingIdx), 10);
  const rating    = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;
  const pages     = Number.parseInt(get(pagesIdx), 10) || undefined;
  const status    = mapStatus(get(shelfIdx));
  const notes     = get(reviewIdx).slice(0, 2400) || undefined;
  const completed = parseCompletedDate(status, get(dateIdx));

  const book = { title, author, status, category: 'Other' };
  if (rating)    book.rating    = rating;
  if (pages)     book.pages     = pages;
  if (notes)     book.notes     = [notes];
  if (completed) book.completed = completed;

  return { id, book };
}

// ── Import ────────────────────────────────────────────────────────────────────
export async function importGoodreads(file) {
  if (!file) return { imported: 0, skipped: 0, error: null };

  let text;
  try { text = await file.text(); } catch {
    return { imported: 0, skipped: 0, error: 'Could not read file' };
  }

  const rows = parseCSV(text);
  if (!rows.length) return { imported: 0, skipped: 0, error: 'Empty file' };

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const col = name => headers.indexOf(name);

  const titleIdx = col('title'), authorIdx = col('author');
  if (titleIdx < 0 || authorIdx < 0) {
    return { imported: 0, skipped: 0, error: 'Not a valid Goodreads export (missing Title/Author columns)' };
  }

  const indices = {
    titleIdx, authorIdx,
    ratingIdx: col('my rating'),
    pagesIdx:  col('number of pages'),
    dateIdx:   col('date read'),
    shelfIdx:  col('exclusive shelf'),
    reviewIdx: col('my review'),
  };

  const existing = new Set(
    Object.values(state.booksData).map(b => makeId(b.title || '', b.author || ''))
  );

  let skipped = 0;
  const staged = {};

  for (const row of rows.slice(1)) {
    const result = buildBook(row, indices, existing);
    if (!result) { skipped++; continue; }
    staged[result.id] = result.book;
    existing.add(result.id);
  }

  // A CSV is untrusted input like any other file, so it goes through the same
  // normalizer as a JSON backup rather than straight into state.
  const safeBooks = normalizeBooks(staged);
  const imported = Object.keys(safeBooks).length;
  skipped += Object.keys(staged).length - imported;
  Object.assign(state.booksData, safeBooks);

  if (imported > 0) { saveBooks(); renderBooks(); updateStats(); }

  return { imported, skipped, error: null };
}
