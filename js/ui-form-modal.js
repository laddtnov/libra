import { state, saveBooks, debounce, escHtml } from './state.js';
import { searchOpenLibrary } from './ui-search.js';
import { renderBooks } from './ui-render.js';
import { showToast } from './ui-feedback.js';

const CATEGORIES = ['History', 'Fantasy', 'Adventure', 'Historical Fiction', 'Biography', 'Economics', 'Science', 'Philosophy', 'Other'];

function validateBookForm(title, author) {
  let isValid = true;

  if (!title) {
    document.getElementById('f-title').classList.add('input-error');
    isValid = false;
  }

  if (!author) {
    document.getElementById('f-author').classList.add('input-error');
    isValid = false;
  }

  return isValid;
}

function getUniqueBookId(title, existingId) {
  if (existingId) return existingId;

  const base = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
  let id = base;
  let n = 2;

  while (state.booksData[id]) id = `${base}-${n++}`;

  return id;
}

function buildBookPayload({ title, author, status, pages, currentPage, rating, coverId }) {
  const subtitle = document.getElementById('f-subtitle').value.trim();
  const started = document.getElementById('f-started').value.trim();
  const completed = document.getElementById('f-completed').value.trim();
  const synopsis = document.getElementById('f-synopsis').value.trim();

  const book = {
    title,
    author,
    status,
    category: document.getElementById('f-category').value,
    notes: document.getElementById('f-notes').value.split('\n').map(n => n.trim()).filter(Boolean),
  };

  if (subtitle) book.subtitle = subtitle;
  if (pages) book.pages = pages;
  if (rating) book.rating = rating;
  if (coverId) book.coverId = coverId;

  if (status === 'reading') {
    book.currentPage = currentPage;
    book.progress = pages ? Math.round((currentPage / pages) * 100) : 0;
    if (started) book.started = started;
  }

  if (status === 'completed' && completed) {
    book.completed = completed;
  }

  if (synopsis) {
    book.synopsis = synopsis;
  }

  return book;
}

function saveBook() {
  const title = document.getElementById('f-title').value.trim();
  const author = document.getElementById('f-author').value.trim();

  if (!validateBookForm(title, author)) return;

  const status = document.getElementById('f-status').value;
  const pages = Number.parseInt(document.getElementById('f-pages').value, 10) || null;
  const currentPage = Number.parseInt(document.getElementById('f-current-page')?.value, 10) || 0;
  const rating = Number.parseInt(document.getElementById('f-rating').value, 10) || undefined;
  const coverId = Number.parseInt(document.getElementById('f-cover-id')?.value, 10) || undefined;
  const book = buildBookPayload({ title, author, status, pages, currentPage, rating, coverId });

  const id = getUniqueBookId(title, state.editingBookId);
  const isEdit = !!state.editingBookId;
  state.booksData[id] = book;
  saveBooks();
  closeFormModal();
  renderBooks();
  showToast(isEdit ? 'RECORD UPDATED' : 'RECORD SAVED', 'success');
}

export function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
  state.editingBookId = null;
}

export function openFormModal(bookId = null) {
  state.editingBookId = bookId;
  const book = bookId ? state.booksData[bookId] : null;
  const isEdit = !!book;

  const formModal = document.getElementById('form-modal');
  const content = document.getElementById('form-modal-content');
  const overlay = document.getElementById('modal-overlay');

  formModal.style.display = 'flex';
  overlay.style.display = 'block';

  const rv = book?.rating || 0;

  content.innerHTML = `
    <div class="terminal-form">
      <div class="terminal-line">&gt; ${isEdit ? 'MODIFY BOOK RECORD' : 'INITIALIZE NEW BOOK RECORD'}</div>
      <div class="terminal-line form-divider-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      <br>

      ${isEdit ? '' : `
      <div class="book-search-section">
        <div class="terminal-label">&gt; SEARCH OPEN LIBRARY TO AUTO-FILL</div>
        <input type="text" id="book-api-search" class="terminal-input" placeholder="Type a book title..." autocomplete="off" spellcheck="false">
        <div class="search-status" id="search-status"></div>
        <div id="api-search-results" class="api-search-results"></div>
      </div>
      <div class="terminal-line form-or-divider">─────────────── OR FILL IN MANUALLY ───────────────</div>
      <br>
      `}

      <div class="form-field">
        <label class="terminal-label">&gt; TITLE *</label>
        <input id="f-title" class="terminal-input" value="${escHtml(book?.title || '')}" placeholder="Book title">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; SUBTITLE</label>
        <input id="f-subtitle" class="terminal-input" value="${escHtml(book?.subtitle || '')}" placeholder="Optional subtitle">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; AUTHOR *</label>
        <input id="f-author" class="terminal-input" value="${escHtml(book?.author || '')}" placeholder="Author name">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; CATEGORY</label>
        <select id="f-category" class="terminal-select">
          ${CATEGORIES.map(c => `<option value="${c}"${book?.category === c ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; TOTAL PAGES</label>
        <input id="f-pages" class="terminal-input" type="number" min="1" value="${book?.pages || ''}" placeholder="e.g. 464">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; STATUS</label>
        <select id="f-status" class="terminal-select">
          <option value="reading"${book?.status === 'reading' ? ' selected' : ''}>CURRENTLY READING</option>
          <option value="completed"${book?.status === 'completed' ? ' selected' : ''}>COMPLETED</option>
          <option value="to-read"${(!book || book?.status === 'to-read') ? ' selected' : ''}>IN QUEUE</option>
        </select>
      </div>

      <div id="reading-fields" style="display:${book?.status === 'reading' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; CURRENT PAGE</label>
          <input id="f-current-page" class="terminal-input" type="number" min="0" value="${book?.currentPage || ''}" placeholder="Page you're on">
        </div>
        <div class="form-field">
          <label class="terminal-label">&gt; STARTED</label>
          <input id="f-started" class="terminal-input" value="${escHtml(book?.started || '')}" placeholder="e.g. January 2026">
        </div>
      </div>

      <div id="completed-fields" style="display:${book?.status === 'completed' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; COMPLETED DATE</label>
          <input id="f-completed" class="terminal-input" value="${escHtml(book?.completed || '')}" placeholder="e.g. December 2025">
        </div>
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; RATING</label>
        <div class="star-picker" id="star-picker">
          ${Array.from({ length: 5 }, (_, i) =>
            `<span class="star-pick${i < rv ? ' filled' : ''}" data-val="${i + 1}">★</span>`
          ).join('')}
        </div>
        <input type="hidden" id="f-rating" value="${rv}">
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; SYNOPSIS</label>
        <textarea id="f-synopsis" class="terminal-textarea" placeholder="Brief description...">${escHtml(book?.synopsis || '')}</textarea>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; NOTES (one per line)</label>
        <textarea id="f-notes" class="terminal-textarea" placeholder="Your thoughts...">${escHtml((book?.notes || []).join('\n'))}</textarea>
      </div>

      <div class="form-actions">
        <button class="terminal-action-btn save-btn" id="save-book-btn">[ ${isEdit ? 'UPDATE RECORD' : 'CREATE RECORD'} ]</button>
        <button class="terminal-action-btn cancel-btn" id="cancel-form-btn">[ CANCEL ]</button>
      </div>
    </div>`;

  const statusSel = document.getElementById('f-status');
  statusSel.addEventListener('change', () => {
    document.getElementById('reading-fields').style.display = statusSel.value === 'reading' ? 'block' : 'none';
    document.getElementById('completed-fields').style.display = statusSel.value === 'completed' ? 'block' : 'none';
  });

  const picker = document.getElementById('star-picker');
  const ratingHidden = document.getElementById('f-rating');
  picker.addEventListener('click', e => {
    if (!e.target.classList.contains('star-pick')) return;
    const val = Number.parseInt(e.target.dataset.val, 10);
    ratingHidden.value = val;
    picker.querySelectorAll('.star-pick').forEach((s, i) => s.classList.toggle('filled', i < val));
  });
  picker.addEventListener('mouseover', e => {
    if (!e.target.classList.contains('star-pick')) return;
    const val = Number.parseInt(e.target.dataset.val, 10);
    picker.querySelectorAll('.star-pick').forEach((s, i) => s.classList.toggle('hover', i < val));
  });
  picker.addEventListener('mouseleave', () => {
    picker.querySelectorAll('.star-pick').forEach(s => s.classList.remove('hover'));
  });

  if (!isEdit) {
    const searchInput = document.getElementById('book-api-search');
    const statusEl = document.getElementById('search-status');
    const resultsEl = document.getElementById('api-search-results');

    const debouncedSearch = debounce(async (q) => {
      if (q.length < 3) {
        statusEl.textContent = '';
        resultsEl.innerHTML = '';
        return;
      }
      await searchOpenLibrary(q, resultsEl, statusEl);
    }, 420);

    searchInput.addEventListener('input', e => debouncedSearch(e.target.value.trim()));
  }

  ['f-title', 'f-author'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => e.target.classList.remove('input-error'));
  });

  document.getElementById('save-book-btn').addEventListener('click', saveBook);
  document.getElementById('cancel-form-btn').addEventListener('click', closeFormModal);
}
