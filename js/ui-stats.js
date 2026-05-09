import { state } from './state.js';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ── Data helpers ──────────────────────────────────────────────────────────────
function allBooks()      { return Object.values(state.booksData); }
function completed()     { return allBooks().filter(b => b.status === 'completed'); }
function allSessions()   {
  return allBooks().flatMap(b => (b.sessions || []).map(s => ({ ...s })));
}

function pagesPerMonth() {
  const map = {};
  for (const s of allSessions()) {
    const d = String(s.date || '');
    const m = d.slice(0, 7); // "2025-03"
    if (!m || m.length < 7) continue;
    map[m] = (map[m] || 0) + (s.pages || 0);
  }
  return map;
}

function booksPerMonth() {
  const map = {};
  for (const b of completed()) {
    const raw = String(b.completed || '');
    // handle "March 2025", "2025-03-15", "March 15, 2025" etc.
    const parsed = new Date(raw);
    if (!isNaN(parsed)) {
      const m = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
      map[m] = (map[m] || 0) + 1;
    }
  }
  return map;
}

function ratingByGenre() {
  const map = {};
  for (const b of allBooks()) {
    if (!b.rating || !b.category) continue;
    if (!map[b.category]) map[b.category] = { sum: 0, count: 0 };
    map[b.category].sum   += b.rating;
    map[b.category].count += 1;
  }
  return Object.entries(map)
    .map(([genre, { sum, count }]) => ({ genre, avg: sum / count, count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);
}

function topCategories() {
  const map = {};
  for (const b of allBooks()) {
    const cat = b.category || 'Other';
    map[cat] = (map[cat] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

// ── DOM builders ──────────────────────────────────────────────────────────────
function makeEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls)  el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

function buildSummary() {
  const books = allBooks();
  const done  = completed();
  const totalPages = allSessions().reduce((s, x) => s + (x.pages || 0), 0);
  const avgRating  = done.filter(b => b.rating).reduce((s, b, _, a) =>
    s + b.rating / a.length, 0);

  const wrap = makeEl('div', 'stats-summary-grid');
  const cards = [
    { label: 'TOTAL BOOKS',    value: books.length },
    { label: 'COMPLETED',      value: done.length },
    { label: 'PAGES READ',     value: totalPages.toLocaleString() },
    { label: 'AVG RATING',     value: done.filter(b => b.rating).length ? avgRating.toFixed(1) + ' ★' : '—' },
  ];
  for (const { label, value } of cards) {
    const card = makeEl('div', 'stats-summary-card');
    card.appendChild(makeEl('div', 'stats-summary-value', value));
    card.appendChild(makeEl('div', 'stats-summary-label', label));
    wrap.appendChild(card);
  }
  return wrap;
}

function buildBarChart(title, dataMap, unit) {
  const section = makeEl('div', 'stats-section');
  section.appendChild(makeEl('div', 'stats-section-title', title));

  const entries = Object.entries(dataMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  if (!entries.length) {
    section.appendChild(makeEl('div', 'stats-empty', '> No data yet'));
    return section;
  }

  const max = Math.max(...entries.map(([, v]) => v));
  const chart = makeEl('div', 'stats-bar-chart');

  for (const [key, val] of entries) {
    const col = makeEl('div', 'stats-bar-col');
    const bar = makeEl('div', 'stats-bar');
    const pct = max ? Math.round((val / max) * 100) : 0;
    bar.style.height = `${pct}%`;
    bar.title = `${val} ${unit}`;

    const valEl = makeEl('div', 'stats-bar-val', val >= 1000 ? `${(val/1000).toFixed(1)}k` : String(val));
    const lbl = makeEl('div', 'stats-bar-lbl');
    // show "Mar" or "03" from "2025-03"
    const parts = key.split('-');
    lbl.textContent = parts.length === 2 ? (MONTHS[parseInt(parts[1], 10) - 1] ?? parts[1]) : key;

    col.appendChild(valEl);
    col.appendChild(bar);
    col.appendChild(lbl);
    chart.appendChild(col);
  }
  section.appendChild(chart);
  return section;
}

function buildGenreRatings() {
  const section = makeEl('div', 'stats-section');
  section.appendChild(makeEl('div', 'stats-section-title', 'AVG RATING BY GENRE'));

  const data = ratingByGenre();
  if (!data.length) { section.appendChild(makeEl('div', 'stats-empty', '> No rated books yet')); return section; }

  const rows = makeEl('div', 'stats-genre-rows');
  for (const { genre, avg, count } of data) {
    const row = makeEl('div', 'stats-genre-row');
    const lbl = makeEl('div', 'stats-genre-lbl', genre);
    const bar = makeEl('div', 'stats-genre-bar-wrap');
    const fill = makeEl('div', 'stats-genre-fill');
    fill.style.width = `${(avg / 5) * 100}%`;
    const val = makeEl('div', 'stats-genre-val', `${avg.toFixed(1)} ★ (${count})`);
    bar.appendChild(fill);
    row.appendChild(lbl);
    row.appendChild(bar);
    row.appendChild(val);
    rows.appendChild(row);
  }
  section.appendChild(rows);
  return section;
}

function buildTopCategories() {
  const section = makeEl('div', 'stats-section');
  section.appendChild(makeEl('div', 'stats-section-title', 'TOP CATEGORIES'));

  const data = topCategories();
  if (!data.length) { section.appendChild(makeEl('div', 'stats-empty', '> No books yet')); return section; }

  const max = data[0][1];
  const rows = makeEl('div', 'stats-genre-rows');
  for (const [cat, count] of data) {
    const row = makeEl('div', 'stats-genre-row');
    const lbl = makeEl('div', 'stats-genre-lbl', cat);
    const bar = makeEl('div', 'stats-genre-bar-wrap');
    const fill = makeEl('div', 'stats-genre-fill stats-genre-fill--cyan');
    fill.style.width = `${(count / max) * 100}%`;
    const val = makeEl('div', 'stats-genre-val', String(count));
    bar.appendChild(fill);
    row.appendChild(lbl);
    row.appendChild(bar);
    row.appendChild(val);
    rows.appendChild(row);
  }
  section.appendChild(rows);
  return section;
}

// ── Public API ────────────────────────────────────────────────────────────────
export function openStatsPanel() {
  const content = document.getElementById('stats-content');
  const panel   = document.getElementById('stats-panel');
  const overlay = document.getElementById('modal-overlay');
  if (!content || !panel) return;

  content.textContent = '';
  content.appendChild(buildSummary());
  content.appendChild(buildBarChart('PAGES READ / MONTH', pagesPerMonth(), 'pages'));
  content.appendChild(buildBarChart('BOOKS FINISHED / MONTH', booksPerMonth(), 'books'));
  content.appendChild(buildGenreRatings());
  content.appendChild(buildTopCategories());

  panel.style.display   = 'flex';
  overlay.style.display = 'block';
}

export function closeStatsPanel() {
  document.getElementById('stats-panel').style.display   = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

export function initStatsPanel() {
  document.getElementById('close-stats-panel')?.addEventListener('click', closeStatsPanel);
}
