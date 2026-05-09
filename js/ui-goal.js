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
    fillEl.dataset.pct = pct;
  }
  if (metaEl) {
    metaEl.textContent = goal
      ? `${completed} / ${goal} books — ${pct}%${pct >= 100 ? '  ✓ GOAL REACHED' : ''}`
      : 'No goal set — click [ SET ] to add one';
  }
  if (editBtn) editBtn.textContent = goal ? '[ EDIT ]' : '[ SET ]';
}

export function initGoal() {
  renderGoal();
  document.getElementById('goal-edit-btn')?.addEventListener('click', () => {
    const goal    = getGoal();
    const current = goal ? String(goal) : '';
    const raw     = prompt(`Reading goal for ${YEAR} (books):`, current);
    if (raw === null) return;
    const n = parseInt(raw, 10);
    if (n > 0) { setGoal(n); renderGoal(); }
    else if (raw.trim() === '' || n === 0) { localStorage.removeItem(KEY); renderGoal(); }
  });
}
