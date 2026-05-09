import { state, escHtml, cleanText, toPositiveInt } from './state.js';
import { openFormModal } from './ui-form-modal.js';
import { applyBookFromAPI } from './ui-search.js';
import { showToast } from './ui-feedback.js';
import { t } from './i18n.js';

const API_KEY_STORAGE = 'libra-claude-key';
const DEFAULT_GENRES  = ['Fantasy', 'History', 'Science', 'Biography', 'Economics'];

// ── Stored key helpers ─────────────────────────────────────────────────────────

function getSavedKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }
function saveKey(key)  { localStorage.setItem(API_KEY_STORAGE, key.trim()); }
function clearKey()    { localStorage.removeItem(API_KEY_STORAGE); }

// ── Book profile ───────────────────────────────────────────────────────────────

function getCompletedBooks() {
  return Object.values(state.booksData)
    .filter(b => b.status === 'completed')
    .map(b => ({ title: b.title, author: b.author, category: b.category || 'Other', rating: b.rating || 0 }));
}

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

// ── Claude API ─────────────────────────────────────────────────────────────────

async function getClaudeRecommendations(apiKey, completedBooks) {
  const bookList = completedBooks
    .map(b => `- "${b.title}" by ${b.author} — ${b.category}, Rating: ${b.rating}/5`)
    .join('\n');

  const existingTitles = completedBooks.map(b => b.title).join(', ');

  const prompt = `You are a book recommendation engine. Based on the reading history below, recommend exactly 6 books the user has not yet read.

Reading history:
${bookList}

Return ONLY a valid JSON array, no other text:
[{"title":"Book Title","author":"Author Name","reason":"One-sentence reason under 12 words"}]

Rules:
- Never recommend these titles: ${existingTitles}
- Prioritise their strongest genres but include 1 genre discovery
- Reason must be specific to their taste, not generic`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (res.status === 401) throw new Error('invalid_key');
  if (!res.ok) throw new Error(`api_error_${res.status}`);

  const data = await res.json();
  const raw  = data.content[0].text.trim();
  const json = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}

// ── Open Library enrichment ────────────────────────────────────────────────────

async function enrichFromOpenLibrary(title, author) {
  try {
    const q   = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=1&fields=title,author_name,first_publish_year,number_of_pages_median,cover_i`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.docs?.[0] || null;
  } catch { return null; }
}

// ── Genre-based fallback fetch ─────────────────────────────────────────────────

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

// ── Card builders ──────────────────────────────────────────────────────────────

function makeCoverEl(coverId, title, isAI) {
  if (coverId) {
    const img = document.createElement('img');
    img.className = 'rec-cover';
    img.src = `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    return img;
  }
  const ph = document.createElement('div');
  ph.className = `rec-cover-placeholder${isAI ? ' rec-cover-placeholder--ai' : ''}`;
  ph.textContent = title.charAt(0).toUpperCase();
  return ph;
}

function buildAIRecCard(rec, olDoc) {
  const title   = cleanText(rec.title,  200) || 'Unknown';
  const author  = cleanText(rec.author, 120) || 'Unknown';
  const coverId = olDoc ? toPositiveInt(olDoc.cover_i) : null;

  const card = document.createElement('div');
  card.className = 'rec-card rec-card--ai';
  card.appendChild(makeCoverEl(coverId, title, true));

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

  const aiTag = document.createElement('span');
  aiTag.className = 'rec-tag rec-tag--ai';
  aiTag.textContent = 'AI';
  meta.appendChild(aiTag);

  const reason = document.createElement('span');
  reason.className = 'rec-reason rec-reason--ai';
  reason.textContent = `> ${cleanText(rec.reason, 100)}`;
  meta.appendChild(reason);

  body.appendChild(meta);
  card.appendChild(body);

  const addBtn = document.createElement('button');
  addBtn.className = 'rec-add-btn';
  addBtn.textContent = t('recs_add');
  addBtn.addEventListener('click', () => {
    const base = olDoc || {};
    openFormModal();
    applyBookFromAPI({
      title:                  cleanText(base.title || title, 240) || title,
      author_name:            [cleanText((base.author_name?.[0]) || author, 140) || author],
      number_of_pages_median: toPositiveInt(base.number_of_pages_median),
      cover_i:                coverId,
      first_sentence:         typeof base.first_sentence === 'object'
                                ? base.first_sentence?.value || ''
                                : base.first_sentence || '',
      subject:                Array.isArray(base.subject)
                                ? base.subject.map(String).slice(0, 20)
                                : [],
    });
  });
  card.appendChild(addBtn);

  return card;
}

function buildGenreRecCard(doc, genre, completedInGenre) {
  const title   = cleanText(doc.title,          200) || 'Unknown';
  const author  = cleanText(doc.author_name?.[0], 120) || 'Unknown';
  const coverId = toPositiveInt(doc.cover_i);

  const card = document.createElement('div');
  card.className = 'rec-card';
  card.appendChild(makeCoverEl(coverId, title, false));

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

// ── API key UI ─────────────────────────────────────────────────────────────────

function buildApiKeyEl(savedKey) {
  const isSet = Boolean(savedKey);

  const wrap   = document.createElement('div');
  wrap.className = 'recs-api-section';

  const toggle = document.createElement('div');
  toggle.className = 'recs-api-header';
  toggle.id = 'recs-api-toggle';

  const lbl = document.createElement('span');
  lbl.className = 'recs-api-label';
  lbl.textContent = '⚙ CLAUDE API KEY';

  const status = document.createElement('span');
  status.className = `recs-api-status ${isSet ? 'recs-api-status--set' : 'recs-api-status--unset'}`;
  status.textContent = isSet ? '> key saved ✓' : '> not set — using genre search';

  toggle.appendChild(lbl);
  toggle.appendChild(status);
  wrap.appendChild(toggle);

  const body = document.createElement('div');
  body.className = 'recs-api-body';
  body.id = 'recs-api-body';

  const row = document.createElement('div');
  row.className = 'recs-api-input-row';

  const input = document.createElement('input');
  input.type = 'password';
  input.id = 'recs-api-key-input';
  input.className = 'recs-api-key-input';
  input.placeholder = 'sk-ant-api03-...';
  if (isSet) input.value = savedKey;

  const saveBtn = document.createElement('button');
  saveBtn.id = 'recs-api-save-btn';
  saveBtn.className = 'recs-api-btn recs-api-btn--save';
  saveBtn.textContent = '[ SAVE ]';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'recs-api-clear-btn';
  clearBtn.className = 'recs-api-btn recs-api-btn--clear';
  clearBtn.textContent = '[ CLEAR ]';

  row.appendChild(input);
  row.appendChild(saveBtn);
  row.appendChild(clearBtn);

  const hint = document.createElement('div');
  hint.className = 'recs-api-hint';
  hint.textContent = '> Stored locally · sent only to api.anthropic.com';

  body.appendChild(row);
  body.appendChild(hint);
  wrap.appendChild(body);

  return wrap;
}

function bindApiKeyUI(onRefresh) {
  const body = document.getElementById('recs-api-body');

  document.getElementById('recs-api-toggle')?.addEventListener('click', () => {
    body?.classList.toggle('recs-api-body--open');
  });

  document.getElementById('recs-api-save-btn')?.addEventListener('click', () => {
    const input = document.getElementById('recs-api-key-input');
    const key   = input?.value.trim() || '';
    if (!key.startsWith('sk-ant-')) {
      input?.classList.add('input-error-red');
      setTimeout(() => input?.classList.remove('input-error-red'), 600);
      return;
    }
    saveKey(key);
    import('./auth.js').then(({ pushSettingsToCloud, buildSettings }) => {
      pushSettingsToCloud(buildSettings()).catch(() => {});
    }).catch(() => {});
    onRefresh();
  });

  document.getElementById('recs-api-clear-btn')?.addEventListener('click', () => {
    clearKey();
    import('./auth.js').then(({ pushSettingsToCloud, buildSettings }) => {
      pushSettingsToCloud(buildSettings()).catch(() => {});
    }).catch(() => {});
    onRefresh();
  });
}

// ── Panel shell builder ────────────────────────────────────────────────────────

function buildPanelShell(content, apiKey, completedBooks, topGenres, genreCount, totalCompleted) {
  const completedSuffix = totalCompleted === 1 ? t('recs_completed_suffix_sg') : t('recs_completed_suffix_pl');
  const statsLine = totalCompleted > 0
    ? `${t('recs_analyzed')} ${totalCompleted} ${completedSuffix} ${t('recs_genre_loaded')}`
    : t('recs_no_completed');

  content.textContent = '';
  content.appendChild(buildApiKeyEl(apiKey));

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
  if (apiKey) {
    const badge = document.createElement('span');
    badge.className = 'recs-ai-badge';
    badge.textContent = 'AI';
    recTitle.appendChild(badge);
  }
  recSection.appendChild(recTitle);
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'rec-cards';
  cardsContainer.id = 'rec-cards-container';
  const loadEl = document.createElement('div');
  loadEl.className = 'recs-loading';
  loadEl.textContent = apiKey && completedBooks.length
    ? '> Analysing your reading pattern...'
    : t('recs_loading');
  cardsContainer.appendChild(loadEl);
  recSection.appendChild(cardsContainer);
  content.appendChild(recSection);
}

// ── AI path (returns true if cards were rendered) ──────────────────────────────

async function tryAIRecs(container, apiKey, completedBooks) {
  try {
    const recs = await getClaudeRecommendations(apiKey, completedBooks);
    if (!Array.isArray(recs) || !recs.length) throw new Error('empty_response');

    const existing = getExistingTitles();
    const filtered = recs
      .filter(r => r?.title && !existing.has(r.title.toLowerCase().trim()))
      .slice(0, 6);

    const enriched = await Promise.all(
      filtered.map(rec =>
        enrichFromOpenLibrary(rec.title, rec.author).then(ol => ({ rec, ol }))
      )
    );

    if (!document.getElementById('rec-cards-container')) return true;
    container.innerHTML = '';
    enriched.forEach(({ rec, ol }) => container.appendChild(buildAIRecCard(rec, ol)));
    return true;

  } catch (err) {
    if (err.message === 'invalid_key') {
      clearKey();
      showToast('Invalid API key — cleared.', 'delete');
    }
    if (document.getElementById('rec-cards-container')) {
      container.textContent = '';
      const aiErrEl = document.createElement('div');
      aiErrEl.className = 'recs-loading';
      aiErrEl.textContent = '> AI unavailable — loading genre recs...';
      container.appendChild(aiErrEl);
    }
    return false;
  }
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

export async function renderRecsPanel() {
  const content = document.getElementById('recs-content');
  if (!content) return;

  const apiKey         = getSavedKey();
  const completedBooks = getCompletedBooks();
  const { genreCount, topGenres, totalCompleted } = getGenreProfile();
  const genresToFetch  = topGenres.length >= 2
    ? topGenres
    : [...new Set([...topGenres, ...DEFAULT_GENRES])].slice(0, 3);

  buildPanelShell(content, apiKey, completedBooks, topGenres, genreCount, totalCompleted);
  bindApiKeyUI(() => renderRecsPanel());

  const container = document.getElementById('rec-cards-container');
  if (!container) return;

  if (apiKey && completedBooks.length >= 1) {
    const done = await tryAIRecs(container, apiKey, completedBooks);
    if (done) return;
  }

  await loadGenreRecs(container, genresToFetch, genreCount);
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
