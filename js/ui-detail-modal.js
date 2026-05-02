import { state, saveBooks, clamp, toPositiveInt, toNonNegativeInt, escHtml } from './state.js';
import { playClickSound, toggleSound, showToast } from './ui-feedback.js';
import { renderStarsHTML, renderBooks } from './ui-render.js';
import { toggleBookInList, removeBookFromAllLists, renderListsPanel } from './ui-lists.js';

let onOpenFormModal = () => {};

export function configureDetailHandlers({ openFormModal }) {
  onOpenFormModal = openFormModal;
}

export function closeModal() {
  document.getElementById('book-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function confirmDelete(bookId) {
  const book = state.booksData[bookId];
  const actions = document.getElementById('detail-actions');
  actions.innerHTML = `
    <div class="delete-confirm">
      <div class="delete-warn">&gt; Delete &quot;${escHtml(book.title)}&quot;? This cannot be undone.</div>
      <div class="delete-confirm-btns">
        <button class="terminal-action-btn delete-btn" id="confirm-yes">[ YES, DELETE ]</button>
        <button class="terminal-action-btn cancel-btn" id="confirm-no">[ CANCEL ]</button>
      </div>
    </div>`;

  document.getElementById('confirm-yes').addEventListener('click', () => {
    const title = state.booksData[bookId]?.title || 'RECORD';
    removeBookFromAllLists(bookId);
    delete state.booksData[bookId];
    saveBooks();
    closeModal();
    renderBooks();
    showToast(`${title.toUpperCase()} DELETED`, 'delete');
  });

  document.getElementById('confirm-no').addEventListener('click', () => {
    actions.innerHTML = `
      <button class="terminal-action-btn edit-btn" id="detail-edit">[ EDIT ]</button>
      <button class="terminal-action-btn delete-btn" id="detail-delete">[ DELETE ]</button>`;
    document.getElementById('detail-edit').addEventListener('click', () => {
      closeModal();
      onOpenFormModal(bookId);
    });
    document.getElementById('detail-delete').addEventListener('click', () => confirmDelete(bookId));
  });
}

export function showBookDetails(bookId) {
  const book = state.booksData[bookId];
  if (!book) return;

  playClickSound();

  const modal = document.getElementById('book-modal');
  const content = document.getElementById('modal-content');
  const overlay = document.getElementById('modal-overlay');

  modal.style.display = 'flex';
  overlay.style.display = 'block';

  const soundSlot = document.getElementById('modal-sound-slot');
  soundSlot.innerHTML = '';
  const soundBtn = document.createElement('button');
  soundBtn.id = 'sound-toggle';
  soundBtn.className = 'sound-toggle-btn';
  soundBtn.textContent = state.soundEnabled ? '🔊 ON' : '🔇 OFF';
  soundBtn.style.color = state.soundEnabled ? '' : '#666';
  soundBtn.onclick = toggleSound;
  soundSlot.appendChild(soundBtn);

  const safeCoverId = toPositiveInt(book.coverId);
  const safeTitle = escHtml((book.title || '').toUpperCase());
  const safeSubtitle = escHtml(book.subtitle || '');
  const safeAuthor = escHtml(book.author || 'Unknown');
  const safeStatus = escHtml(String(book.status || 'to-read').toUpperCase().replace('-', ' '));
  const safeCategory = escHtml(book.category || '—');
  const safePages = toPositiveInt(book.pages);
  const safeCurrentPage = toNonNegativeInt(book.currentPage, 0);
  const safeProgress = clamp(toNonNegativeInt(book.progress, 0), 0, 100);
  const safeStarted = escHtml(book.started || '—');
  const safeCompleted = escHtml(book.completed || '—');
  const safeRating = clamp(toNonNegativeInt(book.rating, 0), 0, 5);

  const coverHTML = safeCoverId
    ? `<img class="detail-cover" src="https://covers.openlibrary.org/b/id/${safeCoverId}-M.jpg" alt="cover" loading="lazy">`
    : `<div class="detail-cover-placeholder">${escHtml((book.title || '?').charAt(0).toUpperCase())}</div>`;

  let statusRows = '';
  if (book.status === 'reading') {
    statusRows = `
      <div class="detail-row"><span class="detail-key">&gt; STARTED</span><span class="detail-val">${safeStarted}</span></div>
      <div class="detail-row"><span class="detail-key">&gt; CURRENT PAGE</span><span class="detail-val">${safeCurrentPage} / ${safePages || '?'}</span></div>
      <div class="detail-row"><span class="detail-key">&gt; PROGRESS</span><span class="detail-val">${safeProgress}%</span></div>`;
  } else if (book.status === 'completed') {
    statusRows = `
      <div class="detail-row"><span class="detail-key">&gt; COMPLETED</span><span class="detail-val">${safeCompleted}</span></div>`;
  }

  const notesHTML = book.notes?.length
    ? book.notes.map((n, i) => `<div class="detail-note">${i + 1}. ${escHtml(n)}</div>`).join('')
    : `<div class="detail-note muted">No notes added yet.</div>`;

  content.innerHTML = `
    <div class="detail-panel">
      <div class="detail-prompt">&gt; BOOK.ARCHIVE // RECORD RETRIEVED</div>
      <div class="detail-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="detail-hero">
        ${coverHTML}
        <div class="detail-hero-text">
          <div class="detail-title">${safeTitle}</div>
          ${book.subtitle ? `<div class="detail-subtitle">${safeSubtitle}</div>` : ''}
          <div class="detail-author">by ${safeAuthor}</div>
          <div class="detail-stars">${renderStarsHTML(safeRating)}</div>
        </div>
      </div>

      <div class="detail-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="detail-fields">
        <div class="detail-row"><span class="detail-key">&gt; STATUS</span><span class="detail-val">${safeStatus}</span></div>
        <div class="detail-row"><span class="detail-key">&gt; CATEGORY</span><span class="detail-val">${safeCategory}</span></div>
        <div class="detail-row"><span class="detail-key">&gt; PAGES</span><span class="detail-val">${safePages || '?'}</span></div>
        ${statusRows}
      </div>

      ${book.synopsis ? `
      <div class="detail-section">
        <div class="detail-section-title">&gt;&gt; SYNOPSIS</div>
        <div class="detail-section-body">${escHtml(book.synopsis)}</div>
      </div>` : ''}

      <div class="detail-section">
        <div class="detail-section-title">&gt;&gt; NOTES</div>
        <div class="detail-section-body">${notesHTML}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">&gt;&gt; READING LISTS</div>
        <div class="detail-lists-body" id="detail-lists-body"></div>
      </div>

      <div class="modal-actions" id="detail-actions">
        <button class="terminal-action-btn edit-btn" id="detail-edit">[ EDIT ]</button>
        <button class="terminal-action-btn delete-btn" id="detail-delete">[ DELETE ]</button>
      </div>
    </div>`;

  document.getElementById('detail-edit').addEventListener('click', () => {
    closeModal();
    onOpenFormModal(bookId);
  });

  document.getElementById('detail-delete').addEventListener('click', () => {
    confirmDelete(bookId);
  });

  renderDetailListsSection(bookId);
}

function renderDetailListsSection(bookId) {
  const body = document.getElementById('detail-lists-body');
  if (!body) return;

  const lists = Object.values(state.lists);
  if (!lists.length) {
    body.innerHTML = `<span class="detail-lists-empty">&gt; No lists yet — open LISTS to create one.</span>`;
    return;
  }

  body.innerHTML = lists.map(list => {
    const inList = list.bookIds.includes(bookId);
    return `
      <button class="detail-list-toggle${inList ? ' in-list' : ''}" data-list-id="${escHtml(list.id)}">
        ${inList ? '✓' : '+'} ${escHtml(list.name)}
      </button>`;
  }).join('');

  body.querySelectorAll('.detail-list-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBookInList(btn.dataset.listId, bookId);
      renderListsPanel();
      renderDetailListsSection(bookId);
    });
  });
}
