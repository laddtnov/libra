import { state } from './state.js';
import { renderReminders } from './ui-reminders.js';

const YEAR     = new Date().getFullYear();
const KEY      = `libra-goal-${YEAR}`;
const GENRE_KEY = `libra-genre-goals-${YEAR}`;

// ── Annual goal ───────────────────────────────────────────────────────────────
function getGoal()        { return Number.parseInt(localStorage.getItem(KEY) || '0', 10); }
function setGoal(n)       { localStorage.setItem(KEY, String(n)); }
function completedCount() {
  return Object.values(state.booksData).filter(b => b.status === 'completed').length;
}

// ── Genre goals ───────────────────────────────────────────────────────────────
function getGenreGoals() {
  try { return JSON.parse(localStorage.getItem(GENRE_KEY) || '[]'); } catch { return []; }
}
function saveGenreGoals(goals) { localStorage.setItem(GENRE_KEY, JSON.stringify(goals)); }

function completedByGenre(genre) {
  return Object.values(state.booksData)
    .filter(b => b.status === 'completed' && b.category === genre).length;
}

// ── Render annual goal ────────────────────────────────────────────────────────
export function renderGoal() {
  const goal      = getGoal();
  const completed = completedCount();
  const pct       = goal ? Math.min(100, Math.round((completed / goal) * 100)) : 0;

  const yearEl  = document.getElementById('goal-year');
  const fillEl  = document.getElementById('goal-fill');
  const metaEl  = document.getElementById('goal-meta');
  const editBtn = document.getElementById('goal-edit-btn');

  if (yearEl) yearEl.textContent = YEAR;
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
    fillEl.dataset.pct = pct >= 100 ? '100' : '';
  }
  if (metaEl) {
    const reachedSuffix = pct >= 100 ? '  ✓ GOAL REACHED' : '';
    metaEl.textContent = goal
      ? `${completed} / ${goal} books — ${pct}%${reachedSuffix}`
      : 'No goal set — click [ SET ] to add one';
  }
  if (editBtn) editBtn.textContent = goal ? '[ EDIT ]' : '[ SET ]';

  renderGenreGoals();
  renderReminders();
}

// ── Render genre goals ────────────────────────────────────────────────────────
function renderGenreGoals() {
  const container = document.getElementById('genre-goals-container');
  if (!container) return;
  container.textContent = '';

  const goals = getGenreGoals();
  for (const { genre, target } of goals) {
    const done = completedByGenre(genre);
    const pct  = Math.min(100, Math.round((done / target) * 100));

    const row = document.createElement('div');
    row.className = 'genre-goal-row';

    const lbl = document.createElement('span');
    lbl.className = 'genre-goal-lbl';
    lbl.textContent = genre;

    const track = document.createElement('div');
    track.className = 'genre-goal-track';
    const fill = document.createElement('div');
    fill.className = 'genre-goal-fill';
    fill.style.width = `${pct}%`;
    if (pct >= 100) fill.dataset.done = '1';
    track.appendChild(fill);

    const meta = document.createElement('span');
    meta.className = 'genre-goal-meta';
    meta.textContent = `${done}/${target}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'genre-goal-del';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', () => {
      saveGenreGoals(getGenreGoals().filter(g => g.genre !== genre));
      renderGenreGoals();
    });

    row.appendChild(lbl);
    row.appendChild(track);
    row.appendChild(meta);
    row.appendChild(delBtn);
    container.appendChild(row);
  }
}

// ── Input overlays ────────────────────────────────────────────────────────────
function showGoalInput() {
  const wrap = document.getElementById('goal-bar-wrap');
  if (!wrap || wrap.querySelector('.goal-inline-input')) return;

  const goal  = getGoal();
  const row   = document.createElement('div');
  row.className = 'goal-inline-row';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'goal-inline-input';
  input.placeholder = `target books for ${YEAR}`;
  input.min = '1'; input.max = '999';
  input.value = goal || '';

  const saveBtn   = document.createElement('button');
  saveBtn.className = 'goal-inline-save';
  saveBtn.textContent = '[ SAVE ]';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'goal-inline-cancel';
  cancelBtn.textContent = '[ × ]';

  row.appendChild(input); row.appendChild(saveBtn); row.appendChild(cancelBtn);
  wrap.appendChild(row);
  input.focus();

  const close = () => row.remove();

  saveBtn.addEventListener('click', () => {
    const n = Number.parseInt(input.value, 10);
    if (n > 0) {
      setGoal(n); renderGoal(); close();
      import('./auth.js').then(({ pushSettingsToCloud, buildSettings }) => {
        pushSettingsToCloud(buildSettings()).catch(() => {});
      }).catch(() => {});
    } else {
      input.classList.add('goal-input-error');
      setTimeout(() => input.classList.remove('goal-input-error'), 600);
    }
  });
  cancelBtn.addEventListener('click', close);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveBtn.click();
    if (e.key === 'Escape') close();
  });
}

function showGenreGoalInput() {
  const wrap = document.getElementById('goal-bar-wrap');
  if (!wrap || wrap.querySelector('.goal-inline-input')) return;

  const categories = [...new Set(Object.values(state.booksData).map(b => b.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (!categories.length) return;

  const row = document.createElement('div');
  row.className = 'goal-inline-row';

  const sel = document.createElement('select');
  sel.className = 'goal-inline-input';
  sel.style.flex = '1.5';
  const placeholder = document.createElement('option');
  placeholder.value = ''; placeholder.textContent = 'pick genre';
  sel.appendChild(placeholder);
  for (const cat of categories) {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    sel.appendChild(opt);
  }

  const numInput = document.createElement('input');
  numInput.type = 'number';
  numInput.className = 'goal-inline-input';
  numInput.placeholder = 'target'; numInput.min = '1'; numInput.max = '99';

  const saveBtn   = document.createElement('button');
  saveBtn.className = 'goal-inline-save';
  saveBtn.textContent = '[ ADD ]';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'goal-inline-cancel';
  cancelBtn.textContent = '[ × ]';

  row.appendChild(sel); row.appendChild(numInput);
  row.appendChild(saveBtn); row.appendChild(cancelBtn);
  wrap.appendChild(row);
  sel.focus();

  const close = () => row.remove();

  saveBtn.addEventListener('click', () => {
    const genre = sel.value;
    const n     = Number.parseInt(numInput.value, 10);
    if (!genre || n <= 0) {
      numInput.classList.add('goal-input-error');
      setTimeout(() => numInput.classList.remove('goal-input-error'), 600);
      return;
    }
    const goals = getGenreGoals().filter(g => g.genre !== genre);
    goals.push({ genre, target: n });
    saveGenreGoals(goals);
    renderGenreGoals();
    close();
  });
  cancelBtn.addEventListener('click', close);
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initGoal() {
  renderGoal();
  document.getElementById('goal-edit-btn')?.addEventListener('click', showGoalInput);
  document.getElementById('genre-goal-btn')?.addEventListener('click', showGenreGoalInput);
}
