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
  a.remove();
  URL.revokeObjectURL(url);
  showToast(t('export_success'), 'success');
}

const CSV_COLUMNS = ['title', 'author', 'status', 'category', 'pages', 'currentPage', 'progress', 'rating', 'started', 'completed', 'tags'];

function csvCell(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
}

export function exportBooksCSV() {
  const rows = [CSV_COLUMNS.join(',')];
  for (const book of Object.values(state.booksData)) {
    rows.push(CSV_COLUMNS.map(col => {
      const value = col === 'tags' ? (book.tags || []).join('|') : book[col];
      return csvCell(value);
    }).join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `libra-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(t('export_success'), 'success');
}

export async function importBooks(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
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
}
