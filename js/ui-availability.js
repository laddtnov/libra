import { state } from './state.js';
import { t } from './i18n.js';

function q(...parts) {
  return encodeURIComponent(parts.filter(Boolean).join(' '));
}

const SOURCES = [
  {
    label: 'OPEN LIBRARY',
    tag: 'FREE',
    type: 'free',
    url: (title, author) => `https://openlibrary.org/search?q=${q(title, author)}`,
  },
  {
    label: 'WORLDCAT',
    tag: 'LIBRARY',
    type: 'free',
    url: (title, author) => `https://www.worldcat.org/search?q=${q(title, author)}`,
  },
  {
    label: 'THRIFTBOOKS',
    tag: 'USED',
    type: 'cheap',
    url: (title, author) => `https://www.thriftbooks.com/browse/?b.search=${q(title, author)}`,
  },
  {
    label: 'ABEBOOKS',
    tag: 'USED',
    type: 'cheap',
    url: (title, author) => `https://www.abebooks.com/servlet/SearchResults?kn=${q(title, author)}`,
  },
  {
    label: 'AMAZON',
    tag: 'BUY',
    type: 'store',
    url: (title, author) => `https://www.amazon.com/s?k=${q(title, author)}&i=stripbooks`,
  },
  {
    label: 'GOOGLE BOOKS',
    tag: 'PREVIEW',
    type: 'store',
    url: (title, author) => `https://books.google.com/books?q=${q(title, author)}`,
  },
];

export function renderAvailabilitySection(bookId) {
  const book = state.booksData[bookId];
  if (!book) return '';

  const { title, author } = book;
  const links = SOURCES.map(s => `
    <a class="avail-btn avail-${s.type}"
       href="${s.url(title, author)}"
       target="_blank"
       rel="noopener noreferrer">
      <span class="avail-label">${s.label}</span>
      <span class="avail-tag">${s.tag}</span>
    </a>`).join('');

  return `
    <div class="detail-section">
      <div class="detail-section-title">&gt;&gt; ${t('avail_title')}</div>
      <div class="availability-grid">${links}</div>
      <div class="avail-note">&gt; ${t('avail_note')}</div>
    </div>`;
}
