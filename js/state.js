import { DEFAULT_BOOKS } from './default-books.js';

const VALID_STATUSES = new Set(['reading', 'completed', 'to-read']);
const RESERVED_BOOK_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function toPositiveInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function toNonNegativeInt(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function cleanText(value, maxLen = 300) {
  if (typeof value !== 'string') return '';
  return value.replaceAll(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen);
}

export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function guessCategory(subjects = []) {
  const s = subjects.slice(0, 20).join(' ').toLowerCase();
  if (s.includes('historical fiction')) return 'Historical Fiction';
  if (s.includes('histor')) return 'History';
  if (s.includes('fantasy')) return 'Fantasy';
  if (s.includes('adventure')) return 'Adventure';
  if (s.includes('biograph') || s.includes('autobiograph')) return 'Biography';
  if (s.includes('econom')) return 'Economics';
  if (s.includes('science') || s.includes('natural history')) return 'Science';
  if (s.includes('philosoph')) return 'Philosophy';
  return null;
}

// Escapes ' as well, so a single-quoted attribute is safe too — every
// attribute here is double-quoted today, and one that is not should not
// silently become an injection point.
export function escHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function sanitizeBookId(rawId) {
  const id = String(rawId ?? '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 80);
  if (!id || RESERVED_BOOK_KEYS.has(id)) return '';
  return id;
}

function sanitizeNotesList(rawNotes) {
  if (!Array.isArray(rawNotes)) return [];
  return rawNotes.map(n => cleanText(n, 260)).filter(Boolean).slice(0, 100);
}

function sanitizeQuotesList(rawQuotes) {
  if (!Array.isArray(rawQuotes)) return [];
  return rawQuotes
    .filter(q => q && typeof q === 'object')
    .map(q => ({ text: cleanText(String(q.text ?? ''), 500), page: toPositiveInt(q.page) ?? null }))
    .filter(q => q.text)
    .slice(0, 200);
}

function sanitizeSessions(rawSessions) {
  if (!Array.isArray(rawSessions)) return [];
  return rawSessions
    .filter(s => s && typeof s === 'object' && typeof s.date === 'string' && s.date.length > 0)
    .map(s => ({ date: cleanText(s.date, 20), pages: toPositiveInt(s.pages) || 0 }))
    .filter(s => s.pages > 0)
    .slice(0, 1000);
}

function applyOptionalBookFields(book, { subtitle, pages, rating, coverId, synopsis }) {
  if (subtitle) book.subtitle = subtitle;
  if (pages) book.pages = pages;
  if (rating) book.rating = clamp(rating, 1, 5);
  if (coverId) book.coverId = coverId;
  if (synopsis) book.synopsis = synopsis;
}

// A session records pages read in one sitting, so the log is a running delta —
// the page you are on is that total added to wherever you already were when you
// started logging. `pageBaseline` is that anchor. Without it, a book you were
// 260 pages into jumped back to page 10 the moment you logged a 10-page session.
export function sessionPages(book) {
  return (book?.sessions || []).reduce((sum, s) => sum + (Number(s.pages) || 0), 0);
}

// Re-anchors the baseline to the book's current page. Call whenever the page is
// set from outside the session log — a manual edit, or the first session on a
// book that already had progress.
export function anchorPageBaseline(book) {
  book.pageBaseline = Math.max(0, (Number(book.currentPage) || 0) - sessionPages(book));
}

function applyStatusFields(book, { status, pages, currentPage, pageBaseline, started, completed }) {
  if (status === 'reading') {
    book.currentPage = pages ? clamp(currentPage, 0, pages) : currentPage;
    book.progress = pages ? clamp(Math.round((book.currentPage / pages) * 100), 0, 100) : 0;
    // Carried through the whitelist deliberately: this normalizer runs on every
    // import and cloud sync, so a dropped baseline would silently reset to 0 and
    // bring the bug back on the next device.
    if (pageBaseline !== null) book.pageBaseline = pages ? clamp(pageBaseline, 0, pages) : pageBaseline;
    if (started) book.started = started;
  }

  if (status === 'completed' && completed) {
    book.completed = completed;
  }
}

function normalizeBookRecord(rawBook) {
  if (!rawBook || typeof rawBook !== 'object' || Array.isArray(rawBook)) return null;

  const title = cleanText(rawBook.title, 160);
  const author = cleanText(rawBook.author, 120);
  if (!title || !author) return null;

  const status = VALID_STATUSES.has(rawBook.status) ? rawBook.status : 'to-read';
  const pages = toPositiveInt(rawBook.pages);
  const rating = toPositiveInt(rawBook.rating);
  const coverId = toPositiveInt(rawBook.coverId);
  const currentPage = toNonNegativeInt(rawBook.currentPage, 0);
  // null, not 0: a book that has never had a baseline must stay unanchored so
  // the first session can derive one from its existing page. Storing 0 here
  // would claim "started logging from page 1" for every imported book.
  const pageBaseline = rawBook.pageBaseline === undefined || rawBook.pageBaseline === null
    ? null
    : toNonNegativeInt(rawBook.pageBaseline, 0);

  const book = {
    title,
    author,
    status,
    category: cleanText(rawBook.category, 80) || 'Other',
    notes: sanitizeNotesList(rawBook.notes),
    quotes: sanitizeQuotesList(rawBook.quotes),
    ...(Array.isArray(rawBook.sessions) && rawBook.sessions.length
      ? { sessions: sanitizeSessions(rawBook.sessions) }
      : {}),
  };

  const subtitle = cleanText(rawBook.subtitle, 180);
  const started = cleanText(rawBook.started, 80);
  const completed = cleanText(rawBook.completed, 80);
  const synopsis = cleanText(rawBook.synopsis, 2400);

  applyOptionalBookFields(book, { subtitle, pages, rating, coverId, synopsis });
  applyStatusFields(book, { status, pages, currentPage, pageBaseline, started, completed });

  if (Array.isArray(rawBook.tags)) {
    const tags = rawBook.tags.map(t => cleanText(String(t), 30).toLowerCase()).filter(Boolean).slice(0, 20);
    if (tags.length) book.tags = tags;
  }

  return book;
}

// Books arriving from anywhere that is not this tab's own state — a backup
// file, a Goodreads CSV, another device's cloud row — must come through here.
// Object.entries skips inherited keys and sanitizeBookId drops __proto__, so
// a hostile key cannot reach the target object's prototype.
export function normalizeBooks(rawBooks) {
  if (!rawBooks || typeof rawBooks !== 'object' || Array.isArray(rawBooks)) return {};

  const normalized = { __proto__: null };
  for (const [rawId, rawBook] of Object.entries(rawBooks)) {
    const safeId = sanitizeBookId(rawId);
    if (!safeId) continue;
    const safeBook = normalizeBookRecord(rawBook);
    if (safeBook) normalized[safeId] = safeBook;
  }

  return Object.fromEntries(Object.entries(normalized));
}

function normalizeBooksCollection(rawBooks) {
  const normalized = normalizeBooks(rawBooks);
  return Object.keys(normalized).length ? normalized : structuredClone(DEFAULT_BOOKS);
}

function loadBooks() {
  const stored = localStorage.getItem('cyberpunk-books');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return normalizeBooksCollection(parsed);
    } catch (error) {
      console.warn('Invalid saved library data, restoring defaults.', error);
      return structuredClone(DEFAULT_BOOKS);
    }
  }
  return structuredClone(DEFAULT_BOOKS);
}

function normalizeListRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = cleanText(String(raw.name || ''), 60).trim();
  if (!name) return null;
  const bookIds = Array.isArray(raw.bookIds)
    ? raw.bookIds.filter(id => typeof id === 'string' && id.length > 0).slice(0, 500)
    : [];
  return { name, bookIds };
}

function loadLists() {
  const stored = localStorage.getItem('cyberpunk-lists');
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const normalized = {};
    for (const [id, raw] of Object.entries(parsed)) {
      const safeId = sanitizeBookId(id);
      if (!safeId) continue;
      const list = normalizeListRecord(raw);
      if (list) normalized[safeId] = { id: safeId, ...list };
    }
    return normalized;
  } catch {
    return {};
  }
}

export const state = {
  booksData: loadBooks(),
  lists: loadLists(),
  activeFilter: 'all',
  activeList: null,
  activeSort: 'default',
  searchQuery: '',
  editingBookId: null,
  soundEnabled: true,
  audioContext: null,
  selectMode: false,
  selectedIds: new Set(),
};

export function saveBooks() {
  try {
    localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
  } catch (error) {
    // Quota exceeded — the in-memory library still works, so do not take the
    // app down over it, but the cloud push below is now the only copy.
    console.warn('Could not persist library to localStorage.', error);
  }
  // Fire-and-forget cloud sync — doesn't block UI
  import('./auth.js').then(({ pushBooksToCloud }) => {
    pushBooksToCloud(state.booksData).catch(() => {});
  }).catch(() => {});
}

export function saveLists() {
  localStorage.setItem('cyberpunk-lists', JSON.stringify(state.lists));
}
