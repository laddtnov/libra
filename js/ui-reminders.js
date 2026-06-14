import { state } from './state.js';
import { t } from './i18n.js';
import { showBookDetails } from './ui-detail-modal.js';

const STALE_DAYS = 3;
const MAX_ROWS   = 4;

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

export function renderReminders() {
  const container = document.getElementById('reading-reminders');
  if (!container) return;
  container.textContent = '';

  const stale = Object.entries(state.booksData)
    .filter(([, b]) => b.status === 'reading')
    .map(([id, book]) => {
      const last = lastActivityDate(book);
      return { id, book, days: last ? daysSince(last) : null };
    })
    .filter(({ days }) => days === null || days >= STALE_DAYS)
    .sort((a, b) => (b.days ?? Infinity) - (a.days ?? Infinity))
    .slice(0, MAX_ROWS);

  if (!stale.length) return;

  const title = document.createElement('div');
  title.className = 'reminders-title';
  title.textContent = t('reminders_title');
  container.appendChild(title);

  for (const { id, book, days } of stale) {
    const row = document.createElement('button');
    row.className = 'reminder-row';
    row.type = 'button';
    row.addEventListener('click', () => showBookDetails(id));

    const label = document.createElement('span');
    label.className = 'reminder-book';
    label.textContent = book.title;
    row.appendChild(label);

    const meta = document.createElement('span');
    meta.className = 'reminder-meta';
    if (days === null) {
      meta.textContent = t('reminders_not_started');
    } else {
      const daysLabel = days === 1 ? t('reminders_days_ago_sg') : t('reminders_days_ago_pl');
      meta.textContent = `${t('reminders_last_read')} ${days} ${daysLabel}`;
    }
    row.appendChild(meta);

    container.appendChild(row);
  }
}
