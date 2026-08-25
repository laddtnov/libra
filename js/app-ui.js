import { state, saveBooks } from './state.js';
import { openFormModal, closeFormModal } from './ui-form-modal.js';
import { showBookDetails, closeModal, configureDetailHandlers } from './ui-detail-modal.js';
import { renderBooks, setFilter, configureRenderHandlers, updateStats } from './ui-render.js';
import { openListsPanel, closeListsPanel, initListsPanel } from './ui-lists.js';
import { openRecsPanel, closeRecsPanel, initRecsPanel } from './ui-recommendations.js';
import { clearDiscover, debouncedFetch, closePreviewModal } from './ui-discover.js';
import { exportBooks, exportBooksCSV, importBooks } from './ui-backup.js';
import { initI18n, setLanguage, applyI18n } from './i18n.js';
import { initGoal, renderGoal } from './ui-goal.js';
import { initStreak } from './ui-streak.js';
import { openStatsPanel, closeStatsPanel, initStatsPanel } from './ui-stats.js';
import { importGoodreads } from './ui-goodreads.js';
import { initBulk, updateSelectBtn } from './ui-bulk.js';

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

function initDataMenu() {
  const toggle = document.getElementById('data-menu-btn');
  const panel = document.getElementById('data-menu-panel');
  if (!toggle || !panel) return;

  const close = ({ returnFocus = false } = {}) => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) panel.querySelector('button')?.focus();
  });

  panel.addEventListener('click', event => {
    if (event.target.closest('button')) close();
  });

  document.addEventListener('click', event => {
    if (!panel.hidden && !event.target.closest('.data-menu')) close();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.stopPropagation();
      close({ returnFocus: true });
    }
  });
}

function initApp() {
  initTheme();
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
  initDataMenu();

  initI18n();
  document.documentElement.lang = localStorage.getItem('cyberpunk-lang') || 'en';
  applyI18n();

  updateStats();
  renderBooks();
  initGoal();
  initStreak();
  initStatsPanel();
  document.getElementById('stats-btn')?.addEventListener('click', openStatsPanel);

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

  // Search bar → web discover
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (q) {
      debouncedFetch(q);
    } else {
      clearDiscover();
      state.searchQuery = '';
      renderBooks();
    }
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

  document.getElementById('export-btn')?.addEventListener('click', exportBooks);
  document.getElementById('export-csv-btn')?.addEventListener('click', exportBooksCSV);
  document.getElementById('import-btn')?.addEventListener('click', () => document.getElementById('import-input')?.click());
  document.getElementById('goodreads-btn')?.addEventListener('click', () => document.getElementById('goodreads-input')?.click());
  document.getElementById('import-input')?.addEventListener('change', e => {
    importBooks(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('goodreads-input')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
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
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      document.documentElement.lang = btn.dataset.lang;
      applyI18n();
      updateSelectBtn();
      renderBooks();
    });
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
