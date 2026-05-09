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
import { initAuth, onAuthChange, pullBooksFromCloud } from './auth.js';
import { showAuthOverlay, hideAuthOverlay, updateAuthBadge, initAuthUI } from './ui-auth.js';

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

async function initSync() {
  const user = await initAuth();
  updateAuthBadge(user);

  // If signed in, pull latest books from cloud
  if (user) {
    const cloudBooks = await pullBooksFromCloud();
    if (cloudBooks && typeof cloudBooks === 'object') {
      Object.assign(state.booksData, cloudBooks);
      localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
      renderBooks();
      updateStats();
    }
  }

  // Auth state changes (after clicking magic link)
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
      // Push local books to cloud on first sign-in
      saveBooks();
    }
  });

  initAuthUI();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initSync();
});
