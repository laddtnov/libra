import { state, saveBooks } from './state.js';
import { renderBooks, updateStats } from './ui-render.js';
import { showToast } from './ui-feedback.js';
import { t } from './i18n.js';

export function exportBooks() {
  const data = JSON.stringify(state.booksData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `libra-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('export_success'), 'success');
}

export function importBooks(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (typeof parsed !== 'object' || Array.isArray(parsed) || !Object.keys(parsed).length) {
        showToast(t('import_invalid'), 'delete');
        return;
      }
      const count = Object.keys(parsed).length;
      Object.assign(state.booksData, parsed);
      saveBooks();
      updateStats();
      renderBooks();
      showToast(t('import_success').replace('{n}', count), 'success');
    } catch {
      showToast(t('import_error'), 'delete');
    }
  };
  reader.readAsText(file);
}
