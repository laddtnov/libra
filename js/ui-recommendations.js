import { state, escHtml, cleanText, toPositiveInt } from './state.js';
import { openFormModal } from './ui-form-modal.js';
import { applyBookFromAPI } from './ui-search.js';
import { t } from './i18n.js';
import { trapFocus, focusFirst } from './ui-utils.js';

let _releaseTrap = null;
let _triggerEl = null;

const DEFAULT_GENRES = ['Fantasy', 'History', 'Science', 'Biography', 'Economics'];

// ── Genre profile ──────────────────────────────────────────────────────────────

function getGenreProfile() {
  const genreCount = {};
  let totalCompleted = 0;
  for (const b of Object.values(state.booksData)) {
    if (b.status === 'completed') {
      totalCompleted++;
      if (b.category && b.category !== 'Other')
        genreCount[b.category] = (genreCount[b.category] || 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
  return { genreCount, topGenres, totalCompleted };
}

function getExistingTitles() {
  return new Set(Object.values(state.booksData).map(b => b.title.toLowerCase().trim()));
}

// ── Genre-based fetch ───────────────────────────────────────────────────────────

async function fetchForGenre(genre) {
  const subject = genre.toLowerCase().replaceAll(' ', '_');
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=8&fields=title,author_name,first_publish_year,number_of_pages_median,cover_i,subject`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch { return []; }
}

// ── Card builder ───────────────────────────────────────────────────────────────

function makeCoverEl(coverId, title) {
  if (coverId) {
    const img = document.createElement('img');
    img.className = 'rec-cover';
    img.src = `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    return img;
  }
  const ph = document.createElement('div');
  ph.className = 'rec-cover-placeholder';
  ph.textContent = title.charAt(0).toUpperCase();
  return ph;
}

function buildGenreRecCard(doc, genre, completedInGenre) {
  const title   = cleanText(doc.title,          200) || 'Unknown';
  const author  = cleanText(doc.author_name?.[0], 120) || 'Unknown';
  const coverId = toPositiveInt(doc.cover_i);

  const card = document.createElement('div');
  card.className = 'rec-card';
  card.appendChild(makeCoverEl(coverId, title));

  const body = document.createElement('div');
  body.className = 'rec-card-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'rec-card-title';
  titleEl.textContent = title;
  body.appendChild(titleEl);

  const authorEl = document.createElement('div');
  authorEl.className = 'rec-card-author';
  authorEl.textContent = `by ${author}`;
  body.appendChild(authorEl);

  const meta = document.createElement('div');
  meta.className = 'rec-card-meta';

  const tag = document.createElement('span');
  tag.className = 'rec-tag';
  tag.textContent = genre;
  meta.appendChild(tag);

  const reason = document.createElement('span');
  reason.className = 'rec-reason';
  const suffix = completedInGenre === 1 ? t('recs_completed_suffix_sg') : t('recs_completed_suffix_pl');
  reason.textContent = completedInGenre > 0
    ? `> ${completedInGenre} ${genre} ${suffix}`
    : '> Popular in genre';
  meta.appendChild(reason);

  body.appendChild(meta);
  card.appendChild(body);

  const addBtn = document.createElement('button');
  addBtn.className = 'rec-add-btn';
  addBtn.textContent = t('recs_add');
  addBtn.addEventListener('click', () => {
    openFormModal();
    applyBookFromAPI({
      title:                  cleanText(doc.title, 240) || 'Unknown',
      author_name:            [cleanText(doc.author_name?.[0], 140) || 'Unknown'],
      number_of_pages_median: toPositiveInt(doc.number_of_pages_median),
      cover_i:                coverId,
      first_sentence:         typeof doc.first_sentence === 'object'
                                ? doc.first_sentence?.value || ''
                                : doc.first_sentence || '',
      subject:                Array.isArray(doc.subject)
                                ? doc.subject.map(String).slice(0, 20)
                                : [],
    });
  });
  card.appendChild(addBtn);

  return card;
}

// ── Genre bars ─────────────────────────────────────────────────────────────────

function buildGenreBars(topGenres, genreCount) {
  if (!topGenres.length) return '';
  const max = genreCount[topGenres[0]];
  return topGenres.map(genre => {
    const count  = genreCount[genre];
    const filled = Math.round((count / max) * 12);
    const bar    = '█'.repeat(filled) + '░'.repeat(12 - filled);
    return `
      <div class="genre-bar-row">
        <span class="genre-bar-label">${escHtml(genre.toUpperCase())}</span>
        <span class="genre-bar">${bar}</span>
        <span class="genre-bar-count">${count}×</span>
      </div>`;
  }).join('');
}

// ── Panel shell builder ────────────────────────────────────────────────────────

function buildPanelShell(content, topGenres, genreCount, totalCompleted) {
  const completedSuffix = totalCompleted === 1 ? t('recs_completed_suffix_sg') : t('recs_completed_suffix_pl');
  const statsLine = totalCompleted > 0
    ? `${t('recs_analyzed')} ${totalCompleted} ${completedSuffix} ${t('recs_genre_loaded')}`
    : t('recs_no_completed');

  content.textContent = '';

  const statsEl = document.createElement('div');
  statsEl.className = 'recs-stats-line';
  statsEl.textContent = statsLine;
  content.appendChild(statsEl);

  const genreSection = document.createElement('div');
  genreSection.className = 'recs-section';
  const genreTitle = document.createElement('div');
  genreTitle.className = 'recs-section-title';
  genreTitle.textContent = t('recs_genre_profile');
  genreSection.appendChild(genreTitle);
  const genreBarsEl = document.createElement('div');
  genreBarsEl.className = 'genre-bars';
  if (topGenres.length) {
    genreBarsEl.innerHTML = buildGenreBars(topGenres, genreCount);
  } else {
    const noGenre = document.createElement('div');
    noGenre.className = 'recs-no-data';
    noGenre.textContent = t('recs_no_genre');
    genreBarsEl.appendChild(noGenre);
  }
  genreSection.appendChild(genreBarsEl);
  content.appendChild(genreSection);

  const recSection = document.createElement('div');
  recSection.className = 'recs-section';
  const recTitle = document.createElement('div');
  recTitle.className = 'recs-section-title';
  recTitle.textContent = t('recs_recommended');
  recSection.appendChild(recTitle);
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'rec-cards';
  cardsContainer.id = 'rec-cards-container';
  const loadEl = document.createElement('div');
  loadEl.className = 'recs-loading';
  loadEl.textContent = t('recs_loading');
  cardsContainer.appendChild(loadEl);
  recSection.appendChild(cardsContainer);
  content.appendChild(recSection);
}

// ── Genre fallback ─────────────────────────────────────────────────────────────

function tryCollect(doc, genre, completedInGenre, existing, collected) {
  const normalTitle = (doc.title || '').toLowerCase().trim();
  if (!normalTitle || existing.has(normalTitle)) return false;
  if (collected.some(c => c.doc.title?.toLowerCase().trim() === normalTitle)) return false;
  collected.push({ doc, genre, completedInGenre });
  return collected.length >= 9;
}

async function loadGenreRecs(container, genresToFetch, genreCount) {
  const existing  = getExistingTitles();
  const collected = [];

  for (const genre of genresToFetch) {
    const docs             = await fetchForGenre(genre);
    const completedInGenre = genreCount[genre] || 0;
    for (const doc of docs) {
      if (tryCollect(doc, genre, completedInGenre, existing, collected)) break;
    }
    if (collected.length >= 9) break;
  }

  if (!document.getElementById('rec-cards-container')) return;

  if (!collected.length) {
    container.textContent = '';
    const noDataEl = document.createElement('div');
    noDataEl.className = 'recs-no-data';
    noDataEl.textContent = t('recs_no_data');
    container.appendChild(noDataEl);
    return;
  }

  container.innerHTML = '';
  collected.forEach(({ doc, genre, completedInGenre }) =>
    container.appendChild(buildGenreRecCard(doc, genre, completedInGenre))
  );
}

// ── Main render ────────────────────────────────────────────────────────────────

async function renderRecsPanel() {
  const content = document.getElementById('recs-content');
  if (!content) return;

  const { genreCount, topGenres, totalCompleted } = getGenreProfile();
  const genresToFetch = topGenres.length >= 2
    ? topGenres
    : [...new Set([...topGenres, ...DEFAULT_GENRES])].slice(0, 3);

  buildPanelShell(content, topGenres, genreCount, totalCompleted);

  const container = document.getElementById('rec-cards-container');
  if (!container) return;

  await loadGenreRecs(container, genresToFetch, genreCount);
}

export function openRecsPanel() {
  renderRecsPanel();
  const panel = document.getElementById('recommendations-panel');
  panel.style.display = 'flex';
  document.getElementById('modal-overlay').style.display = 'block';

  _triggerEl = document.activeElement;
  _releaseTrap = trapFocus(panel, closeRecsPanel);
  focusFirst(panel);
}

export function closeRecsPanel() {
  document.getElementById('recommendations-panel').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';

  if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
  if (_triggerEl) { _triggerEl.focus?.(); _triggerEl = null; }
}

export function initRecsPanel() {
  document.getElementById('close-recs-panel').addEventListener('click', closeRecsPanel);
}
