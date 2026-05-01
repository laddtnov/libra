import { state } from './state.js';
import { openFormModal, closeFormModal } from './ui-form-modal.js';
import { showBookDetails, closeModal, configureDetailHandlers } from './ui-detail-modal.js';
import { renderBooks, setFilter, configureRenderHandlers, updateStats } from './ui-render.js';

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
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', initApp);
