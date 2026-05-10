import { sendMagicLink, signOut, pushSettingsToCloud, buildSettings } from './auth.js';

// ── State machine ─────────────────────────────────────────────────────────────
const S = { IDLE: 'idle', SIGNUP: 'signup', LOGIN: 'login', EMAIL_SENT: 'email-sent', SYNCING: 'syncing', LOGGED_IN: 'logged-in' };
let state = S.IDLE;
let sentEmail = '';
let displayName = localStorage.getItem('libra-display-name') || '';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function getStreak() {
  try {
    const d = JSON.parse(localStorage.getItem('libra-streak') || '{}');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const active = d.lastDate === today || d.lastDate === yesterday;
    return active ? (d.streak || 0) : 0;
  } catch { return 0; }
}

// ── Overlay helpers ───────────────────────────────────────────────────────────
function getOverlay() { return document.getElementById('auth-overlay'); }
function getContent() { return document.getElementById('auth-content'); }

export function showAuthOverlay(targetState) {
  state = targetState ?? (state === S.LOGGED_IN ? S.LOGGED_IN : S.IDLE);
  const overlay = getOverlay();
  if (overlay) overlay.style.display = 'flex';
  renderOverlay();
}

export function hideAuthOverlay() {
  const overlay = getOverlay();
  if (overlay) overlay.style.display = 'none';
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function updateAuthBadge(user) {
  const badge = document.getElementById('auth-badge');
  if (!badge) return;
  if (user) {
    const name   = displayName || user.email?.split('@')[0] || 'agent';
    const streak = getStreak();
    badge.textContent = `${name}${streak > 0 ? ` 🔥${streak}` : ''}`;
    badge.title       = `${user.email} — click to manage account`;
    badge.dataset.state = 'signed-in';
    state = S.LOGGED_IN;
  } else {
    badge.textContent   = '[ SIGN IN ]';
    badge.title         = 'Sign in to sync across devices';
    badge.dataset.state = 'signed-out';
    state = S.IDLE;
  }
}

// ── Screen builders ───────────────────────────────────────────────────────────
function renderIdle(c) {
  c.appendChild(el('div', 'auth-screen-title', '>_ LIBRA — SYNC'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));
  c.appendChild(el('p', 'auth-hint', '> Your library, everywhere. Sign in to sync across all devices.'));

  const btns = el('div', 'auth-btn-row');
  const signupBtn = el('button', 'auth-primary-btn', '[ SIGN UP ]');
  const loginBtn  = el('button', 'auth-secondary-btn', '[ LOG IN ]');
  signupBtn.addEventListener('click', () => { state = S.SIGNUP; renderOverlay(); });
  loginBtn.addEventListener('click',  () => { state = S.LOGIN;  renderOverlay(); });
  btns.appendChild(signupBtn);
  btns.appendChild(loginBtn);
  c.appendChild(btns);

  const skip = el('button', 'auth-skip-btn', '> continue without syncing');
  skip.addEventListener('click', hideAuthOverlay);
  c.appendChild(skip);
}

function renderSignup(c) {
  c.appendChild(el('div', 'auth-screen-title', '>_ CREATE ACCOUNT'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));

  const nameLabel = el('label', 'auth-field-label', 'DISPLAY NAME (optional)');
  const nameInput = el('input', 'auth-input');
  nameInput.type        = 'text';
  nameInput.placeholder = 'agent codename';
  nameInput.maxLength   = 40;
  nameInput.value       = displayName;
  nameInput.autocomplete = 'name';

  const emailLabel = el('label', 'auth-field-label', 'EMAIL');
  const emailInput = el('input', 'auth-input');
  emailInput.type        = 'email';
  emailInput.placeholder = 'agent@domain.xyz';
  emailInput.maxLength   = 320;
  emailInput.autocomplete = 'email';

  const statusEl = el('div', 'auth-status');
  const createBtn = el('button', 'auth-primary-btn', '[ CREATE ACCOUNT ]');

  createBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const name  = nameInput.value.trim();
    if (!email?.includes('@')) {
      statusEl.textContent = '> INVALID EMAIL'; statusEl.dataset.type = 'error'; return;
    }
    createBtn.disabled = true;
    createBtn.textContent = '[ TRANSMITTING... ]';
    if (name) {
      displayName = name;
      localStorage.setItem('libra-display-name', name);
    }
    const error = await sendMagicLink(email);
    createBtn.disabled = false;
    createBtn.textContent = '[ CREATE ACCOUNT ]';
    if (error) {
      statusEl.textContent = `> ERROR — ${error.message}`; statusEl.dataset.type = 'error';
    } else {
      sentEmail = email; state = S.EMAIL_SENT; renderOverlay();
    }
  });

  const back = el('button', 'auth-back-btn', '< BACK');
  back.addEventListener('click', () => { state = S.IDLE; renderOverlay(); });

  c.appendChild(nameLabel); c.appendChild(nameInput);
  c.appendChild(emailLabel); c.appendChild(emailInput);
  c.appendChild(statusEl); c.appendChild(createBtn); c.appendChild(back);
  setTimeout(() => emailInput.focus(), 50);
}

function renderLogin(c) {
  c.appendChild(el('div', 'auth-screen-title', '>_ CONNECT'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));

  const emailLabel = el('label', 'auth-field-label', 'EMAIL');
  const emailInput = el('input', 'auth-input');
  emailInput.type        = 'email';
  emailInput.placeholder = 'agent@domain.xyz';
  emailInput.maxLength   = 320;
  emailInput.autocomplete = 'email';

  const statusEl  = el('div', 'auth-status');
  const connectBtn = el('button', 'auth-primary-btn', '[ CONNECT ]');

  connectBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email?.includes('@')) {
      statusEl.textContent = '> INVALID EMAIL'; statusEl.dataset.type = 'error'; return;
    }
    connectBtn.disabled = true;
    connectBtn.textContent = '[ TRANSMITTING... ]';
    const error = await sendMagicLink(email);
    connectBtn.disabled = false;
    connectBtn.textContent = '[ CONNECT ]';
    if (error) {
      statusEl.textContent = `> ERROR — ${error.message}`; statusEl.dataset.type = 'error';
    } else {
      sentEmail = email; state = S.EMAIL_SENT; renderOverlay();
    }
  });

  emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') connectBtn.click(); });

  const back = el('button', 'auth-back-btn', '< BACK');
  back.addEventListener('click', () => { state = S.IDLE; renderOverlay(); });

  c.appendChild(emailLabel); c.appendChild(emailInput);
  c.appendChild(statusEl); c.appendChild(connectBtn); c.appendChild(back);
  setTimeout(() => emailInput.focus(), 50);
}

function renderEmailSent(c) {
  c.appendChild(el('div', 'auth-screen-title', '>_ TRANSMISSION SENT'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));

  const info = el('div', 'auth-email-sent-info');
  info.appendChild(el('p', 'auth-hint', `> Link sent to ${sentEmail}`));
  info.appendChild(el('p', 'auth-hint', '> Check your inbox and click the magic link to sign in.'));
  c.appendChild(info);

  const loginNow = el('button', 'auth-secondary-btn', '[ LOG IN NOW ]');
  loginNow.addEventListener('click', () => { state = S.LOGIN; renderOverlay(); });
  c.appendChild(loginNow);

  const skip = el('button', 'auth-skip-btn', '> continue without syncing');
  skip.addEventListener('click', hideAuthOverlay);
  c.appendChild(skip);
}

function renderSyncing(c) {
  c.appendChild(el('div', 'auth-screen-title', '>_ SYNCING...'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));
  c.appendChild(el('div', 'auth-spinner'));
}

function renderLoggedIn(c, user) {
  const name   = displayName || user?.email?.split('@')[0] || 'agent';
  const streak = getStreak();

  c.appendChild(el('div', 'auth-screen-title', '>_ CONNECTED'));
  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));

  const infoGrid = el('div', 'auth-info-grid');
  infoGrid.appendChild(el('div', 'auth-info-row', `> AGENT    ${name.toUpperCase()}`));
  infoGrid.appendChild(el('div', 'auth-info-row', `> EMAIL    ${user?.email ?? '—'}`));
  infoGrid.appendChild(el('div', 'auth-info-row', `> STREAK   ${streak > 0 ? `🔥 ${streak} day${streak === 1 ? '' : 's'}` : '— start a session to begin'}`));
  infoGrid.appendChild(el('div', 'auth-info-row auth-status-synced', '> STATUS   ✓ SYNCED'));
  c.appendChild(infoGrid);

  c.appendChild(el('div', 'auth-divider', '────────────────────────────────────'));

  const btns = el('div', 'auth-btn-row');

  const syncBtn = el('button', 'auth-secondary-btn', '[ SYNC NOW ]');
  syncBtn.addEventListener('click', async () => {
    syncBtn.disabled = true; syncBtn.textContent = '[ SYNCING... ]';
    try {
      await pushSettingsToCloud(buildSettings());
      syncBtn.textContent = '[ SYNCED ✓ ]';
      setTimeout(() => { syncBtn.disabled = false; syncBtn.textContent = '[ SYNC NOW ]'; }, 2000);
    } catch {
      syncBtn.disabled = false; syncBtn.textContent = '[ TRY AGAIN ]';
    }
  });

  const logoutBtn = el('button', 'auth-logout-btn', '[ LOG OUT ]');
  logoutBtn.addEventListener('click', async () => {
    await signOut();
    state = S.IDLE;
    updateAuthBadge(null);
    renderOverlay();
  });

  btns.appendChild(syncBtn);
  btns.appendChild(logoutBtn);
  c.appendChild(btns);

  const close = el('button', 'auth-skip-btn', '> close');
  close.addEventListener('click', hideAuthOverlay);
  c.appendChild(close);
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderOverlay() {
  const c = getContent();
  if (!c) return;
  c.textContent = '';

  const badge  = document.getElementById('auth-badge');
  const user   = badge?.dataset.state === 'signed-in' ? { email: badge.title.replace(' — click to manage account', '') } : null;

  switch (state) {
    case S.IDLE:       renderIdle(c); break;
    case S.SIGNUP:     renderSignup(c); break;
    case S.LOGIN:      renderLogin(c); break;
    case S.EMAIL_SENT: renderEmailSent(c); break;
    case S.SYNCING:    renderSyncing(c); break;
    case S.LOGGED_IN:  renderLoggedIn(c, user); break;
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initAuthUI() {
  const badge = document.getElementById('auth-badge');
  badge?.addEventListener('click', () => {
    state = badge.dataset.state === 'signed-in' ? S.LOGGED_IN : S.IDLE;
    showAuthOverlay(state);
  });
}
