import { state, saveBooks, escHtml, toPositiveInt } from './state.js';
import { t } from './i18n.js';

function sessionRowHTML(s, idx) {
  return `
    <div class="session-row">
      <span class="session-date">${escHtml(s.date)}</span>
      <span class="session-pages">+${s.pages} ${t('sessions_pages_unit')}</span>
      <button class="session-delete-btn" data-idx="${idx}">[×]</button>
    </div>`;
}

function buildListHTML(sessions) {
  if (!sessions.length) {
    return `<div class="sessions-empty">&gt; ${t('sessions_empty')}</div>`;
  }
  const total = sessions.reduce((sum, s) => sum + s.pages, 0);
  const rows = [...sessions]
    .map((s, i) => ({ s, i }))
    .reverse()
    .map(({ s, i }) => sessionRowHTML(s, i))
    .join('');
  return `<div class="sessions-total">&gt; ${t('sessions_total')}: ${total} ${t('sessions_pages_unit')}</div>${rows}`;
}

function refreshList(bookId) {
  const listEl = document.getElementById('sessions-list');
  if (!listEl) return;
  listEl.innerHTML = buildListHTML(state.booksData[bookId]?.sessions || []);
  bindDeleteButtons(bookId);
}

function bindDeleteButtons(bookId) {
  document.querySelectorAll('.session-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number.parseInt(btn.dataset.idx, 10);
      const book = state.booksData[bookId];
      if (!book?.sessions) return;
      book.sessions.splice(idx, 1);
      saveBooks();
      refreshList(bookId);
    });
  });
}

export function renderSessionsSection(bookId) {
  const sessions = state.booksData[bookId]?.sessions || [];
  const today = new Date().toISOString().slice(0, 10);

  return `
    <div class="detail-section">
      <div class="detail-section-title">&gt;&gt; ${t('sessions_title')}</div>
      <div id="sessions-list">${buildListHTML(sessions)}</div>
      <div class="sessions-add-form">
        <div class="sessions-add-row">
          <input id="s-date" class="session-date-input" type="date" value="${today}">
          <input id="s-pages" class="session-pages-input" type="number" min="1" placeholder="${t('sessions_ph_pages')}">
          <button id="s-add-btn" class="session-add-btn">${t('sessions_btn_add')}</button>
        </div>
      </div>
    </div>`;
}

export function initSessionsSection(bookId) {
  bindDeleteButtons(bookId);

  document.getElementById('s-add-btn')?.addEventListener('click', () => {
    const dateEl = document.getElementById('s-date');
    const pagesEl = document.getElementById('s-pages');
    const date = dateEl.value.trim();
    const pages = toPositiveInt(pagesEl.value);

    if (!date) {
      dateEl.classList.add('input-error');
      setTimeout(() => dateEl.classList.remove('input-error'), 600);
      return;
    }
    if (!pages) {
      pagesEl.classList.add('input-error');
      setTimeout(() => pagesEl.classList.remove('input-error'), 600);
      return;
    }

    const book = state.booksData[bookId];
    if (!book) return;
    if (!book.sessions) book.sessions = [];
    book.sessions.push({ date, pages });
    saveBooks();
    refreshList(bookId);

    pagesEl.value = '';
    pagesEl.focus();
  });
}
