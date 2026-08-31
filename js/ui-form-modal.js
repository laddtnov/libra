import { state, saveBooks, debounce, escHtml, anchorPageBaseline, carryOverUneditedFields } from './state.js';
import { searchOpenLibrary } from './ui-search.js';
import { renderBooks } from './ui-render.js';
import { showToast } from './ui-feedback.js';
import { t } from './i18n.js';
import { trapFocus, focusFirst } from './ui-utils.js';

let _releaseTrap = null;   // focus-trap cleanup fn
let _triggerEl = null;     // element to restore focus to on close

const CATEGORIES = ['History', 'Fantasy', 'Adventure', 'Historical Fiction', 'Biography', 'Economics', 'Science', 'Philosophy', 'Other'];

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
  if (error) {
    error.textContent = message;
    error.classList.remove('sr-only');
  }
}

function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  if (error) {
    error.textContent = '';
    error.classList.add('sr-only');
  }
}

function validateBookForm(title, author) {
  let isValid = true;

  if (!title) {
    setFieldError('f-title', 'f-title-error', t('form_err_title_required'));
    isValid = false;
  }

  if (!author) {
    setFieldError('f-author', 'f-author-error', t('form_err_author_required'));
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

  const tagsRaw = document.getElementById('f-tags')?.value || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  const book = {
    title,
    author,
    status,
    category: document.getElementById('f-category').value,
    notes: document.getElementById('f-notes').value.split('\n').map(n => n.trim()).filter(Boolean),
  };
  if (tags.length) book.tags = tags;

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

  // The form owns only the fields it renders, but saving replaced the whole
  // record — so editing a book silently destroyed its session log and quotes,
  // even when nothing on the form was changed.
  carryOverUneditedFields(book, isEdit ? state.booksData[state.editingBookId] : null);

  // The page field is what the reader just told us, so it wins: re-anchor the
  // baseline to it and let the session log go on counting up from there.
  if (book.status === 'reading') anchorPageBaseline(book);

  state.booksData[id] = book;
  saveBooks();
  closeFormModal();
  renderBooks();
  showToast(isEdit ? t('toast_updated') : t('toast_saved'), 'success');
}

export function closeFormModal() {
  document.getElementById('form-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
  state.editingBookId = null;

  if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
  if (_triggerEl) { _triggerEl.focus?.(); _triggerEl = null; }
}

// ── openFormModal sub-routines ─────────────────────────────────────────────
// All dynamic values interpolated into the template go through escHtml() —
// no raw user content reaches innerHTML.

function buildFormHtml(book, isEdit, rv) {
  return `
    <div class="terminal-form">
      <div class="terminal-line">&gt; ${isEdit ? t('form_modify_record') : t('form_new_record')}</div>
      <div class="terminal-line form-divider-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      <br>

      ${isEdit ? '' : `
      <div class="book-search-section">
        <div class="terminal-label">&gt; ${t('form_search_label')}</div>
        <input type="text" id="book-api-search" class="terminal-input" placeholder="${t('form_search_ph')}" autocomplete="off" spellcheck="false">
        <div class="search-status" id="search-status"></div>
        <div id="api-search-results" class="api-search-results"></div>
      </div>
      <div class="terminal-line form-or-divider">─────────────── ${t('form_or_manual')} ───────────────</div>
      <br>
      `}

      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_title')}</label>
        <input id="f-title" class="terminal-input" value="${escHtml(book?.title || '')}" placeholder="${t('form_ph_title')}">
        <span id="f-title-error" class="field-error sr-only" role="alert"></span>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_subtitle')}</label>
        <input id="f-subtitle" class="terminal-input" value="${escHtml(book?.subtitle || '')}" placeholder="${t('form_ph_subtitle')}">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_author')}</label>
        <input id="f-author" class="terminal-input" value="${escHtml(book?.author || '')}" placeholder="${t('form_ph_author')}">
        <span id="f-author-error" class="field-error sr-only" role="alert"></span>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_category')}</label>
        <select id="f-category" class="terminal-select">
          ${CATEGORIES.map(c => `<option value="${escHtml(c)}"${book?.category === c ? ' selected' : ''}>${escHtml(c)}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_pages')}</label>
        <input id="f-pages" class="terminal-input" type="number" min="1" value="${escHtml(book?.pages || '')}" placeholder="${t('form_ph_pages')}">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_status')}</label>
        <select id="f-status" class="terminal-select">
          <option value="reading"${book?.status === 'reading' ? ' selected' : ''}>${t('form_opt_reading')}</option>
          <option value="completed"${book?.status === 'completed' ? ' selected' : ''}>${t('form_opt_completed')}</option>
          <option value="to-read"${(!book || book?.status === 'to-read') ? ' selected' : ''}>${t('form_opt_queued')}</option>
        </select>
      </div>

      <div id="reading-fields" style="display:${book?.status === 'reading' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; ${t('form_lbl_cur_page')}</label>
          <input id="f-current-page" class="terminal-input" type="number" min="0" value="${escHtml(book?.currentPage || '')}" placeholder="${t('form_ph_cur_page')}">
        </div>
        <div class="form-field">
          <label class="terminal-label">&gt; ${t('form_lbl_started')}</label>
          <input id="f-started" class="terminal-input" value="${escHtml(book?.started || '')}" placeholder="${t('form_ph_started')}">
        </div>
      </div>

      <div id="completed-fields" style="display:${book?.status === 'completed' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; ${t('form_lbl_completed')}</label>
          <input id="f-completed" class="terminal-input" value="${escHtml(book?.completed || '')}" placeholder="${t('form_ph_completed')}">
        </div>
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_rating')}</label>
        <div class="star-picker" id="star-picker">
          ${Array.from({ length: 5 }, (_, i) =>
            `<span class="star-pick${i < rv ? ' filled' : ''}" data-val="${i + 1}">★</span>`
          ).join('')}
        </div>
        <input type="hidden" id="f-rating" value="${rv}">
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_synopsis')}</label>
        <textarea id="f-synopsis" class="terminal-textarea" placeholder="${t('form_ph_synopsis')}">${escHtml(book?.synopsis || '')}</textarea>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; ${t('form_lbl_notes')}</label>
        <textarea id="f-notes" class="terminal-textarea" placeholder="${t('form_ph_notes')}">${escHtml((book?.notes || []).join('\n'))}</textarea>
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; TAGS</label>
        <div class="tags-input-wrap" id="tags-wrap">
          ${(book?.tags || []).map(tag => `<span class="tag-chip" data-tag="${escHtml(tag)}">${escHtml(tag)} <span class="tag-chip-x">×</span></span>`).join('')}
          <input id="f-tag-input" class="tag-text-input" placeholder="add tag + Enter" maxlength="30" autocomplete="off">
        </div>
        <input type="hidden" id="f-tags" value="${escHtml((book?.tags || []).join(','))}">
      </div>

      <div class="form-actions">
        <button class="terminal-action-btn save-btn" id="save-book-btn">[ ${isEdit ? t('form_btn_update') : t('form_btn_create')} ]</button>
        <button class="terminal-action-btn cancel-btn" id="cancel-form-btn">[ ${t('form_btn_cancel')} ]</button>
      </div>
    </div>`;
}

function initTagChips() {
  const tagsWrap   = document.getElementById('tags-wrap');
  const tagsHidden = document.getElementById('f-tags');
  const tagInput   = document.getElementById('f-tag-input');

  function getTags()    { return tagsHidden.value.split(',').map(t => t.trim()).filter(Boolean); }
  function setTags(arr) { tagsHidden.value = [...new Set(arr)].join(','); }

  function addTagChip(tag) {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.dataset.tag = tag;
    chip.innerHTML = `${escHtml(tag)} <span class="tag-chip-x">×</span>`;
    chip.querySelector('.tag-chip-x').addEventListener('click', () => {
      chip.remove();
      setTags(getTags().filter(t => t !== tag));
    });
    tagInput.before(chip);
  }

  tagInput?.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = tagInput.value.trim().toLowerCase().replaceAll(/[^a-z0-9-_ ]/g, '').slice(0, 30);
    if (!val || getTags().includes(val)) { tagInput.value = ''; return; }
    setTags([...getTags(), val]);
    addTagChip(val);
    tagInput.value = '';
  });

  tagsWrap?.querySelectorAll('.tag-chip').forEach(chip => {
    chip.querySelector('.tag-chip-x')?.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      chip.remove();
      setTags(getTags().filter(t => t !== tag));
    });
  });
}

function initStarPicker() {
  const picker       = document.getElementById('star-picker');
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
}

function initStatusToggle() {
  const statusSel = document.getElementById('f-status');
  statusSel.addEventListener('change', () => {
    document.getElementById('reading-fields').style.display   = statusSel.value === 'reading'   ? 'block' : 'none';
    document.getElementById('completed-fields').style.display = statusSel.value === 'completed' ? 'block' : 'none';
  });
}

function initSearchWiring() {
  const searchInput = document.getElementById('book-api-search');
  const statusEl    = document.getElementById('search-status');
  const resultsEl   = document.getElementById('api-search-results');

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

// ── Public API ─────────────────────────────────────────────────────────────

export function openFormModal(bookId = null) {
  state.editingBookId = bookId;
  const book   = bookId ? state.booksData[bookId] : null;
  const isEdit = !!book;

  const formModal = document.getElementById('form-modal');
  const content   = document.getElementById('form-modal-content');
  const overlay   = document.getElementById('modal-overlay');

  formModal.style.display = 'flex';
  overlay.style.display   = 'block';

  content.innerHTML = buildFormHtml(book, isEdit, book?.rating || 0);

  initTagChips();
  initStarPicker();
  initStatusToggle();
  if (!isEdit) initSearchWiring();

  [['f-title', 'f-title-error'], ['f-author', 'f-author-error']].forEach(([inputId, errorId]) => {
    document.getElementById(inputId)?.addEventListener('input', () => clearFieldError(inputId, errorId));
  });

  document.getElementById('save-book-btn').addEventListener('click', saveBook);
  document.getElementById('cancel-form-btn').addEventListener('click', closeFormModal);

  _triggerEl = document.activeElement;
  _releaseTrap = trapFocus(formModal, closeFormModal);
  focusFirst(formModal);
}
