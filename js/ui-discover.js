import { debounce, cleanText, toPositiveInt } from './state.js';
import { openFormModal } from './ui-form-modal.js';
import { applyBookFromAPI } from './ui-search.js';
import { t } from './i18n.js';

let discoverActive = false;

export function closePreviewModal() {
  document.getElementById('discover-preview').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function openPreviewModal(doc) {
  const modal = document.getElementById('discover-preview');
  const content = document.getElementById('discover-preview-content');
  const overlay = document.getElementById('modal-overlay');

  const coverSrc = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : null;

  const sentence = typeof doc.first_sentence === 'object'
    ? (doc.first_sentence?.value || '')
    : (doc.first_sentence || '');

  const year = doc.first_publish_year || '';
  const pages = doc.number_of_pages_median || '';
  const author = doc.author_name?.[0] || 'Unknown';

  const metaParts = [];
  if (year) metaParts.push(`<span class="dp-meta-item"><span class="dp-meta-label">${t('preview_year')}</span> ${year}</span>`);
  if (pages) metaParts.push(`<span class="dp-meta-item"><span class="dp-meta-label">${t('preview_pages')}</span> ${pages}</span>`);

  content.innerHTML = `
    <div class="dp-header">
      <span class="dp-heading">${t('preview_heading')}</span>
    </div>
    <div class="dp-body">
      <div class="dp-cover-col">
        ${coverSrc
          ? `<img class="dp-cover" src="${coverSrc}" alt="" loading="lazy">`
          : `<div class="dp-cover dp-cover-ph">${(doc.title || 'U').charAt(0).toUpperCase()}</div>`
        }
      </div>
      <div class="dp-info-col">
        <div class="dp-title">${doc.title || 'Unknown'}</div>
        <div class="dp-author">by ${author}</div>
        ${metaParts.length ? `<div class="dp-meta">${metaParts.join('<span class="dp-meta-sep">·</span>')}</div>` : ''}
        <div class="dp-synopsis-label">&gt; ${t('preview_synopsis')}</div>
        <div class="dp-synopsis">${sentence || t('preview_no_synopsis')}</div>
        <button class="dp-add-btn" id="dp-add-btn">[ ${t('preview_add_btn')} ]</button>
      </div>
    </div>`;

  modal.style.display = 'flex';
  overlay.style.display = 'block';

  document.getElementById('dp-add-btn').addEventListener('click', () => {
    closePreviewModal();
    openFormModal();
    applyBookFromAPI(doc);
  });
}

function buildDiscoverCard(doc) {
  const card = document.createElement('div');
  card.className = 'discover-card';

  const coverWrap = document.createElement('div');
  coverWrap.className = 'discover-cover-wrap';
  if (doc.cover_i) {
    const img = document.createElement('img');
    img.className = 'discover-cover';
    img.src = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    coverWrap.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'discover-cover discover-cover-placeholder';
    ph.textContent = (doc.title || 'U').charAt(0).toUpperCase();
    coverWrap.appendChild(ph);
  }
  card.appendChild(coverWrap);

  const info = document.createElement('div');
  info.className = 'discover-info';

  const titleEl = document.createElement('div');
  titleEl.className = 'discover-title';
  titleEl.textContent = doc.title || 'Unknown';
  info.appendChild(titleEl);

  const authorEl = document.createElement('div');
  authorEl.className = 'discover-author';
  authorEl.textContent = `by ${doc.author_name?.[0] || 'Unknown'}`;
  info.appendChild(authorEl);

  const year = doc.first_publish_year ? `${doc.first_publish_year}` : '';
  const pages = doc.number_of_pages_median ? `${doc.number_of_pages_median}p` : '';
  const metaText = [year, pages].filter(Boolean).join(' · ');
  if (metaText) {
    const metaEl = document.createElement('div');
    metaEl.className = 'discover-meta';
    metaEl.textContent = metaText;
    info.appendChild(metaEl);
  }

  const sentence = typeof doc.first_sentence === 'object'
    ? (doc.first_sentence?.value || '')
    : (doc.first_sentence || '');
  if (sentence) {
    const desc = document.createElement('div');
    desc.className = 'discover-desc';
    desc.textContent = sentence.length > 200 ? sentence.slice(0, 200) + '…' : sentence;
    info.appendChild(desc);
  }

  card.appendChild(info);

  const addBtn = document.createElement('button');
  addBtn.className = 'discover-add-btn';
  addBtn.textContent = t('discover_add');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openFormModal();
    applyBookFromAPI(doc);
  });
  card.appendChild(addBtn);

  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openPreviewModal(doc));

  return card;
}

export async function fetchDiscover(query) {
  const section = document.getElementById('discover-section');
  const grid = document.getElementById('books-grid');
  if (!section || !grid) return;

  discoverActive = true;
  grid.style.display = 'none';
  section.style.display = 'block';
  section.innerHTML = `
    <div class="discover-status-bar">
      <span class="discover-status-label" data-i18n="discover_header">${t('discover_header')}</span>
    </div>
    <div class="discover-loading">&gt; ${t('discover_querying')} "${query.toUpperCase()}"...</div>`;

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=title,author_name,first_publish_year,number_of_pages_median,first_sentence,cover_i,subject`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.docs?.length) {
      section.innerHTML = `
        <div class="discover-status-bar">
          <span class="discover-status-label">${t('discover_header')}</span>
        </div>
        <div class="discover-loading discover-empty">&gt; ${t('discover_no_results')}: "${query.toUpperCase()}"</div>`;
      return;
    }

    const docs = data.docs.map(doc => ({
      ...doc,
      title: cleanText(doc.title, 240) || 'Unknown',
      author_name: [cleanText(doc.author_name?.[0], 140) || 'Unknown'],
      number_of_pages_median: toPositiveInt(doc.number_of_pages_median),
      cover_i: toPositiveInt(doc.cover_i),
    }));

    section.innerHTML = `
      <div class="discover-status-bar">
        <span class="discover-status-label">${t('discover_header')}</span>
        <span class="discover-count">"${query}" — ${docs.length} ${t('discover_found')}</span>
      </div>`;
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'discover-grid';
    docs.forEach(doc => resultsGrid.appendChild(buildDiscoverCard(doc)));
    section.appendChild(resultsGrid);

  } catch (err) {
    console.warn('Discover fetch failed:', err);
    section.innerHTML = `
      <div class="discover-status-bar">
        <span class="discover-status-label">${t('discover_header')}</span>
      </div>
      <div class="discover-loading discover-error">&gt; ${t('discover_error')}</div>`;
  }
}

export function clearDiscover() {
  discoverActive = false;
  const section = document.getElementById('discover-section');
  const grid = document.getElementById('books-grid');
  if (section) section.style.display = 'none';
  if (grid) grid.style.display = '';
}

export function isDiscoverActive() { return discoverActive; }

export const debouncedFetch = debounce(fetchDiscover, 550);
