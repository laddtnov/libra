import { state, saveBooks } from './state.js';
import { openFormModal, closeFormModal } from './ui-form-modal.js';
import { showBookDetails, closeModal, configureDetailHandlers } from './ui-detail-modal.js';
import { renderBooks, setFilter, configureRenderHandlers, updateStats } from './ui-render.js';
import { openListsPanel, closeListsPanel, initListsPanel } from './ui-lists.js';
import { openRecsPanel, closeRecsPanel, initRecsPanel } from './ui-recommendations.js';
import { clearDiscover, debouncedFetch, closePreviewModal } from './ui-discover.js';
import { exportBooks, importBooks } from './ui-backup.js';
import { openDonatePanel, closeDonatePanel, initDonatePanel } from './ui-donate.js';
import { initI18n, setLanguage, applyI18n } from './i18n.js';

configureRenderHandlers({ openDetails: showBookDetails });
configureDetailHandlers({ openFormModal });

function initApp() {
  initI18n();
  applyI18n();

  updateStats();
  renderBooks();

  document.getElementById('add-book-btn').addEventListener('click', () => openFormModal());

  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => setFilter(btn.dataset.filter))
  );

  document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => setFilter(card.dataset.filter));
  });

  // Search bar → web discover
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (q) {
      debouncedFetch(q);
    } else {
      clearDiscover();
      state.searchQuery = '';
      renderBooks();
    }
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    state.activeSort = e.target.value;
    renderBooks();
  });

  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('close-form-modal').addEventListener('click', closeFormModal);
  document.getElementById('close-discover-preview').addEventListener('click', closePreviewModal);
  document.getElementById('modal-overlay').addEventListener('click', () => {
    closeModal();
    closeFormModal();
    closePreviewModal();
    closeListsPanel();
    closeRecsPanel();
    closeDonatePanel();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormModal();
      closePreviewModal();
      closeListsPanel();
      closeRecsPanel();
      closeDonatePanel();
    }
  });

  document.getElementById('export-btn').addEventListener('click', exportBooks);
  document.getElementById('import-input').addEventListener('change', e => {
    importBooks(e.target.files[0]);
    e.target.value = '';
  });

  document.getElementById('lists-btn').addEventListener('click', openListsPanel);
  document.getElementById('recommend-btn').addEventListener('click', openRecsPanel);
  document.getElementById('donate-btn').addEventListener('click', openDonatePanel);
  initListsPanel();
  initRecsPanel();
  initDonatePanel();

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      applyI18n();
      renderBooks();
    });
  });
}

function initOverlayUI() {
  const overlay = document.getElementById('auth-overlay');
  const badge   = document.getElementById('auth-badge');
  const skip    = document.getElementById('auth-skip');
  const form    = document.getElementById('auth-form');
  const input   = document.getElementById('auth-email');
  const btn     = document.getElementById('auth-submit');
  const status  = document.getElementById('auth-status');

  badge?.addEventListener('click', () => { if (overlay) overlay.style.display = 'flex'; });
  skip?.addEventListener('click',  () => { if (overlay) overlay.style.display = 'none'; });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input?.value.trim() ?? '';
    if (!email?.includes('@')) {
      if (status) { status.textContent = '> INVALID EMAIL'; status.dataset.type = 'error'; }
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = '[ TRANSMITTING... ]'; }
    try {
      const { sendMagicLink } = await import('./auth.js');
      const error = await sendMagicLink(email);
      if (error) throw error;
      if (status) { status.textContent = `> LINK SENT — CHECK YOUR INBOX`; status.dataset.type = 'success'; }
      if (input) input.value = '';
    } catch (err) {
      if (status) { status.textContent = `> ERROR — ${err.message ?? 'Failed to send'}`;  status.dataset.type = 'error'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '[ SEND LINK ]'; }
    }
  });
}

async function initSync() {
  initOverlayUI();
  try {
    const [authMod, uiAuthMod] = await Promise.all([
      import('./auth.js'),
      import('./ui-auth.js'),
    ]);
    const { initAuth, onAuthChange, pullBooksFromCloud } = authMod;
    const { hideAuthOverlay, updateAuthBadge, initAuthUI } = uiAuthMod;

    const user = await initAuth();
    updateAuthBadge(user);

    if (user) {
      const cloudBooks = await pullBooksFromCloud();
      if (cloudBooks && typeof cloudBooks === 'object') {
        Object.assign(state.booksData, cloudBooks);
        localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
        renderBooks();
        updateStats();
      }
    }

    onAuthChange(async (newUser) => {
      updateAuthBadge(newUser);
      if (newUser) {
        hideAuthOverlay();
        const cloudBooks = await pullBooksFromCloud();
        if (cloudBooks && typeof cloudBooks === 'object') {
          Object.assign(state.booksData, cloudBooks);
          localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
          renderBooks();
          updateStats();
        }
        saveBooks();
      }
    });

    initAuthUI();
  } catch (err) {
    console.warn('Sync unavailable:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initSync();
});
