import { state } from './state.js';
import { openFormModal, closeFormModal } from './ui-form-modal.js';
import { showBookDetails, closeModal, configureDetailHandlers } from './ui-detail-modal.js';
import { renderBooks, setFilter, configureRenderHandlers, updateStats } from './ui-render.js';
import { openListsPanel, closeListsPanel, initListsPanel } from './ui-lists.js';
import { openRecsPanel, closeRecsPanel, initRecsPanel } from './ui-recommendations.js';

configureRenderHandlers({ openDetails: showBookDetails });
configureDetailHandlers({ openFormModal });

function initApp() {
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

  document.getElementById('search-input').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderBooks();
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    state.activeSort = e.target.value;
    renderBooks();
  });

  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('close-form-modal').addEventListener('click', closeFormModal);
  document.getElementById('modal-overlay').addEventListener('click', () => {
    closeModal();
    closeFormModal();
    closeListsPanel();
    closeRecsPanel();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormModal();
      closeListsPanel();
      closeRecsPanel();
    }
  });

  document.getElementById('lists-btn').addEventListener('click', openListsPanel);
  document.getElementById('recommend-btn').addEventListener('click', openRecsPanel);
  initListsPanel();
  initRecsPanel();
}

document.addEventListener('DOMContentLoaded', initApp);
