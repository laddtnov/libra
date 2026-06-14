import { state, saveBooks, escHtml, cleanText } from './state.js';
import { renderBooks } from './ui-render.js';
import { showToast } from './ui-feedback.js';
import { removeBookFromAllLists, toggleBookInList } from './ui-lists.js';
import { t } from './i18n.js';

export function isSelectMode() {
  return state.selectMode;
}

export function isSelected(id) {
  return state.selectedIds.has(id);
}

export function toggleSelectMode() {
  state.selectMode = !state.selectMode;
  state.selectedIds.clear();
  renderBooks();
  updateSelectBtn();
}

export function toggleBookSelection(id) {
  if (state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  renderBooks();
}

export function updateSelectBtn() {
  const btn = document.getElementById('select-mode-btn');
  if (!btn) return;
  btn.classList.toggle('active', state.selectMode);
  btn.textContent = state.selectMode ? t('btn_select_done') : t('btn_select');
}

function selectedIdsInView() {
  return [...document.querySelectorAll('#books-grid .book-card[data-book-id]')]
    .map(card => card.dataset.bookId)
    .filter(id => state.booksData[id]);
}

function selectAllVisible() {
  for (const id of selectedIdsInView()) state.selectedIds.add(id);
  renderBooks();
}

function deleteSelected() {
  const ids = [...state.selectedIds];
  const bar = document.getElementById('bulk-action-bar');
  bar.innerHTML = `
    <div class="bulk-delete-confirm">
      <span class="bulk-delete-warn">&gt; ${escHtml(t('bulk_delete_confirm').replace('{n}', ids.length))}</span>
      <button class="terminal-action-btn delete-btn" id="bulk-confirm-yes">${t('bulk_yes_delete')}</button>
      <button class="terminal-action-btn cancel-btn" id="bulk-confirm-no">${t('bulk_cancel')}</button>
    </div>`;

  document.getElementById('bulk-confirm-yes').addEventListener('click', () => {
    for (const id of ids) {
      removeBookFromAllLists(id);
      delete state.booksData[id];
    }
    saveBooks();
    state.selectedIds.clear();
    state.selectMode = false;
    renderBooks();
    updateSelectBtn();
    showToast(t('bulk_deleted_toast').replace('{n}', ids.length), 'delete');
  });

  document.getElementById('bulk-confirm-no').addEventListener('click', renderBulkBar);
}

function applyTagToSelected(input) {
  const tag = cleanText(input.value, 30).toLowerCase().trim();
  if (!tag) return;
  const ids = [...state.selectedIds];
  for (const id of ids) {
    const book = state.booksData[id];
    if (!book) continue;
    book.tags = book.tags || [];
    if (!book.tags.includes(tag)) book.tags.push(tag);
  }
  saveBooks();
  input.value = '';
  renderBooks();
  showToast(t('bulk_tagged_toast').replace('{n}', ids.length).replace('{tag}', tag), 'success');
}

function moveSelectedToList(listId) {
  if (!listId || !state.lists[listId]) return;
  const ids = [...state.selectedIds];
  for (const id of ids) toggleBookInList(listId, id);
  showToast(t('bulk_moved_toast').replace('{n}', ids.length).replace('{list}', state.lists[listId].name), 'success');
  renderBulkBar();
}

export function renderBulkBar() {
  const bar = document.getElementById('bulk-action-bar');
  if (!bar) return;

  if (!state.selectMode) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }

  bar.style.display = 'flex';
  const count = state.selectedIds.size;
  const lists = Object.values(state.lists);

  bar.innerHTML = `
    <span class="bulk-count">${count} ${t('bulk_selected_count')}</span>
    <button class="terminal-action-btn" id="bulk-select-all">${t('bulk_select_all')}</button>
    <div class="bulk-tag-group">
      <input type="text" class="bulk-tag-input" id="bulk-tag-input" placeholder="${escHtml(t('bulk_tag_placeholder'))}" ${count ? '' : 'disabled'}>
      <button class="terminal-action-btn" id="bulk-tag-apply" ${count ? '' : 'disabled'}>${t('bulk_tag_apply')}</button>
    </div>
    <select class="bulk-list-select" id="bulk-list-select" ${count ? '' : 'disabled'}>
      <option value="">${escHtml(t('bulk_move_placeholder'))}</option>
      ${lists.map(l => `<option value="${escHtml(l.id)}">${escHtml(l.name)}</option>`).join('')}
    </select>
    <button class="terminal-action-btn delete-btn" id="bulk-delete-btn" ${count ? '' : 'disabled'}>${t('bulk_delete')}</button>`;

  document.getElementById('bulk-select-all').addEventListener('click', selectAllVisible);
  document.getElementById('bulk-delete-btn').addEventListener('click', deleteSelected);

  const tagInput = document.getElementById('bulk-tag-input');
  document.getElementById('bulk-tag-apply').addEventListener('click', () => applyTagToSelected(tagInput));
  tagInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyTagToSelected(tagInput); });

  document.getElementById('bulk-list-select').addEventListener('change', e => {
    moveSelectedToList(e.target.value);
    e.target.value = '';
  });
}

export function initBulk() {
  document.getElementById('select-mode-btn')?.addEventListener('click', toggleSelectMode);
  updateSelectBtn();
}
