import { sendMagicLink, signOut } from './auth.js';

function getOverlay() { return document.getElementById('auth-overlay'); }

export function showAuthOverlay() {
  const overlay = getOverlay();
  if (overlay) overlay.style.display = 'flex';
}

export function hideAuthOverlay() {
  const overlay = getOverlay();
  if (overlay) overlay.style.display = 'none';
}

export function updateAuthBadge(user) {
  const badge = document.getElementById('auth-badge');
  if (!badge) return;
  if (user) {
    badge.textContent = user.email ?? '[ SYNCED ]';
    badge.title = `Signed in as ${user.email ?? ''} — click to sign out`;
    badge.dataset.state = 'signed-in';
  } else {
    badge.textContent = '[ SIGN IN ]';
    badge.title = 'Sign in to sync across devices';
    badge.dataset.state = 'signed-out';
  }
}

export function initAuthUI(onSignedIn) {
  const form    = document.getElementById('auth-form');
  const input   = document.getElementById('auth-email');
  const btn     = document.getElementById('auth-submit');
  const status  = document.getElementById('auth-status');
  const badge   = document.getElementById('auth-badge');
  const skipBtn = document.getElementById('auth-skip');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input?.value.trim() ?? '';
    if (!email?.includes('@')) {
      setStatus(status, '> INVALID EMAIL', 'error');
      return;
    }
    btn.disabled = true;
    btn.textContent = '[ TRANSMITTING... ]';
    setStatus(status, '', '');

    const error = await sendMagicLink(email);
    btn.disabled = false;
    btn.textContent = '[ SEND LINK ]';

    if (error) {
      setStatus(status, `> ERROR — ${error.message}`, 'error');
    } else {
      setStatus(status, `> LINK SENT TO ${email.toUpperCase()} — CHECK YOUR INBOX`, 'success');
      if (input) input.value = '';
    }
  });

  skipBtn?.addEventListener('click', () => hideAuthOverlay());

  badge?.addEventListener('click', async () => {
    if (badge.dataset.state === 'signed-in') {
      await signOut();
      updateAuthBadge(null);
      showAuthOverlay();
    } else {
      showAuthOverlay();
    }
  });
}

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.dataset.type = type;
}
