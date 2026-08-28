import { state } from './state.js';
import { t } from './i18n.js';
import { showBookDetails } from './ui-detail-modal.js';

const MAX_ROWS = 3;

function daysSince(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function lastActivityDate(book) {
  const sessions = book.sessions || [];
  if (sessions.length) return [...sessions].sort((a, b) => a.date.localeCompare(b.date)).at(-1).date;
  return book.started || null;
}

function progressLabel(book) {
  const page = Number(book.currentPage) || 0;
  if (!page) return '';
  const total = Number(book.pages) || 0;
  return total ? `${page} / ${total} · ${book.progress ?? 0}%` : `p. ${page}`;
}

export function renderReminders() {
  const container = document.getElementById('reading-reminders');
  if (!container) return;
  container.textContent = '';

  // Everything you are currently reading, freshest first — the point is to
  // resume, so the book you touched yesterday belongs at the top. A book with
  // no activity at all sorts last rather than first; it is the least likely
  // one to be picked up, and the "not started yet" note still calls it out.
  const reading = Object.entries(state.booksData)
    .filter(([, b]) => b.status === 'reading')
    .map(([id, book]) => {
      const last = lastActivityDate(book);
      return { id, book, days: last ? daysSince(last) : null };
    })
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity))
    .slice(0, MAX_ROWS);

  if (!reading.length) return;

  const title = document.createElement('div');
  title.className = 'reminders-title';
  title.textContent = t('reminders_title');
  container.appendChild(title);

  for (const { id, book, days } of reading) {
    const row = document.createElement('button');
    row.className = 'reminder-row';
    row.type = 'button';
    row.addEventListener('click', () => showBookDetails(id));

    const label = document.createElement('span');
    label.className = 'reminder-book';
    label.textContent = book.title;
    row.appendChild(label);

    // Where you are in it — the reason to resume this one over the others.
    const progressText = progressLabel(book);
    if (progressText) {
      const progress = document.createElement('span');
      progress.className = 'reminder-progress';
      progress.textContent = progressText;
      row.appendChild(progress);
    }

    const meta = document.createElement('span');
    meta.className = 'reminder-meta';
    if (days === null) {
      meta.textContent = t('reminders_not_started');
    } else if (days === 0) {
      meta.textContent = t('reminders_today');
    } else {
      const daysLabel = days === 1 ? t('reminders_days_ago_sg') : t('reminders_days_ago_pl');
      meta.textContent = `${t('reminders_last_read')} ${days} ${daysLabel}`;
    }
    row.appendChild(meta);

    container.appendChild(row);
  }
}
