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

export function escHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;').replaceAll('"', '&quot;')
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

function applyOptionalBookFields(book, { subtitle, pages, rating, coverId, synopsis }) {
  if (subtitle) book.subtitle = subtitle;
  if (pages) book.pages = pages;
  if (rating) book.rating = clamp(rating, 1, 5);
  if (coverId) book.coverId = coverId;
  if (synopsis) book.synopsis = synopsis;
}

function applyStatusFields(book, { status, pages, currentPage, started, completed }) {
  if (status === 'reading') {
    book.currentPage = pages ? clamp(currentPage, 0, pages) : currentPage;
    book.progress = pages ? clamp(Math.round((book.currentPage / pages) * 100), 0, 100) : 0;
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

  const book = {
    title,
    author,
    status,
    category: cleanText(rawBook.category, 80) || 'Other',
    notes: sanitizeNotesList(rawBook.notes),
  };

  const subtitle = cleanText(rawBook.subtitle, 180);
  const started = cleanText(rawBook.started, 80);
  const completed = cleanText(rawBook.completed, 80);
  const synopsis = cleanText(rawBook.synopsis, 2400);

  applyOptionalBookFields(book, { subtitle, pages, rating, coverId, synopsis });
  applyStatusFields(book, { status, pages, currentPage, started, completed });

  return book;
}

function normalizeBooksCollection(rawBooks) {
  if (!rawBooks || typeof rawBooks !== 'object' || Array.isArray(rawBooks)) {
    return structuredClone(DEFAULT_BOOKS);
  }

  const normalized = {};
  for (const [rawId, rawBook] of Object.entries(rawBooks)) {
    const safeId = sanitizeBookId(rawId);
    if (!safeId) continue;
    const safeBook = normalizeBookRecord(rawBook);
    if (safeBook) normalized[safeId] = safeBook;
  }

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
};

export function saveBooks() {
  localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
}

export function saveLists() {
  localStorage.setItem('cyberpunk-lists', JSON.stringify(state.lists));
}
