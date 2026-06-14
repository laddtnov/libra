import { state, saveBooks, escHtml, cleanText } from './state.js';
import { t } from './i18n.js';

function noteCardHTML(note, i) {
  return `
    <div class="note-card">
      <div class="note-text">${escHtml(note)}</div>
      <button class="note-delete-btn" data-idx="${i}">[&times;]</button>
    </div>`;
}

function listHTML(notes) {
  return notes.length
    ? notes.map((n, i) => noteCardHTML(n, i)).join('')
    : `<div class="notes-empty">&gt; ${t('notes_empty')}</div>`;
}

function refreshList(bookId) {
  const listEl = document.getElementById('notes-list');
  if (!listEl) return;
  const notes = state.booksData[bookId]?.notes || [];
  listEl.innerHTML = listHTML(notes);
  bindDeleteButtons(bookId);
}

function bindDeleteButtons(bookId) {
  document.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number.parseInt(btn.dataset.idx, 10);
      const book = state.booksData[bookId];
      if (!book?.notes) return;
      book.notes.splice(idx, 1);
      saveBooks();
      refreshList(bookId);
    });
  });
}

export function renderNotesSection(bookId) {
  const notes = state.booksData[bookId]?.notes || [];

  return `
    <div class="detail-section">
      <div class="detail-section-title">&gt;&gt; ${t('notes_title')}</div>
      <div id="notes-list">${listHTML(notes)}</div>
      <div class="notes-add-form">
        <textarea id="note-text" class="note-textarea" placeholder="${t('notes_ph_text')}"></textarea>
        <button id="note-add-btn" class="note-add-btn">${t('notes_btn_add')}</button>
      </div>
    </div>`;
}

export function initNotesSection(bookId) {
  bindDeleteButtons(bookId);

  document.getElementById('note-add-btn')?.addEventListener('click', () => {
    const textEl = document.getElementById('note-text');
    const text = cleanText(textEl.value, 260);
    if (!text) {
      textEl.classList.add('input-error');
      setTimeout(() => textEl.classList.remove('input-error'), 600);
      return;
    }

    const book = state.booksData[bookId];
    if (!book) return;
    if (!book.notes) book.notes = [];
    book.notes.push(text);
    saveBooks();
    refreshList(bookId);

    textEl.value = '';
    textEl.focus();
  });
}
