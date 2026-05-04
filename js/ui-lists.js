import { state, escHtml, cleanText, saveLists } from './state.js';
import { renderBooks } from './ui-render.js';
import { showToast } from './ui-feedback.js';

function genListId(name) {
  return 'lst-' + name.toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 30) + '-' + Date.now().toString(36);
}

export function createList(name) {
  const clean = cleanText(name, 60).trim();
  if (!clean) return null;
  const id = genListId(clean);
  state.lists[id] = { id, name: clean, bookIds: [] };
  saveLists();
  return id;
}

export function deleteList(listId) {
  delete state.lists[listId];
  if (state.activeList === listId) state.activeList = null;
  saveLists();
}

export function toggleBookInList(listId, bookId) {
  const list = state.lists[listId];
  if (!list) return;
  const idx = list.bookIds.indexOf(bookId);
  if (idx === -1) list.bookIds.push(bookId);
  else list.bookIds.splice(idx, 1);
  saveLists();
}

export function getBookLists(bookId) {
  return Object.values(state.lists).filter(l => l.bookIds.includes(bookId));
}

export function removeBookFromAllLists(bookId) {
  for (const list of Object.values(state.lists)) {
    const idx = list.bookIds.indexOf(bookId);
    if (idx !== -1) list.bookIds.splice(idx, 1);
  }
  saveLists();
}

export function updateActiveListIndicator() {
  const indicator = document.getElementById('active-list-indicator');
  if (!indicator) return;
  if (state.activeList && state.lists[state.activeList]) {
    const list = state.lists[state.activeList];
    indicator.style.display = 'flex';
    indicator.innerHTML = `
      <span class="active-list-label">📋 ${escHtml(list.name.toUpperCase())}</span>
      <button class="clear-list-btn" id="clear-list-filter">[ × CLEAR ]</button>`;
    document.getElementById('clear-list-filter').addEventListener('click', () => {
      state.activeList = null;
      updateActiveListIndicator();
      renderBooks();
    });
  } else {
    state.activeList = null;
    indicator.style.display = 'none';
    indicator.innerHTML = '';
  }
}

function buildListsHTML() {
  const lists = Object.values(state.lists);
  if (!lists.length) {
    return `<div class="lists-empty">&gt; NO LISTS YET. CREATE YOUR FIRST LIST ABOVE.</div>`;
  }
  return lists.map(list => {
    const count = list.bookIds.filter(id => state.booksData[id]).length;
    const isActive = state.activeList === list.id;
    return `
      <div class="list-item${isActive ? ' list-item--active' : ''}">
        <div class="list-item-info">
          <span class="list-item-name">${escHtml(list.name)}</span>
          <span class="list-item-count">${count} book${count === 1 ? '' : 's'}</span>
        </div>
        <div class="list-item-actions">
          <button class="list-view-btn${isActive ? ' active' : ''}" data-list-id="${escHtml(list.id)}">
            ${isActive ? '[ ACTIVE ]' : '[ VIEW ]'}
          </button>
          <button class="list-del-btn" data-list-id="${escHtml(list.id)}">[ ✕ ]</button>
        </div>
      </div>`;
  }).join('');
}

export function renderListsPanel() {
  const container = document.getElementById('lists-container');
  if (!container) return;
  container.innerHTML = buildListsHTML();

  container.querySelectorAll('.list-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const listId = btn.dataset.listId;
      state.activeList = state.activeList === listId ? null : listId;
      renderBooks();
      updateActiveListIndicator();
      renderListsPanel();
    });
  });

  container.querySelectorAll('.list-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const listId = btn.dataset.listId;
      const name = state.lists[listId]?.name || 'list';
      deleteList(listId);
      renderBooks();
      updateActiveListIndicator();
      renderListsPanel();
      showToast(`LIST "${name.toUpperCase()}" DELETED`, 'delete');
    });
  });
}

export function openListsPanel() {
  renderListsPanel();
  document.getElementById('lists-panel').style.display = 'flex';
  document.getElementById('modal-overlay').style.display = 'block';
}

export function closeListsPanel() {
  document.getElementById('lists-panel').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

export function initListsPanel() {
  document.getElementById('close-lists-panel').addEventListener('click', closeListsPanel);

  const input = document.getElementById('new-list-input');
  const createBtn = document.getElementById('create-list-btn');

  function doCreate() {
    const name = input.value.trim();
    if (!name) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      return;
    }
    createList(name);
    input.value = '';
    renderListsPanel();
    showToast(`LIST "${name.toUpperCase()}" CREATED`, 'success');
  }

  createBtn.addEventListener('click', doCreate);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); });
}
