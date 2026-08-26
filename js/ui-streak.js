const STREAK_STORAGE_KEY = 'libra-streak';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function load() {
  try { return JSON.parse(localStorage.getItem(STREAK_STORAGE_KEY) || '{}'); } catch { return {}; }
}

function save(data) {
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
}

export function recordSessionToday() {
  const data  = load();
  const today = getTodayStr();
  if (data.lastDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  data.streak   = data.lastDate === yesterday ? (data.streak || 0) + 1 : 1;
  data.lastDate = today;
  data.best     = Math.max(data.best || 0, data.streak);
  save(data);
  renderStreak();

  const { streak } = data;
  if ([7, 14, 30, 60, 100].includes(streak)) {
    import('./ui-feedback.js').then(({ showToast }) => {
      showToast(`🔥 ${streak}-day reading streak!`, 'success');
    }).catch(() => {});
  }
}

function renderStreak() {
  const data  = load();
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const active = data.lastDate === today || data.lastDate === yesterday;
  const count  = active ? (data.streak || 0) : 0;

  const badge = document.getElementById('streak-badge');
  const countEl = document.getElementById('streak-count');
  if (countEl) countEl.textContent = String(count);
  if (badge) badge.dataset.active = active && count > 0 ? 'true' : 'false';
}

export function initStreak() {
  renderStreak();
}
