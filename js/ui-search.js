import { cleanText, toPositiveInt, guessCategory } from './state.js';

function renderSearchResultItem(doc, idx) {
  const item = document.createElement('div');
  item.className = 'search-result-item';
  item.dataset.idx = String(idx);

  if (doc.cover_i) {
    const img = document.createElement('img');
    img.className = 'sr-cover';
    img.src = `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`;
    img.alt = '';
    img.loading = 'lazy';
    item.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'sr-cover sr-cover-placeholder';
    placeholder.textContent = (doc.title || 'U').charAt(0);
    item.appendChild(placeholder);
  }

  const info = document.createElement('div');
  info.className = 'sr-info';

  const title = document.createElement('div');
  title.className = 'sr-title';
  title.textContent = doc.title || 'Unknown';

  const meta = document.createElement('div');
  meta.className = 'sr-meta';
  const authorName = doc.author_name?.[0] || 'Unknown';
  const pagesText = doc.number_of_pages_median ? ` · ${doc.number_of_pages_median}p` : '';
  meta.textContent = `by ${authorName}${pagesText}`;

  info.appendChild(title);
  info.appendChild(meta);
  item.appendChild(info);

  return item;
}

function flashField(el) {
  el.classList.add('field-filled');
  setTimeout(() => el.classList.remove('field-filled'), 900);
}

export function applyBookFromAPI(doc) {
  const synopsis = typeof doc.first_sentence === 'object'
    ? doc.first_sentence?.value || ''
    : doc.first_sentence || '';

  const fields = {
    'f-title': doc.title || '',
    'f-subtitle': '',
    'f-author': doc.author_name?.[0] || '',
    'f-pages': doc.number_of_pages_median || '',
    'f-synopsis': synopsis,
  };

  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      flashField(el);
    }
  }

  const cat = guessCategory(doc.subject || []);
  if (cat) {
    const sel = document.getElementById('f-category');
    if (sel) sel.value = cat;
  }

  let coverInput = document.getElementById('f-cover-id');
  if (!coverInput) {
    coverInput = document.createElement('input');
    coverInput.type = 'hidden';
    coverInput.id = 'f-cover-id';
    document.getElementById('form-modal-content').appendChild(coverInput);
  }
  coverInput.value = toPositiveInt(doc.cover_i) || '';
}

export async function searchOpenLibrary(query, resultsEl, statusEl) {
  statusEl.textContent = '⟳ QUERYING OPEN LIBRARY...';
  resultsEl.innerHTML = '';

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=7&fields=title,author_name,number_of_pages_median,first_sentence,cover_i,subject`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenLibrary request failed: ${res.status}`);
    const data = await res.json();

    statusEl.textContent = '';

    if (!data.docs?.length) {
      resultsEl.innerHTML = `<div class="search-no-results">&gt; NO RESULTS — try a different title</div>`;
      return;
    }

    const docs = data.docs.map(doc => ({
      title:                  cleanText(doc.title, 240) || 'Unknown',
      author_name:            [cleanText(doc.author_name?.[0], 140) || 'Unknown'],
      number_of_pages_median: toPositiveInt(doc.number_of_pages_median),
      cover_i:                toPositiveInt(doc.cover_i),
      first_sentence:         typeof doc.first_sentence === 'object'
                                ? cleanText(doc.first_sentence?.value, 500) || ''
                                : cleanText(doc.first_sentence, 500) || '',
      subject:                Array.isArray(doc.subject)
                                ? doc.subject.map(String).slice(0, 20)
                                : [],
    }));

    resultsEl._docs = docs;
    const fragment = document.createDocumentFragment();
    docs.forEach((doc, i) => fragment.appendChild(renderSearchResultItem(doc, i)));
    resultsEl.innerHTML = '';
    resultsEl.appendChild(fragment);

    resultsEl.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const doc = resultsEl._docs[Number.parseInt(item.dataset.idx, 10)];
        applyBookFromAPI(doc);
        resultsEl.innerHTML = '';
        document.getElementById('book-api-search').value = '';
        statusEl.textContent = '✓ FIELDS AUTO-FILLED — review and save';
        statusEl.style.color = '#00ff00';
      });
    });
  } catch (error) {
    console.warn('Open Library search failed.', error);
    statusEl.textContent = '✗ NETWORK ERROR — fill in manually';
    statusEl.style.color = '#ff4444';
  }
}
