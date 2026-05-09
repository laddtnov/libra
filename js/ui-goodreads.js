import { state, saveBooks } from './state.js';
import { renderBooks } from './ui-render.js';
import { updateStats } from './ui-render.js';

// ── CSV parser (handles quoted fields with commas) ────────────────────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
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
  }).filter(r => r.some(f => f));
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

  // Required columns
  const titleIdx  = col('title');
  const authorIdx = col('author');
  if (titleIdx < 0 || authorIdx < 0) {
    return { imported: 0, skipped: 0, error: 'Not a valid Goodreads export (missing Title/Author columns)' };
  }

  const ratingIdx  = col('my rating');
  const pagesIdx   = col('number of pages');
  const dateIdx    = col('date read');
  const shelfIdx   = col('exclusive shelf');
  const reviewIdx  = col('my review');

  // Build existing title+author set for duplicate detection
  const existing = new Set(
    Object.values(state.booksData).map(b =>
      makeId(b.title || '', b.author || '')
    )
  );

  let imported = 0, skipped = 0;

  for (const row of rows.slice(1)) {
    const get = i => (i >= 0 ? (row[i] || '').trim() : '');

    const title  = get(titleIdx).slice(0, 160);
    const author = get(authorIdx).slice(0, 120);
    if (!title || !author) { skipped++; continue; }

    const id = makeId(title, author);
    if (!id) { skipped++; continue; }

    if (existing.has(id)) { skipped++; continue; }

    const ratingRaw = parseInt(get(ratingIdx), 10);
    const rating    = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;
    const pages     = parseInt(get(pagesIdx), 10) || undefined;
    const shelf     = get(shelfIdx);
    const status    = mapStatus(shelf);
    const dateRead  = get(dateIdx); // "YYYY/MM/DD"
    const notes     = get(reviewIdx).slice(0, 2400) || undefined;

    // Convert "2024/03/15" → "March 2024" for completed field
    let completed;
    if (status === 'completed' && dateRead) {
      const d = new Date(dateRead.replaceAll('/', '-'));
      if (!isNaN(d)) {
        completed = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    const book = { title, author, status, category: 'Other' };
    if (rating)    book.rating    = rating;
    if (pages)     book.pages     = pages;
    if (notes)     book.notes     = [notes];
    if (completed) book.completed = completed;

    state.booksData[id] = book;
    existing.add(id);
    imported++;
  }

  if (imported > 0) {
    saveBooks();
    renderBooks();
    updateStats();
  }

  return { imported, skipped, error: null };
}
