import { state, saveBooks } from './state.js';
import { openFormModal, closeFormModal } from './ui-form-modal.js';
import { showBookDetails, closeModal, configureDetailHandlers } from './ui-detail-modal.js';
import { renderBooks, setFilter, configureRenderHandlers, updateStats } from './ui-render.js';
import { openListsPanel, closeListsPanel, initListsPanel } from './ui-lists.js';
import { openRecsPanel, closeRecsPanel, initRecsPanel } from './ui-recommendations.js';
import { clearDiscover, fetchDiscover, closePreviewModal } from './ui-discover.js';
import { exportBooks, exportBooksCSV, importBooks } from './ui-backup.js';
import { initI18n, setLanguage, applyI18n } from './i18n.js';
import { initGoal, renderGoal } from './ui-goal.js';
import { initStreak } from './ui-streak.js';
import { openStatsPanel, closeStatsPanel, initStatsPanel } from './ui-stats.js';
import { importGoodreads } from './ui-goodreads.js';
import { initBulk, updateSelectBtn } from './ui-bulk.js';
import { toggleSound } from './ui-feedback.js';

configureRenderHandlers({ openDetails: showBookDetails });
configureDetailHandlers({ openFormModal });

function initTheme() {
  const saved = localStorage.getItem('cyberpunk-theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('cyberpunk-theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀';
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initApp() {
  initTheme();
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  initI18n();
  document.documentElement.lang = localStorage.getItem('cyberpunk-lang') || 'en';
  applyI18n();

  updateStats();
  renderBooks();
  initGoal();
  initStreak();
  initStatsPanel();
  document.getElementById('stats-btn')?.addEventListener('click', openStatsPanel);
  // The button lives in the detail modal but outlives each open, so bind once.
  document.getElementById('sound-toggle')?.addEventListener('click', toggleSound);

  document.getElementById('add-book-btn')?.addEventListener('click', () => openFormModal());

  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => setFilter(btn.dataset.filter))
  );

  document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const label = card.querySelector('.stat-label')?.textContent?.trim();
    if (label) card.setAttribute('aria-label', `Filter: ${label}`);
    card.addEventListener('click', () => setFilter(card.dataset.filter));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setFilter(card.dataset.filter);
      }
    });
  });

  // Search bar → your own library. The web is opt-in from the empty state,
  // so typing never navigates away from the shelf you already own.
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', e => {
    state.searchQuery = e.target.value.trim();
    clearDiscover();
    renderBooks();
  });

  // Delegated so it survives every re-render of the grid.
  document.getElementById('books-grid')?.addEventListener('click', e => {
    if (e.target.closest('#search-web-btn') && state.searchQuery) fetchDiscover(state.searchQuery);
  });

  document.getElementById('sort-select')?.addEventListener('change', e => {
    state.activeSort = e.target.value;
    renderBooks();
  });

  document.getElementById('close-modal')?.addEventListener('click', closeModal);
  document.getElementById('close-form-modal')?.addEventListener('click', closeFormModal);
  document.getElementById('close-discover-preview')?.addEventListener('click', closePreviewModal);
  document.getElementById('modal-overlay').addEventListener('click', () => {
    closeModal();
    closeFormModal();
    closePreviewModal();
    closeListsPanel();
    closeRecsPanel();
    closeStatsPanel();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormModal();
      closePreviewModal();
      closeListsPanel();
      closeRecsPanel();
      closeStatsPanel();
    }
  });

  // Format picker doubles as the trigger; snaps back to its "EXPORT" label so
  // it never reads as a persistent setting.
  document.getElementById('export-select')?.addEventListener('change', e => {
    const fmt = e.target.value;
    e.target.value = '';
    if (fmt === 'json') exportBooks();
    else if (fmt === 'csv') exportBooksCSV();
  });
  // One import control: the file already says which kind it is, so routing on
  // its extension beats making the reader pick the matching button. A .csv that
  // is not a Goodreads export fails on its own header check with a clear error.
  document.getElementById('import-input')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      importBooks(file);
      return;
    }

    const { showToast } = await import('./ui-feedback.js');
    showToast('> IMPORTING FROM GOODREADS...', 'info');
    const { imported, skipped, error } = await importGoodreads(file);
    if (error) { showToast(`> ERROR — ${error}`, 'delete'); }
    else { showToast(`> IMPORTED ${imported} books, skipped ${skipped} duplicates`, 'success'); }
  });

  document.getElementById('lists-btn')?.addEventListener('click', openListsPanel);
  document.getElementById('recommend-btn')?.addEventListener('click', openRecsPanel);
  initListsPanel();
  initRecsPanel();
  initBulk();

  // Language switcher
  document.getElementById('lang-select')?.addEventListener('change', e => {
    setLanguage(e.target.value);
    document.documentElement.lang = e.target.value;
    applyI18n();
    updateSelectBtn();
    renderBooks();
  });
}

function initOverlayUI() {
  // Badge click + overlay close now fully handled by initAuthUI() in ui-auth.js
}

async function initSync() {
  initOverlayUI();
  try {
    const [authMod, uiAuthMod] = await Promise.all([
      import('./auth.js'),
      import('./ui-auth.js'),
    ]);
    const { initAuth, onAuthChange, pullBooksFromCloud, pullSettingsFromCloud, applySettings, buildSettings, pushSettingsToCloud } = authMod;
    const { hideAuthOverlay, updateAuthBadge, initAuthUI, triggerResetScreen, isResetActive } = uiAuthMod;

    const user = await initAuth();
    updateAuthBadge(user);

    if (user) {
      // Push existing local data up first, then pull cloud (merge wins for non-empty)
      const localSettings = buildSettings();
      saveBooks();
      await pushSettingsToCloud(localSettings).catch(() => {});

      const [cloudBooks, cloudSettings] = await Promise.all([
        pullBooksFromCloud(),
        pullSettingsFromCloud(),
      ]);
      if (cloudBooks && typeof cloudBooks === 'object') {
        Object.assign(state.booksData, cloudBooks);
        localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
        renderBooks();
        updateStats();
      }
      if (cloudSettings) { applySettings(cloudSettings); renderGoal(); }
    }

    // initAuthUI first — opens reset form if ?reset=1 is in the URL
    initAuthUI();

    onAuthChange(async (newUser, event) => {
      if (event === 'PASSWORD_RECOVERY') {
        triggerResetScreen();
        return;
      }
      // Don't touch the overlay if the reset form is showing
      if (isResetActive()) return;

      updateAuthBadge(newUser);
      if (newUser) {
        hideAuthOverlay();
        const [cloudBooks, cloudSettings] = await Promise.all([
          pullBooksFromCloud(),
          pullSettingsFromCloud(),
        ]);
        if (cloudBooks && typeof cloudBooks === 'object') {
          Object.assign(state.booksData, cloudBooks);
          localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
          renderBooks();
          updateStats();
        }
        if (cloudSettings) { applySettings(cloudSettings); renderGoal(); }
        saveBooks();
        pushSettingsToCloud(buildSettings()).catch(() => {});
      }
    });
  } catch (err) {
    console.warn('Sync unavailable:', err);
  }
}

async function syncFromCloud() {
  try {
    const { pullBooksFromCloud, pullSettingsFromCloud, getCurrentUser } = await import('./auth.js');
    if (!getCurrentUser()) return;
    const [cloudBooks, cloudSettings] = await Promise.all([pullBooksFromCloud(), pullSettingsFromCloud()]);
    if (cloudBooks && typeof cloudBooks === 'object') {
      Object.assign(state.booksData, cloudBooks);
      localStorage.setItem('cyberpunk-books', JSON.stringify(state.booksData));
      renderBooks();
      updateStats();
    }
    const { applySettings } = await import('./auth.js');
    if (cloudSettings) { applySettings(cloudSettings); renderGoal(); }
  } catch { /* offline or not signed in */ }
}

// Pull fresh data from cloud when tab becomes visible again (max once per 30s)
let _lastCloudPull = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const now = Date.now();
  if (now - _lastCloudPull < 30_000) return;
  _lastCloudPull = now;
  syncFromCloud();
});

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initSync();
});
