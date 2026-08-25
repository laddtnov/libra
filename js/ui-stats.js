import { state } from './state.js';
import { trapFocus, focusFirst } from './ui-utils.js';

let _releaseTrap = null;
let _triggerEl = null;

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const DAY_MS         = 86400000;
const HEAT_DAYS      = 365;  // rolling window, today inclusive
const HEAT_TIERS     = 4;    // tier 0 is "no activity"; 1..4 are the shaded steps
const HEAT_PER_TIER  = 15;   // pages per step — 1-15 → t1, 16-30 → t2, … 46+ → t4

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

// Session dates are written as UTC day keys (see ui-streak.js), so the grid is
// built on UTC boundaries too — otherwise a late-evening session in a negative
// UTC offset would land on the wrong square.
function utcDayKey(d) { return d.toISOString().slice(0, 10); }

function dailyPages() {
  const map = {};
  for (const s of allSessions()) {
    const d = String(s.date || '').slice(0, 10); // "2025-03-14"
    if (d.length < 10) continue;
    map[d] = (map[d] || 0) + (s.pages || 0);
  }
  return map;
}

function heatTier(pages) {
  if (!pages) return 0;
  return Math.min(HEAT_TIERS, Math.floor((pages - 1) / HEAT_PER_TIER) + 1);
}

function booksPerMonth() {
  const map = {};
  for (const b of completed()) {
    const raw = String(b.completed || '');
    // handle "March 2025", "2025-03-15", "March 15, 2025" etc.
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
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
    lbl.textContent = parts.length === 2 ? (MONTHS[Number.parseInt(parts[1], 10) - 1] ?? parts[1]) : key;

    col.appendChild(valEl);
    col.appendChild(bar);
    col.appendChild(lbl);
    chart.appendChild(col);
  }
  section.appendChild(chart);
  return section;
}

function buildHeatmap() {
  const section = makeEl('div', 'stats-section');
  section.appendChild(makeEl('div', 'stats-section-title', 'READING ACTIVITY'));

  const pages = dailyPages();
  if (!Object.keys(pages).length) {
    section.appendChild(makeEl('div', 'stats-empty', '> No reading sessions logged yet'));
    return section;
  }

  // Window: today back HEAT_DAYS-1, extended left to the preceding Sunday so
  // every column is a full Sun-Sat week.
  const end       = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start     = new Date(end.getTime() - (HEAT_DAYS - 1) * DAY_MS);
  const gridStart = new Date(start.getTime() - start.getUTCDay() * DAY_MS);
  const weeks     = Math.ceil((Math.round((end - gridStart) / DAY_MS) + 1) / 7);

  const layout = makeEl('div', 'heat-layout');
  layout.appendChild(makeEl('div', 'heat-corner'));

  // Month labels, one per column where the month turns over. A label's glyphs are
  // ~2.5 columns wide while its grid box is only one, so labels closer than
  // MIN_LABEL_COLS would collide — that also drops the leading partial month,
  // whose stub column sits right next to the next month's label.
  const MIN_LABEL_COLS = 3;
  const months = makeEl('div', 'heat-months');
  months.style.gridTemplateColumns = `repeat(${weeks}, var(--heat-cell))`;
  let lastMonth = new Date(gridStart).getUTCMonth();
  let lastLabelCol = -MIN_LABEL_COLS;
  for (let w = 1; w < weeks; w++) {
    const m = new Date(gridStart.getTime() + w * 7 * DAY_MS).getUTCMonth();
    if (m === lastMonth) continue;
    lastMonth = m;
    if (w - lastLabelCol < MIN_LABEL_COLS) continue;
    const lbl = makeEl('div', 'heat-month-lbl', MONTHS[m]);
    lbl.style.gridColumn = String(w + 1);
    months.appendChild(lbl);
    lastLabelCol = w;
  }
  layout.appendChild(months);

  // Day-of-week labels — alternating rows only, as GitHub does.
  const days = makeEl('div', 'heat-days');
  for (const [row, txt] of [[1, 'MON'], [3, 'WED'], [5, 'FRI']]) {
    const lbl = makeEl('div', 'heat-day-lbl', txt);
    lbl.style.gridRow = String(row + 1);
    days.appendChild(lbl);
  }
  layout.appendChild(days);

  // Cells in chronological order; grid-auto-flow:column fills each week downward.
  const grid = makeEl('div', 'heat-grid');
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(gridStart.getTime() + i * DAY_MS);
    if (d < start || d > end) {
      grid.appendChild(makeEl('div', 'heat-cell heat-pad'));
      continue;
    }
    const key  = utcDayKey(d);
    const p    = pages[key] || 0;
    const cell = makeEl('div', `heat-cell heat-t${heatTier(p)}`);
    cell.title = p ? `${key}: ${p} pages` : `${key}: no sessions`;
    grid.appendChild(cell);
  }
  layout.appendChild(grid);

  const scroll = makeEl('div', 'heat-scroll');
  scroll.appendChild(layout);
  section.appendChild(scroll);

  const legend = makeEl('div', 'heat-legend');
  legend.appendChild(makeEl('span', 'heat-legend-lbl', 'LESS'));
  for (let t = 0; t <= HEAT_TIERS; t++) legend.appendChild(makeEl('span', `heat-cell heat-t${t}`));
  legend.appendChild(makeEl('span', 'heat-legend-lbl', 'MORE'));
  section.appendChild(legend);

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
  content.appendChild(buildHeatmap());
  content.appendChild(buildGenreRatings());
  content.appendChild(buildTopCategories());

  panel.style.display   = 'flex';
  overlay.style.display = 'block';

  _triggerEl = document.activeElement;
  _releaseTrap = trapFocus(panel, closeStatsPanel);
  focusFirst(panel);
}

export function closeStatsPanel() {
  document.getElementById('stats-panel').style.display   = 'none';
  document.getElementById('modal-overlay').style.display = 'none';

  if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
  if (_triggerEl) { _triggerEl.focus?.(); _triggerEl = null; }
}

export function initStatsPanel() {
  document.getElementById('close-stats-panel')?.addEventListener('click', closeStatsPanel);
}
