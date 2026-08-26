import { state, clamp, toPositiveInt, toNonNegativeInt, escHtml } from './state.js';
import { t } from './i18n.js';
import { isSelectMode, isSelected, toggleBookSelection, renderBulkBar } from './ui-bulk.js';

const GENRE_SVGS = {
  History: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="2.5" x2="2" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="7" y1="1.5" x2="7" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="12" y1="2.5" x2="12" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="1" y1="10" x2="13" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="1" y1="2.5" x2="13" y2="2.5" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  </svg>`,
  Fantasy: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="7,1 12,5 10,12.5 4,12.5 2,5" stroke="currentColor" stroke-width="1.2"/>
    <line x1="2" y1="5" x2="12" y2="5" stroke="currentColor" stroke-width="0.9" opacity="0.55"/>
    <line x1="7" y1="1" x2="4" y2="12.5" stroke="currentColor" stroke-width="0.7" opacity="0.3"/>
    <line x1="7" y1="1" x2="10" y2="12.5" stroke="currentColor" stroke-width="0.7" opacity="0.3"/>
  </svg>`,
  Adventure: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/>
    <polygon points="7,2.5 8.3,6.3 7,5.5 5.7,6.3" fill="currentColor"/>
    <polygon points="7,11.5 5.7,7.7 7,8.5 8.3,7.7" fill="currentColor" opacity="0.5"/>
    <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.6"/>
  </svg>`,
  'Historical Fiction': `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="1,11 1,5.5 4.5,8 7,2 9.5,8 13,5.5 13,11" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
    <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
  Biography: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.2"/>
    <path d="M2 13C2 9.5 4.5 8 7 8C9.5 8 12 9.5 12 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
  Economics: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="7.5" width="2.5" height="4.5" stroke="currentColor" stroke-width="1.1" rx="0.3"/>
    <rect x="5.75" y="5" width="2.5" height="7" stroke="currentColor" stroke-width="1.1" rx="0.3"/>
    <rect x="10" y="2" width="2.5" height="10" stroke="currentColor" stroke-width="1.1" rx="0.3"/>
  </svg>`,
  Science: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="1.3" fill="currentColor"/>
    <ellipse cx="7" cy="7" rx="5.5" ry="2" stroke="currentColor" stroke-width="1"/>
    <ellipse cx="7" cy="7" rx="5.5" ry="2" stroke="currentColor" stroke-width="1" transform="rotate(60 7 7)"/>
    <ellipse cx="7" cy="7" rx="5.5" ry="2" stroke="currentColor" stroke-width="1" transform="rotate(-60 7 7)"/>
  </svg>`,
  Philosophy: `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4.5" cy="7" r="3.5" stroke="currentColor" stroke-width="1.1"/>
    <circle cx="9.5" cy="7" r="3.5" stroke="currentColor" stroke-width="1.1"/>
  </svg>`,
};
const GENRE_DEFAULT_SVG = `<svg class="genre-svg" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="1" width="10" height="12" rx="1" stroke="currentColor" stroke-width="1.2"/>
  <line x1="5" y1="1" x2="5" y2="13" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <line x1="7" y1="4" x2="10" y2="4" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
  <line x1="7" y1="6.5" x2="10" y2="6.5" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
</svg>`;

const GENRE_META = {
  History:            { cls: 'history' },
  Fantasy:            { cls: 'fantasy' },
  Adventure:          { cls: 'adventure' },
  'Historical Fiction': { cls: 'fiction' },
  Biography:          { cls: 'biography' },
  Economics:          { cls: 'economics' },
  Science:            { cls: 'science' },
  Philosophy:         { cls: 'philosophy' },
};

let onOpenDetails = () => {};

const STATUS_SVGS = {
  completed: `<svg class="status-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5" stroke="currentColor" stroke-width="1.2"/>
    <polyline points="5,8.5 7,11 11,5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  reading: `<svg class="status-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 8 C4 3.5 12 3.5 15 8 C12 12.5 4 12.5 1 8Z" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
  </svg>`,
  'to-read': `<svg class="status-svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2" width="14" height="3.5" rx="1" stroke="currentColor" stroke-width="1.2"/>
    <rect x="1" y="7" width="10" height="3.5" rx="1" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
    <rect x="1" y="12" width="6" height="3.5" rx="1" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>
  </svg>`,
};

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
  import('./ui-goal.js').then(({ renderGoal }) => renderGoal()).catch(() => {});
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
    reading:   `<span class="status-icon">${STATUS_SVGS.reading}</span><span>${t('status_reading')}</span>`,
    completed: `<span class="status-icon">${STATUS_SVGS.completed}</span><span>${t('status_completed')}</span>`,
    'to-read': `<span class="status-icon">${STATUS_SVGS['to-read']}</span><span>${t('status_to_read')}</span>`,
  }[book.status] || '';

  let metaHTML = '';
  if (book.status === 'reading') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">${t('meta_progress')}:</span><span class="meta-value">${safeCurrentPage}/${safePages || '?'} pages (${safeProgress}%)</span></div>
      <div class="meta-item"><span class="meta-label">${t('meta_started')}:</span><span class="meta-value">${safeStarted}</span></div>`;
  } else if (book.status === 'completed') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">${t('meta_completed')}:</span><span class="meta-value">${safeCompleted}</span></div>
      <div class="meta-item"><span class="meta-label">${t('meta_rating')}:</span><span class="meta-value">${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)} ${safeRating}/5</span></div>`;
  } else {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">${t('meta_status')}:</span><span class="meta-value">${t('meta_in_queue')}</span></div>
      <div class="meta-item"><span class="meta-label">${t('meta_pages')}:</span><span class="meta-value">${safePages || '?'}</span></div>`;
  }

  const safeCoverId = toPositiveInt(book.coverId);
  const coverHTML = safeCoverId
    ? `<img class="card-cover" src="https://covers.openlibrary.org/b/id/${safeCoverId}-S.jpg" alt="" loading="lazy" data-cover-fallback="remove">`
    : '';

  const progressHTML = book.status === 'reading'
    ? `<div class="progress-ring-wrap">
        <svg class="progress-ring" viewBox="0 0 36 36" aria-label="${safeProgress}% read">
          <circle class="ring-track" cx="18" cy="18" r="15.9155"/>
          <circle class="ring-fill"  cx="18" cy="18" r="15.9155"
            stroke-dasharray="${safeProgress} 100"/>
        </svg>
        <span class="ring-label">${safeProgress}%</span>
      </div>`
    : '';

  const g = GENRE_META[book.category] || { cls: '' };
  const genreSvg = GENRE_SVGS[book.category] || GENRE_DEFAULT_SVG;
  const genreTag = book.category ? `<span class="tag ${g.cls}">${genreSvg} ${safeCategory}</span>` : '';

  return `
    <div class="book-spine">
      <div class="spine-light"></div>
      <div class="spine-text">${spineTitle}</div>
    </div>
    ${coverHTML}
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
        ${(book.tags || []).map(tag => `<span class="tag tag-custom">${escHtml(tag)}</span>`).join('')}
      </div>
    </div>`;
}

function getFilteredEntries() {
  const activeListIds = state.activeList ? state.lists[state.activeList]?.bookIds : null;

  const filtered = Object.entries(state.booksData).filter(([id, book]) => {
    const matchFilter = state.activeFilter === 'all' || book.status === state.activeFilter;
    const matchList = !activeListIds || activeListIds.includes(id);
    const q = state.searchQuery.toLowerCase();
    const matchSearch = !q
      || book.title.toLowerCase().includes(q)
      || book.author.toLowerCase().includes(q)
      || (book.category || '').toLowerCase().includes(q)
      || (book.tags || []).some(tag => tag.includes(q));
    return matchFilter && matchList && matchSearch;
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
  renderBulkBar();

  if (!entries.length) {
    // With a query active, the shelf coming up empty is the moment to offer the
    // web — app-ui.js owns the click, so ui-render never has to import discover.
    const webBtn = state.searchQuery
      ? `<button class="search-web-btn" id="search-web-btn">&gt; ${t('search_web')}</button>`
      : '';
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">${t('no_records')}</div>
        <div class="no-results-sub">${t('no_records_sub')}</div>
        ${webBtn}
      </div>`;
    return;
  }

  const MAX_TILT = 8;

  const selectMode = isSelectMode();

  entries.forEach(([id, book], i) => {
    const card = document.createElement('div');
    card.className = `book-card ${getStatusClass(book.status)} card-enter`;
    if (selectMode) card.classList.add('selectable');
    if (selectMode && isSelected(id)) card.classList.add('selected');
    card.dataset.bookId = id;
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = buildCardHTML(book);

    if (selectMode) {
      const checkbox = document.createElement('div');
      checkbox.className = 'card-select-checkbox';
      checkbox.textContent = isSelected(id) ? '✓' : '';
      card.appendChild(checkbox);
    }

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const cardTitle = book.title || 'Untitled';
    let ariaLabel;
    if (selectMode) {
      const selectAction = isSelected(id) ? 'deselect' : 'select';
      ariaLabel = `${cardTitle} — ${selectAction}`;
    } else {
      ariaLabel = `${cardTitle} by ${book.author || 'Unknown'} — ${t('open_details')}`;
    }
    card.setAttribute('aria-label', ariaLabel);

    const activate = () => selectMode ? toggleBookSelection(id) : onOpenDetails(id);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease';
      card.style.transform = `perspective(800px) rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(x * MAX_TILT).toFixed(2)}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
    });

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
