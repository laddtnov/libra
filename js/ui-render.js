import { state, clamp, toPositiveInt, toNonNegativeInt, escHtml } from './state.js';

const GENRE_META = {
  History: { cls: 'history', emoji: '🏛️' },
  Fantasy: { cls: 'fantasy', emoji: '✨' },
  Adventure: { cls: 'adventure', emoji: '⚔️' },
  'Historical Fiction': { cls: 'fiction', emoji: '👑' },
  Biography: { cls: 'biography', emoji: '📝' },
  Economics: { cls: 'economics', emoji: '💰' },
  Science: { cls: 'science', emoji: '🔬' },
  Philosophy: { cls: 'philosophy', emoji: '🧠' },
};

let onOpenDetails = () => {};

export function configureRenderHandlers({ openDetails }) {
  onOpenDetails = openDetails;
}

function countUp(el, target, duration = 700) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function updateStats(filteredEntries) {
  const books = filteredEntries
    ? filteredEntries.map(([, b]) => b)
    : Object.values(state.booksData);
  countUp(document.getElementById('stat-completed'), books.filter(b => b.status === 'completed').length);
  countUp(document.getElementById('stat-reading'), books.filter(b => b.status === 'reading').length);
  countUp(document.getElementById('stat-queued'), books.filter(b => b.status === 'to-read').length);
  countUp(document.getElementById('stat-total'), books.length);
}

function getStatusClass(status) {
  if (status === 'completed') return 'read';
  if (status === 'reading') return 'in-progress';
  return 'to-read';
}

export function renderStarsHTML(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="star ${i < (rating || 0) ? 'filled' : ''}">★</span>`
  ).join('');
}

function buildCardHTML(book) {
  const statusClass = getStatusClass(book.status);
  const safeTitle = escHtml(book.title || 'Untitled');
  const safeAuthor = escHtml(book.author || 'Unknown');
  const safeCategory = escHtml(book.category || '');
  const safeStarted = escHtml(book.started || '—');
  const safeCompleted = escHtml(book.completed || '—');
  const safePages = toPositiveInt(book.pages);
  const safeCurrentPage = toNonNegativeInt(book.currentPage, 0);
  const safeRating = clamp(toNonNegativeInt(book.rating, 0), 0, 5);
  const safeProgress = clamp(toNonNegativeInt(book.progress, 0), 0, 100);
  const spineTitle = escHtml((book.title || 'UNTITLED').toUpperCase().slice(0, 16));

  const statusBadge = {
    reading: '<span class="status-icon">📖</span><span>READING</span>',
    completed: '<span class="status-icon">✅</span><span>COMPLETED</span>',
    'to-read': '<span class="status-icon">📌</span><span>TO READ</span>',
  }[book.status] || '';

  let metaHTML = '';
  if (book.status === 'reading') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Progress:</span><span class="meta-value">${safeCurrentPage}/${safePages || '?'} pages (${safeProgress}%)</span></div>
      <div class="meta-item"><span class="meta-label">Started:</span><span class="meta-value">${safeStarted}</span></div>`;
  } else if (book.status === 'completed') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Completed:</span><span class="meta-value">${safeCompleted}</span></div>
      <div class="meta-item"><span class="meta-label">Rating:</span><span class="meta-value">${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)} ${safeRating}/5</span></div>`;
  } else {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Status:</span><span class="meta-value">In Queue</span></div>
      <div class="meta-item"><span class="meta-label">Pages:</span><span class="meta-value">${safePages || '?'}</span></div>`;
  }

  const progressHTML = book.status === 'reading'
    ? `<div class="progress-bar"><div class="progress-fill" style="width:${safeProgress}%"></div></div>` : '';

  const g = GENRE_META[book.category] || { cls: '', emoji: '📚' };
  const genreTag = book.category ? `<span class="tag ${g.cls}">${g.emoji} ${safeCategory}</span>` : '';

  return `
    <div class="book-spine">
      <div class="spine-light"></div>
      <div class="spine-text">${spineTitle}</div>
    </div>
    <div class="book-body">
      <div class="book-header">
        <div class="status-badge ${statusClass}">${statusBadge}</div>
        <div class="rating">${renderStarsHTML(safeRating)}</div>
      </div>
      <h3 class="book-title">${safeTitle}</h3>
      <p class="book-author">by ${safeAuthor}</p>
      <div class="book-meta">${metaHTML}</div>
      ${progressHTML}
      <div class="book-tags">
        ${genreTag}
        <span class="tag">${safePages || '?'} pages</span>
      </div>
    </div>`;
}

function getFilteredEntries() {
  const filtered = Object.entries(state.booksData).filter(([, book]) => {
    const matchFilter = state.activeFilter === 'all' || book.status === state.activeFilter;
    const q = state.searchQuery.toLowerCase();
    const matchSearch = !q
      || book.title.toLowerCase().includes(q)
      || book.author.toLowerCase().includes(q)
      || (book.category || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (state.activeSort === 'title-az') filtered.sort((a, b) => a[1].title.localeCompare(b[1].title));
  if (state.activeSort === 'title-za') filtered.sort((a, b) => b[1].title.localeCompare(a[1].title));
  if (state.activeSort === 'rating') filtered.sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0));
  if (state.activeSort === 'pages') filtered.sort((a, b) => (b[1].pages || 0) - (a[1].pages || 0));
  if (state.activeSort === 'added') filtered.reverse();

  return filtered;
}

export function renderBooks() {
  const grid = document.getElementById('books-grid');
  grid.innerHTML = '';

  const entries = getFilteredEntries();
  updateStats(state.activeFilter !== 'all' || state.searchQuery ? entries : undefined);

  if (!entries.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">&gt; NO RECORDS FOUND</div>
        <div class="no-results-sub">Adjust filters or search query</div>
      </div>`;
    return;
  }

  entries.forEach(([id, book], i) => {
    const card = document.createElement('div');
    card.className = `book-card ${getStatusClass(book.status)} card-enter`;
    card.dataset.bookId = id;
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = buildCardHTML(book);
    card.addEventListener('click', () => onOpenDetails(id));
    grid.appendChild(card);
  });
}

export function setFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.filter === filter)
  );
  renderBooks();
}
