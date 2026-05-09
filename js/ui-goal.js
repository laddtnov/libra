import { state } from './state.js';

const YEAR = new Date().getFullYear();
const KEY  = `libra-goal-${YEAR}`;

function getGoal()        { return parseInt(localStorage.getItem(KEY) || '0', 10); }
function setGoal(n)       { localStorage.setItem(KEY, String(n)); }
function completedCount() {
  return Object.values(state.booksData).filter(b => b.status === 'completed').length;
}

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
    metaEl.textContent = goal
      ? `${completed} / ${goal} books — ${pct}%${pct >= 100 ? '  ✓ GOAL REACHED' : ''}`
      : 'No goal set — click [ SET ] to add one';
  }
  if (editBtn) editBtn.textContent = goal ? '[ EDIT ]' : '[ SET ]';
}

function showGoalInput() {
  const wrap = document.getElementById('goal-bar-wrap');
  if (!wrap || wrap.querySelector('.goal-inline-input')) return;

  const goal = getGoal();

  const row = document.createElement('div');
  row.className = 'goal-inline-row';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'goal-inline-input';
  input.placeholder = `target books for ${YEAR}`;
  input.min = '1';
  input.max = '999';
  input.value = goal || '';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'goal-inline-save';
  saveBtn.textContent = '[ SAVE ]';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'goal-inline-cancel';
  cancelBtn.textContent = '[ × ]';

  row.appendChild(input);
  row.appendChild(saveBtn);
  row.appendChild(cancelBtn);
  wrap.appendChild(row);
  input.focus();

  function close() { row.remove(); }

  saveBtn.addEventListener('click', () => {
    const n = parseInt(input.value, 10);
    if (n > 0) {
      setGoal(n); renderGoal(); close();
      import('./auth.js').then(({ pushSettingsToCloud, buildSettings }) => {
        pushSettingsToCloud(buildSettings()).catch(() => {});
      }).catch(() => {});
    }
    else { input.classList.add('goal-input-error'); setTimeout(() => input.classList.remove('goal-input-error'), 600); }
  });

  cancelBtn.addEventListener('click', close);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
    if (e.key === 'Escape') close();
  });
}

export function initGoal() {
  renderGoal();
  document.getElementById('goal-edit-btn')?.addEventListener('click', showGoalInput);
}
