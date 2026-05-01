// ====================================
// DEFAULT DATA
// ====================================

const DEFAULT_BOOKS = {
  "homo-sapiens": {
    title: "Homo Sapiens",
    subtitle: "A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    pages: 464,
    status: "reading",
    progress: 45,
    currentPage: 210,
    rating: 3,
    started: "January 2026",
    estimated: "2 weeks",
    synopsis: "Explores the history of humankind from the Stone Age to the modern age, examining how Homo sapiens came to dominate the world.",
    notes: ["Fascinating perspective on human evolution", "Chapter 5 particularly interesting", "Need to revisit cognitive revolution section"]
  },
  "harry-potter": {
    title: "Harry Potter",
    subtitle: "and the Philosopher's Stone",
    author: "J.K. Rowling",
    category: "Fantasy",
    pages: 223,
    status: "completed",
    rating: 5,
    completed: "December 2025",
    synopsis: "A young wizard discovers his magical heritage and embarks on adventures at Hogwarts School of Witchcraft and Wizardry.",
    notes: ["Perfect introduction to the wizarding world", "Character development is excellent", "Nostalgic reread - still magical"]
  },
  "lotr": {
    title: "The Lord of the Rings",
    subtitle: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    pages: 423,
    status: "to-read",
    synopsis: "Epic fantasy following Frodo Baggins' quest to destroy the One Ring and save Middle-earth from the Dark Lord Sauron.",
    notes: ["Added to reading queue", "Recommended by multiple sources", "Planning to read before watching films"]
  },
  "monte-cristo": {
    title: "The Count of Monte Cristo",
    subtitle: "Classic Adventure",
    author: "Alexandre Dumas",
    category: "Adventure",
    pages: 1276,
    status: "completed",
    rating: 4,
    completed: "November 2025",
    synopsis: "A tale of betrayal, imprisonment, escape, and revenge set in 19th century France.",
    notes: ["Epic revenge story done perfectly", "Long but never boring", "The planning and execution is masterful"]
  },
  "iron-king": {
    title: "The Iron King",
    subtitle: "The Accursed Kings",
    author: "Maurice Druon",
    category: "Historical Fiction",
    pages: 344,
    status: "to-read",
    synopsis: "First book in a series about the French monarchy in the 14th century, featuring political intrigue and historical drama.",
    notes: ["Often called 'the original Game of Thrones'", "Recommended for historical fiction fans", "Part of 7-book series"]
  },
  "gaudi": {
    title: "Gaudí: A Biography",
    subtitle: "Life of a Visionary",
    author: "Gijs van Hensbergen",
    category: "Biography",
    pages: 432,
    status: "completed",
    rating: 5,
    completed: "October 2025",
    synopsis: "Comprehensive biography of Antoni Gaudí, the visionary Catalan architect behind La Sagrada Família and other masterpieces.",
    notes: ["Incredible insight into Gaudí's creative process", "Makes me want to visit Barcelona again", "Perfect blend of architecture and biography"]
  },
  "nations-fail": {
    title: "Why Nations Fail",
    subtitle: "Origins of Power, Prosperity & Poverty",
    author: "Daron Acemoglu & James Robinson",
    category: "Economics",
    pages: 544,
    status: "to-read",
    synopsis: "Examines why some nations prosper while others fail, focusing on political and economic institutions.",
    notes: ["Highly recommended by economists", "Relevant to current global issues", "On reading list for Q2 2026"]
  }
};

// ====================================
// DATA MANAGEMENT
// ====================================

function loadBooks() {
  const stored = localStorage.getItem('cyberpunk-books');
  if (stored) {
    try { return JSON.parse(stored); }
    catch (e) { return structuredClone(DEFAULT_BOOKS); }
  }
  return structuredClone(DEFAULT_BOOKS);
}

function saveBooks() {
  localStorage.setItem('cyberpunk-books', JSON.stringify(booksData));
}

let booksData    = loadBooks();
let activeFilter = 'all';
let activeSort   = 'default';
let searchQuery  = '';
let editingBookId = null;

// ====================================
// SOUND EFFECTS
// ====================================

let soundEnabled  = true;
let audioContext  = null;

function initAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = initAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
    btn.style.color = soundEnabled ? '#00ff00' : '#444';
  }
}

// ====================================
// TOAST NOTIFICATIONS
// ====================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = `> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2200);
}

// ====================================
// STATS + COUNT-UP
// ====================================

function countUp(el, target, duration = 700) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function updateStats(filteredEntries) {
  const books = filteredEntries
    ? filteredEntries.map(([, b]) => b)
    : Object.values(booksData);
  countUp(document.getElementById('stat-completed'), books.filter(b => b.status === 'completed').length);
  countUp(document.getElementById('stat-reading'),   books.filter(b => b.status === 'reading').length);
  countUp(document.getElementById('stat-queued'),    books.filter(b => b.status === 'to-read').length);
  countUp(document.getElementById('stat-total'),     books.length);
}

// ====================================
// RENDER CARDS
// ====================================

const GENRE_META = {
  'History':            { cls: 'history',    emoji: '🏛️' },
  'Fantasy':            { cls: 'fantasy',    emoji: '✨' },
  'Adventure':          { cls: 'adventure',  emoji: '⚔️' },
  'Historical Fiction': { cls: 'fiction',    emoji: '👑' },
  'Biography':          { cls: 'biography',  emoji: '📝' },
  'Economics':          { cls: 'economics',  emoji: '💰' },
  'Science':            { cls: 'science',    emoji: '🔬' },
  'Philosophy':         { cls: 'philosophy', emoji: '🧠' },
};

function getStatusClass(status) {
  if (status === 'completed') return 'read';
  if (status === 'reading')   return 'in-progress';
  return 'to-read';
}

function renderStarsHTML(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="star ${i < (rating || 0) ? 'filled' : ''}">★</span>`
  ).join('');
}

function buildCardHTML(id, book) {
  const statusClass = getStatusClass(book.status);
  const spineTitle  = book.title.toUpperCase().slice(0, 16);

  const statusBadge = {
    reading:   '<span class="status-icon">📖</span><span>READING</span>',
    completed: '<span class="status-icon">✅</span><span>COMPLETED</span>',
    'to-read': '<span class="status-icon">📌</span><span>TO READ</span>',
  }[book.status] || '';

  let metaHTML = '';
  if (book.status === 'reading') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Progress:</span><span class="meta-value">${book.currentPage || 0}/${book.pages || '?'} pages (${book.progress || 0}%)</span></div>
      <div class="meta-item"><span class="meta-label">Started:</span><span class="meta-value">${book.started || '—'}</span></div>`;
  } else if (book.status === 'completed') {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Completed:</span><span class="meta-value">${book.completed || '—'}</span></div>
      <div class="meta-item"><span class="meta-label">Rating:</span><span class="meta-value">${'★'.repeat(book.rating || 0)}${'☆'.repeat(5 - (book.rating || 0))} ${book.rating || 0}/5</span></div>`;
  } else {
    metaHTML = `
      <div class="meta-item"><span class="meta-label">Status:</span><span class="meta-value">In Queue</span></div>
      <div class="meta-item"><span class="meta-label">Pages:</span><span class="meta-value">${book.pages || '?'}</span></div>`;
  }

  const progressHTML = book.status === 'reading'
    ? `<div class="progress-bar"><div class="progress-fill" style="width:${book.progress || 0}%"></div></div>` : '';

  const g = GENRE_META[book.category] || { cls: '', emoji: '📚' };
  const genreTag = book.category ? `<span class="tag ${g.cls}">${g.emoji} ${book.category}</span>` : '';

  return `
    <div class="book-spine">
      <div class="spine-light"></div>
      <div class="spine-text">${spineTitle}</div>
    </div>
    <div class="book-body">
      <div class="book-header">
        <div class="status-badge ${statusClass}">${statusBadge}</div>
        <div class="rating">${renderStarsHTML(book.rating)}</div>
      </div>
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">by ${book.author}</p>
      <div class="book-meta">${metaHTML}</div>
      ${progressHTML}
      <div class="book-tags">
        ${genreTag}
        <span class="tag">${book.pages || '?'} pages</span>
      </div>
    </div>`;
}

function getFilteredEntries() {
  const filtered = Object.entries(booksData).filter(([, book]) => {
    const matchFilter = activeFilter === 'all' || book.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || book.title.toLowerCase().includes(q)
      || book.author.toLowerCase().includes(q)
      || (book.category || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (activeSort === 'title-az')  filtered.sort((a, b) => a[1].title.localeCompare(b[1].title));
  if (activeSort === 'title-za')  filtered.sort((a, b) => b[1].title.localeCompare(a[1].title));
  if (activeSort === 'rating')    filtered.sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0));
  if (activeSort === 'pages')     filtered.sort((a, b) => (b[1].pages || 0) - (a[1].pages || 0));
  if (activeSort === 'added')     filtered.reverse();

  return filtered;
}

function renderBooks() {
  const grid = document.getElementById('books-grid');
  grid.innerHTML = '';

  const entries = getFilteredEntries();

  updateStats(activeFilter !== 'all' || searchQuery ? entries : undefined);

  if (!entries.length) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">&gt; NO RECORDS FOUND</div>
        <div class="no-results-sub">Adjust filters or search query</div>
      </div>`;
    return;
  }

  entries.forEach(([id, book], i) => {
    const card = document.createElement('div');
    card.className = `book-card ${getStatusClass(book.status)} card-enter`;
    card.dataset.bookId = id;
    card.style.animationDelay = `${i * 0.07}s`;
    card.innerHTML = buildCardHTML(id, book);
    card.addEventListener('click', () => showBookDetails(id));
    grid.appendChild(card);
  });
}

// ====================================
// FILTER + SEARCH
// ====================================

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.filter === filter)
  );
  renderBooks();
}

// ====================================
// BOOK DETAIL MODAL — instant render
// ====================================

function showBookDetails(bookId) {
  const book = booksData[bookId];
  if (!book) return;

  playClickSound();

  const modal   = document.getElementById('book-modal');
  const content = document.getElementById('modal-content');
  const overlay = document.getElementById('modal-overlay');

  modal.style.display   = 'flex';
  overlay.style.display = 'block';

  // Sound toggle lives in the header row, not the scrollable content
  const soundSlot = document.getElementById('modal-sound-slot');
  soundSlot.innerHTML = '';
  const soundBtn = document.createElement('button');
  soundBtn.id        = 'sound-toggle';
  soundBtn.className = 'sound-toggle-btn';
  soundBtn.textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
  soundBtn.style.color = soundEnabled ? '' : '#666';
  soundBtn.onclick = toggleSound;
  soundSlot.appendChild(soundBtn);

  const coverHTML = book.coverId
    ? `<img class="detail-cover" src="https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg" alt="cover" loading="lazy">`
    : `<div class="detail-cover-placeholder">${book.title.charAt(0).toUpperCase()}</div>`;

  let statusRows = '';
  if (book.status === 'reading') {
    statusRows = `
      <div class="detail-row"><span class="detail-key">&gt; STARTED</span><span class="detail-val">${book.started || '—'}</span></div>
      <div class="detail-row"><span class="detail-key">&gt; CURRENT PAGE</span><span class="detail-val">${book.currentPage || 0} / ${book.pages || '?'}</span></div>
      <div class="detail-row"><span class="detail-key">&gt; PROGRESS</span><span class="detail-val">${book.progress || 0}%</span></div>`;
  } else if (book.status === 'completed') {
    statusRows = `
      <div class="detail-row"><span class="detail-key">&gt; COMPLETED</span><span class="detail-val">${book.completed || '—'}</span></div>`;
  }

  const notesHTML = book.notes?.length
    ? book.notes.map((n, i) => `<div class="detail-note">${i + 1}. ${escHtml(n)}</div>`).join('')
    : `<div class="detail-note muted">No notes added yet.</div>`;

  content.innerHTML = `

    <div class="detail-panel">
      <div class="detail-prompt">&gt; BOOK.ARCHIVE // RECORD RETRIEVED</div>
      <div class="detail-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="detail-hero">
        ${coverHTML}
        <div class="detail-hero-text">
          <div class="detail-title">${escHtml(book.title.toUpperCase())}</div>
          ${book.subtitle ? `<div class="detail-subtitle">${escHtml(book.subtitle)}</div>` : ''}
          <div class="detail-author">by ${escHtml(book.author)}</div>
          <div class="detail-stars">${renderStarsHTML(book.rating)}</div>
        </div>
      </div>

      <div class="detail-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

      <div class="detail-fields">
        <div class="detail-row"><span class="detail-key">&gt; STATUS</span><span class="detail-val">${book.status.toUpperCase().replace('-', ' ')}</span></div>
        <div class="detail-row"><span class="detail-key">&gt; CATEGORY</span><span class="detail-val">${book.category || '—'}</span></div>
        <div class="detail-row"><span class="detail-key">&gt; PAGES</span><span class="detail-val">${book.pages || '?'}</span></div>
        ${statusRows}
      </div>

      ${book.synopsis ? `
      <div class="detail-section">
        <div class="detail-section-title">&gt;&gt; SYNOPSIS</div>
        <div class="detail-section-body">${escHtml(book.synopsis)}</div>
      </div>` : ''}

      <div class="detail-section">
        <div class="detail-section-title">&gt;&gt; NOTES</div>
        <div class="detail-section-body">${notesHTML}</div>
      </div>

      <div class="modal-actions" id="detail-actions">
        <button class="terminal-action-btn edit-btn" id="detail-edit">[ EDIT ]</button>
        <button class="terminal-action-btn delete-btn" id="detail-delete">[ DELETE ]</button>
      </div>
    </div>`;

  document.getElementById('detail-edit').addEventListener('click', () => {
    closeModal();
    openFormModal(bookId);
  });

  document.getElementById('detail-delete').addEventListener('click', () => {
    confirmDelete(bookId);
  });
}

function confirmDelete(bookId) {
  const book    = booksData[bookId];
  const actions = document.getElementById('detail-actions');
  actions.innerHTML = `
    <div class="delete-confirm">
      <div class="delete-warn">&gt; Delete &quot;${escHtml(book.title)}&quot;? This cannot be undone.</div>
      <div class="delete-confirm-btns">
        <button class="terminal-action-btn delete-btn" id="confirm-yes">[ YES, DELETE ]</button>
        <button class="terminal-action-btn cancel-btn" id="confirm-no">[ CANCEL ]</button>
      </div>
    </div>`;

  document.getElementById('confirm-yes').addEventListener('click', () => {
    const title = booksData[bookId]?.title || 'RECORD';
    delete booksData[bookId];
    saveBooks();
    closeModal();
    renderBooks();
    showToast(`${title.toUpperCase()} DELETED`, 'delete');
  });

  document.getElementById('confirm-no').addEventListener('click', () => {
    actions.innerHTML = `
      <button class="terminal-action-btn edit-btn" id="detail-edit">[ EDIT ]</button>
      <button class="terminal-action-btn delete-btn" id="detail-delete">[ DELETE ]</button>`;
    document.getElementById('detail-edit').addEventListener('click', () => { closeModal(); openFormModal(bookId); });
    document.getElementById('detail-delete').addEventListener('click', () => confirmDelete(bookId));
  });
}

function closeModal() {
  document.getElementById('book-modal').style.display   = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

// ====================================
// OPEN LIBRARY SEARCH
// ====================================

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function guessCategory(subjects = []) {
  const s = subjects.slice(0, 20).join(' ').toLowerCase();
  if (s.includes('historical fiction'))           return 'Historical Fiction';
  if (s.includes('histor'))                       return 'History';
  if (s.includes('fantasy'))                      return 'Fantasy';
  if (s.includes('adventure'))                    return 'Adventure';
  if (s.includes('biograph') || s.includes('autobiograph')) return 'Biography';
  if (s.includes('econom'))                       return 'Economics';
  if (s.includes('science') || s.includes('natural history')) return 'Science';
  if (s.includes('philosoph'))                    return 'Philosophy';
  return null;
}

async function searchOpenLibrary(query, resultsEl, statusEl) {
  statusEl.textContent = '⟳ QUERYING OPEN LIBRARY...';
  resultsEl.innerHTML  = '';

  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=7&fields=title,author_name,number_of_pages_median,first_sentence,cover_i,subject`;
    const res  = await fetch(url);
    const data = await res.json();

    statusEl.textContent = '';

    if (!data.docs?.length) {
      resultsEl.innerHTML = `<div class="search-no-results">&gt; NO RESULTS — try a different title</div>`;
      return;
    }

    resultsEl._docs = data.docs;
    resultsEl.innerHTML = data.docs.map((doc, i) => {
      const title   = doc.title || 'Unknown';
      const author  = doc.author_name?.[0] || 'Unknown';
      const pages   = doc.number_of_pages_median ? ` · ${doc.number_of_pages_median}p` : '';
      const coverEl = doc.cover_i
        ? `<img class="sr-cover" src="https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg" alt="" loading="lazy">`
        : `<div class="sr-cover sr-cover-placeholder">${title.charAt(0)}</div>`;
      return `
        <div class="search-result-item" data-idx="${i}">
          ${coverEl}
          <div class="sr-info">
            <div class="sr-title">${escHtml(title)}</div>
            <div class="sr-meta">by ${escHtml(author)}${pages}</div>
          </div>
        </div>`;
    }).join('');

    resultsEl.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const doc = resultsEl._docs[parseInt(item.dataset.idx)];
        applyBookFromAPI(doc);
        resultsEl.innerHTML = '';
        document.getElementById('book-api-search').value = '';
        statusEl.textContent = '✓ FIELDS AUTO-FILLED — review and save';
        statusEl.style.color = '#00ff00';
      });
    });

  } catch (e) {
    statusEl.textContent = '✗ NETWORK ERROR — fill in manually';
    statusEl.style.color = '#ff4444';
  }
}

function applyBookFromAPI(doc) {
  const synopsis = typeof doc.first_sentence === 'object'
    ? doc.first_sentence?.value || ''
    : doc.first_sentence || '';

  const fields = {
    'f-title':    doc.title || '',
    'f-subtitle': '',
    'f-author':   doc.author_name?.[0] || '',
    'f-pages':    doc.number_of_pages_median || '',
    'f-synopsis': synopsis,
  };

  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) { el.value = val; flashField(el); }
  }

  const cat = guessCategory(doc.subject || []);
  if (cat) {
    const sel = document.getElementById('f-category');
    if (sel) sel.value = cat;
  }

  // Store coverId
  let coverInput = document.getElementById('f-cover-id');
  if (!coverInput) {
    coverInput = document.createElement('input');
    coverInput.type = 'hidden';
    coverInput.id   = 'f-cover-id';
    document.getElementById('form-modal-content').appendChild(coverInput);
  }
  coverInput.value = doc.cover_i || '';
}

function flashField(el) {
  el.classList.add('field-filled');
  setTimeout(() => el.classList.remove('field-filled'), 900);
}

// ====================================
// ADD / EDIT FORM MODAL
// ====================================

const CATEGORIES = ['History', 'Fantasy', 'Adventure', 'Historical Fiction', 'Biography', 'Economics', 'Science', 'Philosophy', 'Other'];

function openFormModal(bookId = null) {
  editingBookId = bookId;
  const book   = bookId ? booksData[bookId] : null;
  const isEdit = !!book;

  const formModal = document.getElementById('form-modal');
  const content   = document.getElementById('form-modal-content');
  const overlay   = document.getElementById('modal-overlay');

  formModal.style.display = 'flex';
  overlay.style.display   = 'block';

  const rv = book?.rating || 0;

  content.innerHTML = `
    <div class="terminal-form">
      <div class="terminal-line">&gt; ${isEdit ? 'MODIFY BOOK RECORD' : 'INITIALIZE NEW BOOK RECORD'}</div>
      <div class="terminal-line form-divider-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      <br>

      ${!isEdit ? `
      <div class="book-search-section">
        <div class="terminal-label">&gt; SEARCH OPEN LIBRARY TO AUTO-FILL</div>
        <input type="text" id="book-api-search" class="terminal-input" placeholder="Type a book title..." autocomplete="off" spellcheck="false">
        <div class="search-status" id="search-status"></div>
        <div id="api-search-results" class="api-search-results"></div>
      </div>
      <div class="terminal-line form-or-divider">─────────────── OR FILL IN MANUALLY ───────────────</div>
      <br>
      ` : ''}

      <div class="form-field">
        <label class="terminal-label">&gt; TITLE *</label>
        <input id="f-title"    class="terminal-input" value="${escHtml(book?.title || '')}"    placeholder="Book title">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; SUBTITLE</label>
        <input id="f-subtitle" class="terminal-input" value="${escHtml(book?.subtitle || '')}" placeholder="Optional subtitle">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; AUTHOR *</label>
        <input id="f-author"   class="terminal-input" value="${escHtml(book?.author || '')}"   placeholder="Author name">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; CATEGORY</label>
        <select id="f-category" class="terminal-select">
          ${CATEGORIES.map(c => `<option value="${c}"${book?.category === c ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; TOTAL PAGES</label>
        <input id="f-pages" class="terminal-input" type="number" min="1" value="${book?.pages || ''}" placeholder="e.g. 464">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; STATUS</label>
        <select id="f-status" class="terminal-select">
          <option value="reading"${book?.status === 'reading' ? ' selected' : ''}>CURRENTLY READING</option>
          <option value="completed"${book?.status === 'completed' ? ' selected' : ''}>COMPLETED</option>
          <option value="to-read"${(!book || book?.status === 'to-read') ? ' selected' : ''}>IN QUEUE</option>
        </select>
      </div>

      <div id="reading-fields" style="display:${book?.status === 'reading' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; CURRENT PAGE</label>
          <input id="f-current-page" class="terminal-input" type="number" min="0" value="${book?.currentPage || ''}" placeholder="Page you're on">
        </div>
        <div class="form-field">
          <label class="terminal-label">&gt; STARTED</label>
          <input id="f-started" class="terminal-input" value="${escHtml(book?.started || '')}" placeholder="e.g. January 2026">
        </div>
      </div>

      <div id="completed-fields" style="display:${book?.status === 'completed' ? 'block' : 'none'}">
        <div class="form-field">
          <label class="terminal-label">&gt; COMPLETED DATE</label>
          <input id="f-completed" class="terminal-input" value="${escHtml(book?.completed || '')}" placeholder="e.g. December 2025">
        </div>
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; RATING</label>
        <div class="star-picker" id="star-picker">
          ${Array.from({ length: 5 }, (_, i) =>
            `<span class="star-pick${i < rv ? ' filled' : ''}" data-val="${i + 1}">★</span>`
          ).join('')}
        </div>
        <input type="hidden" id="f-rating" value="${rv}">
      </div>

      <div class="form-field">
        <label class="terminal-label">&gt; SYNOPSIS</label>
        <textarea id="f-synopsis" class="terminal-textarea" placeholder="Brief description...">${escHtml(book?.synopsis || '')}</textarea>
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; NOTES (one per line)</label>
        <textarea id="f-notes" class="terminal-textarea" placeholder="Your thoughts...">${escHtml((book?.notes || []).join('\n'))}</textarea>
      </div>

      <div class="form-actions">
        <button class="terminal-action-btn save-btn" id="save-book-btn">[ ${isEdit ? 'UPDATE RECORD' : 'CREATE RECORD'} ]</button>
        <button class="terminal-action-btn cancel-btn" id="cancel-form-btn">[ CANCEL ]</button>
      </div>
    </div>`;

  // Status conditional fields
  const statusSel = document.getElementById('f-status');
  statusSel.addEventListener('change', () => {
    document.getElementById('reading-fields').style.display   = statusSel.value === 'reading'   ? 'block' : 'none';
    document.getElementById('completed-fields').style.display = statusSel.value === 'completed' ? 'block' : 'none';
  });

  // Star picker
  const picker = document.getElementById('star-picker');
  const ratingHidden = document.getElementById('f-rating');
  picker.addEventListener('click', e => {
    if (!e.target.classList.contains('star-pick')) return;
    const val = parseInt(e.target.dataset.val);
    ratingHidden.value = val;
    picker.querySelectorAll('.star-pick').forEach((s, i) => s.classList.toggle('filled', i < val));
  });
  picker.addEventListener('mouseover', e => {
    if (!e.target.classList.contains('star-pick')) return;
    const val = parseInt(e.target.dataset.val);
    picker.querySelectorAll('.star-pick').forEach((s, i) => s.classList.toggle('hover', i < val));
  });
  picker.addEventListener('mouseleave', () => {
    picker.querySelectorAll('.star-pick').forEach(s => s.classList.remove('hover'));
  });

  // Open Library search (new books only)
  if (!isEdit) {
    const searchInput = document.getElementById('book-api-search');
    const statusEl    = document.getElementById('search-status');
    const resultsEl   = document.getElementById('api-search-results');

    const debouncedSearch = debounce(async (q) => {
      if (q.length < 3) { statusEl.textContent = ''; resultsEl.innerHTML = ''; return; }
      await searchOpenLibrary(q, resultsEl, statusEl);
    }, 420);

    searchInput.addEventListener('input', e => debouncedSearch(e.target.value.trim()));
  }

  // Remove error highlight on change
  ['f-title', 'f-author'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => e.target.classList.remove('input-error'));
  });

  document.getElementById('save-book-btn').addEventListener('click', saveBook);
  document.getElementById('cancel-form-btn').addEventListener('click', closeFormModal);
}

function saveBook() {
  const title  = document.getElementById('f-title').value.trim();
  const author = document.getElementById('f-author').value.trim();
  let valid = true;
  if (!title)  { document.getElementById('f-title').classList.add('input-error');  valid = false; }
  if (!author) { document.getElementById('f-author').classList.add('input-error'); valid = false; }
  if (!valid) return;

  const status      = document.getElementById('f-status').value;
  const pages       = parseInt(document.getElementById('f-pages').value) || null;
  const currentPage = parseInt(document.getElementById('f-current-page')?.value) || 0;
  const rating      = parseInt(document.getElementById('f-rating').value) || undefined;
  const coverId     = parseInt(document.getElementById('f-cover-id')?.value) || undefined;

  const book = {
    title,
    author,
    status,
    ...(document.getElementById('f-subtitle').value.trim() && { subtitle: document.getElementById('f-subtitle').value.trim() }),
    category: document.getElementById('f-category').value,
    ...(pages   && { pages }),
    ...(rating  && { rating }),
    ...(coverId && { coverId }),
    ...(status === 'reading' && {
      currentPage,
      progress: pages ? Math.round((currentPage / pages) * 100) : 0,
      ...(document.getElementById('f-started').value.trim() && { started: document.getElementById('f-started').value.trim() }),
    }),
    ...(status === 'completed' && {
      ...(document.getElementById('f-completed').value.trim() && { completed: document.getElementById('f-completed').value.trim() }),
    }),
    ...(document.getElementById('f-synopsis').value.trim() && { synopsis: document.getElementById('f-synopsis').value.trim() }),
    notes: document.getElementById('f-notes').value.split('\n').map(n => n.trim()).filter(Boolean),
  };

  let id = editingBookId;
  if (!id) {
    let base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    id = base;
    let n = 2;
    while (booksData[id]) id = `${base}-${n++}`;
  }

  const isEdit = !!editingBookId;
  booksData[id] = book;
  saveBooks();
  closeFormModal();
  renderBooks();
  showToast(isEdit ? 'RECORD UPDATED' : 'RECORD SAVED', 'success');
}

function closeFormModal() {
  document.getElementById('form-modal').style.display   = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
  editingBookId = null;
}

// ====================================
// HELPERS
// ====================================

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ====================================
// INIT
// ====================================

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderBooks();

  document.getElementById('add-book-btn').addEventListener('click', () => openFormModal());

  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => setFilter(btn.dataset.filter))
  );

  document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => setFilter(card.dataset.filter));
  });

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderBooks();
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    activeSort = e.target.value;
    renderBooks();
  });

  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('close-form-modal').addEventListener('click', closeFormModal);
  document.getElementById('modal-overlay').addEventListener('click', () => { closeModal(); closeFormModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeFormModal(); } });
});
