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
  const modal   = document.getElementById('discover-preview');
  const content = document.getElementById('discover-preview-content');
  const overlay = document.getElementById('modal-overlay');

  const coverSrc = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : null;

  const sentence = doc.first_sentence || '';
  const year     = doc.first_publish_year || '';
  const pages    = doc.number_of_pages_median || '';
  const author   = doc.author_name?.[0] || 'Unknown';

  content.textContent = '';

  // header
  const header  = document.createElement('div');
  header.className = 'dp-header';
  const heading = document.createElement('span');
  heading.className = 'dp-heading';
  heading.textContent = t('preview_heading');
  header.appendChild(heading);

  // body
  const body = document.createElement('div');
  body.className = 'dp-body';

  // cover col
  const coverCol = document.createElement('div');
  coverCol.className = 'dp-cover-col';
  if (coverSrc) {
    const img = document.createElement('img');
    img.className = 'dp-cover';
    img.src = coverSrc;
    img.alt = '';
    img.loading = 'lazy';
    coverCol.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'dp-cover dp-cover-ph';
    ph.textContent = (doc.title || 'U').charAt(0).toUpperCase();
    coverCol.appendChild(ph);
  }

  // info col
  const infoCol = document.createElement('div');
  infoCol.className = 'dp-info-col';

  const titleEl = document.createElement('div');
  titleEl.className = 'dp-title';
  titleEl.textContent = doc.title || 'Unknown';

  const authorEl = document.createElement('div');
  authorEl.className = 'dp-author';
  authorEl.textContent = `by ${author}`;

  infoCol.appendChild(titleEl);
  infoCol.appendChild(authorEl);

  if (year || pages) {
    const metaDiv = document.createElement('div');
    metaDiv.className = 'dp-meta';
    const parts = [];
    if (year) {
      const item = document.createElement('span');
      item.className = 'dp-meta-item';
      const lbl = document.createElement('span');
      lbl.className = 'dp-meta-label';
      lbl.textContent = t('preview_year');
      item.appendChild(lbl);
      item.appendChild(document.createTextNode(` ${year}`));
      parts.push(item);
    }
    if (pages) {
      const item = document.createElement('span');
      item.className = 'dp-meta-item';
      const lbl = document.createElement('span');
      lbl.className = 'dp-meta-label';
      lbl.textContent = t('preview_pages');
      item.appendChild(lbl);
      item.appendChild(document.createTextNode(` ${pages}`));
      parts.push(item);
    }
    parts.forEach((item, i) => {
      metaDiv.appendChild(item);
      if (i < parts.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'dp-meta-sep';
        sep.textContent = '·';
        metaDiv.appendChild(sep);
      }
    });
    infoCol.appendChild(metaDiv);
  }

  const synLabel = document.createElement('div');
  synLabel.className = 'dp-synopsis-label';
  synLabel.textContent = `> ${t('preview_synopsis')}`;

  const synEl = document.createElement('div');
  synEl.className = 'dp-synopsis';
  synEl.textContent = sentence || t('preview_no_synopsis');

  const addBtn = document.createElement('button');
  addBtn.className = 'dp-add-btn';
  addBtn.id = 'dp-add-btn';
  addBtn.textContent = `[ ${t('preview_add_btn')} ]`;

  infoCol.appendChild(synLabel);
  infoCol.appendChild(synEl);
  infoCol.appendChild(addBtn);

  body.appendChild(coverCol);
  body.appendChild(infoCol);
  content.appendChild(header);
  content.appendChild(body);

  modal.style.display = 'flex';
  overlay.style.display = 'block';

  addBtn.addEventListener('click', () => {
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
  section.textContent = '';
  const initBar = document.createElement('div');
  initBar.className = 'discover-status-bar';
  const initLbl = document.createElement('span');
  initLbl.className = 'discover-status-label';
  initLbl.setAttribute('data-i18n', 'discover_header');
  initLbl.textContent = t('discover_header');
  initBar.appendChild(initLbl);
  section.appendChild(initBar);
  const initMsg = document.createElement('div');
  initMsg.className = 'discover-loading';
  initMsg.textContent = `> ${t('discover_querying')} "${query.toUpperCase()}"...`;
  section.appendChild(initMsg);

  try {
    const apiUrl = new URL('https://openlibrary.org/search.json');
    apiUrl.searchParams.set('q', query);
    apiUrl.searchParams.set('limit', '8');
    apiUrl.searchParams.set('fields', 'title,author_name,first_publish_year,number_of_pages_median,first_sentence,cover_i,subject');
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.docs?.length) {
      section.textContent = '';
      const noBar = document.createElement('div');
      noBar.className = 'discover-status-bar';
      const noLbl = document.createElement('span');
      noLbl.className = 'discover-status-label';
      noLbl.textContent = t('discover_header');
      noBar.appendChild(noLbl);
      section.appendChild(noBar);
      const noMsg = document.createElement('div');
      noMsg.className = 'discover-loading discover-empty';
      noMsg.textContent = `> ${t('discover_no_results')}: "${query.toUpperCase()}"`;
      section.appendChild(noMsg);
      return;
    }

    const docs = data.docs.map(doc => ({
      title:                    cleanText(doc.title, 240) || 'Unknown',
      author_name:              [cleanText(doc.author_name?.[0], 140) || 'Unknown'],
      number_of_pages_median:   toPositiveInt(doc.number_of_pages_median),
      cover_i:                  toPositiveInt(doc.cover_i),
      first_publish_year:       toPositiveInt(doc.first_publish_year),
      first_sentence:           typeof doc.first_sentence === 'object'
                                  ? cleanText(doc.first_sentence?.value, 500) || ''
                                  : cleanText(doc.first_sentence, 500) || '',
      subject:                  Array.isArray(doc.subject)
                                  ? doc.subject.map(s => String(s)).slice(0, 20)
                                  : [],
    }));

    section.textContent = '';
    const resBar = document.createElement('div');
    resBar.className = 'discover-status-bar';
    const resLbl = document.createElement('span');
    resLbl.className = 'discover-status-label';
    resLbl.textContent = t('discover_header');
    resBar.appendChild(resLbl);
    const resCnt = document.createElement('span');
    resCnt.className = 'discover-count';
    resCnt.textContent = `"${query}" — ${docs.length} ${t('discover_found')}`;
    resBar.appendChild(resCnt);
    section.appendChild(resBar);
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'discover-grid';
    docs.forEach(doc => resultsGrid.appendChild(buildDiscoverCard(doc)));
    section.appendChild(resultsGrid);

  } catch (err) {
    console.warn('Discover fetch failed:', err);
    section.textContent = '';
    const errBar = document.createElement('div');
    errBar.className = 'discover-status-bar';
    const errLbl = document.createElement('span');
    errLbl.className = 'discover-status-label';
    errLbl.textContent = t('discover_header');
    errBar.appendChild(errLbl);
    section.appendChild(errBar);
    const errMsg = document.createElement('div');
    errMsg.className = 'discover-loading discover-error';
    errMsg.textContent = `> ${t('discover_error')}`;
    section.appendChild(errMsg);
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
