import { state, escHtml, cleanText, toPositiveInt } from './state.js';
import { openFormModal } from './ui-form-modal.js';
import { applyBookFromAPI } from './ui-search.js';
import { t } from './i18n.js';

const DEFAULT_GENRES = ['Fantasy', 'History', 'Science', 'Biography', 'Economics'];

function getGenreProfile() {
  const genreCount = {};
  let totalCompleted = 0;
  for (const b of Object.values(state.booksData)) {
    if (b.status === 'completed') {
      totalCompleted++;
      if (b.category && b.category !== 'Other') {
        genreCount[b.category] = (genreCount[b.category] || 0) + 1;
      }
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

async function fetchForGenre(genre) {
  const subject = genre.toLowerCase().replaceAll(' ', '_');
  try {
    const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=8&fields=title,author_name,first_publish_year,number_of_pages_median,cover_i,subject`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

function buildGenreBars(topGenres, genreCount) {
  if (!topGenres.length) return '';
  const max = genreCount[topGenres[0]];
  return topGenres.map(genre => {
    const count = genreCount[genre];
    const filled = Math.round((count / max) * 12);
    const bar = '█'.repeat(filled) + '░'.repeat(12 - filled);
    return `
      <div class="genre-bar-row">
        <span class="genre-bar-label">${escHtml(genre.toUpperCase())}</span>
        <span class="genre-bar">${bar}</span>
        <span class="genre-bar-count">${count}×</span>
      </div>`;
  }).join('');
}

function buildRecCard(doc, genre, completedInGenre) {
  const title = cleanText(doc.title, 200) || 'Unknown';
  const author = cleanText(doc.author_name?.[0], 120) || 'Unknown';
  const coverId = toPositiveInt(doc.cover_i);

  const card = document.createElement('div');
  card.className = 'rec-card';

  if (coverId) {
    const img = document.createElement('img');
    img.className = 'rec-cover';
    img.src = `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    card.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'rec-cover-placeholder';
    ph.textContent = title.charAt(0).toUpperCase();
    card.appendChild(ph);
  }

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
  reason.textContent = completedInGenre > 0
    ? `> ${completedInGenre} ${genre} ${completedInGenre === 1 ? t('recs_completed_suffix_sg') : t('recs_completed_suffix_pl')}`
    : '> Popular in genre';
  meta.appendChild(reason);

  body.appendChild(meta);
  card.appendChild(body);

  const addBtn = document.createElement('button');
  addBtn.className = 'rec-add-btn';
  addBtn.textContent = t('recs_add');
  addBtn.addEventListener('click', () => {
    const normalizedDoc = {
      ...doc,
      title: cleanText(doc.title, 240) || 'Unknown',
      author_name: [cleanText(doc.author_name?.[0], 140) || 'Unknown'],
      number_of_pages_median: toPositiveInt(doc.number_of_pages_median),
      cover_i: coverId,
    };
    openFormModal();
    applyBookFromAPI(normalizedDoc);
  });
  card.appendChild(addBtn);

  return card;
}

export async function renderRecsPanel() {
  const content = document.getElementById('recs-content');
  if (!content) return;

  const { genreCount, topGenres, totalCompleted } = getGenreProfile();
  const genresToFetch = topGenres.length >= 2
    ? topGenres
    : [...new Set([...topGenres, ...DEFAULT_GENRES])].slice(0, 3);

  const statsLine = totalCompleted > 0
    ? `${t('recs_analyzed')} ${totalCompleted} ${totalCompleted === 1 ? t('recs_completed_suffix_sg') : t('recs_completed_suffix_pl')} ${t('recs_genre_loaded')}`
    : t('recs_no_completed');

  const barsHTML = topGenres.length
    ? buildGenreBars(topGenres, genreCount)
    : `<div class="recs-no-data">${t('recs_no_genre')}</div>`;

  content.innerHTML = `
    <div class="recs-stats-line">${statsLine}</div>
    <div class="recs-section">
      <div class="recs-section-title">${t('recs_genre_profile')}</div>
      <div class="genre-bars">${barsHTML}</div>
    </div>
    <div class="recs-section">
      <div class="recs-section-title">${t('recs_recommended')}</div>
      <div class="rec-cards" id="rec-cards-container">
        <div class="recs-loading">${t('recs_loading')}</div>
      </div>
    </div>`;

  // Async fetch from Open Library
  const existing = getExistingTitles();
  const collected = [];

  for (const genre of genresToFetch) {
    const docs = await fetchForGenre(genre);
    const completedInGenre = genreCount[genre] || 0;
    for (const doc of docs) {
      const normalTitle = (doc.title || '').toLowerCase().trim();
      if (!normalTitle) continue;
      if (existing.has(normalTitle)) continue;
      if (collected.find(c => c.doc.title?.toLowerCase().trim() === normalTitle)) continue;
      collected.push({ doc, genre, completedInGenre });
      if (collected.length >= 9) break;
    }
    if (collected.length >= 9) break;
  }

  const container = document.getElementById('rec-cards-container');
  if (!container) return;

  if (!collected.length) {
    container.innerHTML = `<div class="recs-no-data">${t('recs_no_data')}</div>`;
    return;
  }

  container.innerHTML = '';
  collected.forEach(({ doc, genre, completedInGenre }) =>
    container.appendChild(buildRecCard(doc, genre, completedInGenre))
  );
}

export function openRecsPanel() {
  renderRecsPanel();
  document.getElementById('recommendations-panel').style.display = 'flex';
  document.getElementById('modal-overlay').style.display = 'block';
}

export function closeRecsPanel() {
  document.getElementById('recommendations-panel').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

export function initRecsPanel() {
  document.getElementById('close-recs-panel').addEventListener('click', closeRecsPanel);
}
