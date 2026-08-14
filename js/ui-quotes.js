import { state, saveBooks, escHtml } from './state.js';
import { t } from './i18n.js';

function quoteCardHTML(q, i) {
  return `
    <div class="quote-card">
      <div class="quote-text">&ldquo;${escHtml(q.text)}&rdquo;</div>
      <div class="quote-footer">
        ${q.page != null ? `<span class="quote-page">&gt; ${t('quotes_page_label')} ${escHtml(String(q.page))}</span>` : '<span></span>'}
        <button class="quote-delete-btn" data-idx="${i}">[&times;]</button>
      </div>
    </div>`;
}

function refreshList(bookId) {
  const listEl = document.getElementById('quotes-list');
  if (!listEl) return;
  const quotes = state.booksData[bookId]?.quotes || [];
  listEl.innerHTML = quotes.length
    ? quotes.map((q, i) => quoteCardHTML(q, i)).join('')
    : `<div class="quotes-empty">&gt; ${t('quotes_empty')}</div>`;
  bindDeleteButtons(bookId);
}

function bindDeleteButtons(bookId) {
  document.querySelectorAll('.quote-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number.parseInt(btn.dataset.idx, 10);
      const book = state.booksData[bookId];
      if (!book?.quotes) return;
      book.quotes.splice(idx, 1);
      saveBooks();
      refreshList(bookId);
    });
  });
}

export function renderQuotesSection(bookId) {
  const quotes = state.booksData[bookId]?.quotes || [];
  const listHTML = quotes.length
    ? quotes.map((q, i) => quoteCardHTML(q, i)).join('')
    : `<div class="quotes-empty">&gt; ${t('quotes_empty')}</div>`;

  return `
    <div class="detail-section">
      <div class="detail-section-title">&gt;&gt; ${t('quotes_title')}</div>
      <div id="quotes-list">${listHTML}</div>
      <div class="quotes-add-form">
        <textarea id="q-text" class="quote-textarea" placeholder="${t('quotes_ph_text')}"></textarea>
        <div class="quotes-add-row">
          <input id="q-page" class="quote-page-input" type="number" min="1" placeholder="${t('quotes_ph_page')}">
          <button id="q-add-btn" class="quote-add-btn">${t('quotes_btn_add')}</button>
        </div>
      </div>
    </div>`;
}

export function initQuotesSection(bookId) {
  bindDeleteButtons(bookId);

  document.getElementById('q-add-btn')?.addEventListener('click', () => {
    const textEl = document.getElementById('q-text');
    const pageEl = document.getElementById('q-page');
    const text = textEl.value.trim();
    if (!text) {
      textEl.classList.add('input-error');
      setTimeout(() => textEl.classList.remove('input-error'), 600);
      return;
    }
    const page = Number.parseInt(pageEl.value, 10) || null;

    const book = state.booksData[bookId];
    if (!book) return;
    if (!book.quotes) book.quotes = [];
    book.quotes.push({ text, page });
    saveBooks();
    refreshList(bookId);

    textEl.value = '';
    pageEl.value = '';
    textEl.focus();
  });
}
