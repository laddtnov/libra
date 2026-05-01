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
    notes: [
      "Fascinating perspective on human evolution",
      "Chapter 5 particularly interesting",
      "Need to revisit cognitive revolution section"
    ]
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
    notes: [
      "Perfect introduction to the wizarding world",
      "Character development is excellent",
      "Nostalgic reread - still magical"
    ]
  },
  "lotr": {
    title: "The Lord of the Rings",
    subtitle: "The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    pages: 423,
    status: "to-read",
    synopsis: "Epic fantasy following Frodo Baggins' quest to destroy the One Ring and save Middle-earth from the Dark Lord Sauron.",
    notes: [
      "Added to reading queue",
      "Recommended by multiple sources",
      "Planning to read before watching films"
    ]
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
    notes: [
      "Epic revenge story done perfectly",
      "Long but never boring",
      "The planning and execution is masterful"
    ]
  },
  "iron-king": {
    title: "The Iron King",
    subtitle: "The Accursed Kings",
    author: "Maurice Druon",
    category: "Historical Fiction",
    pages: 344,
    status: "to-read",
    synopsis: "First book in a series about the French monarchy in the 14th century, featuring political intrigue and historical drama.",
    notes: [
      "Often called 'the original Game of Thrones'",
      "Recommended for historical fiction fans",
      "Part of 7-book series"
    ]
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
    notes: [
      "Incredible insight into Gaudí's creative process",
      "Makes me want to visit Barcelona again",
      "Perfect blend of architecture and biography"
    ]
  },
  "nations-fail": {
    title: "Why Nations Fail",
    subtitle: "Origins of Power, Prosperity & Poverty",
    author: "Daron Acemoglu & James Robinson",
    category: "Economics",
    pages: 544,
    status: "to-read",
    synopsis: "Examines why some nations prosper while others fail, focusing on political and economic institutions.",
    notes: [
      "Highly recommended by economists",
      "Relevant to current global issues",
      "On reading list for Q2 2026"
    ]
  }
};

// ====================================
// DATA MANAGEMENT (localStorage)
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

let booksData = loadBooks();
let activeFilter = 'all';
let searchQuery = '';
let editingBookId = null;

// ====================================
// SOUND EFFECTS (Web Audio API)
// ====================================

let soundEnabled = true;
let audioContext = null;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTypeSound() {
  if (!soundEnabled) return;
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.innerHTML = soundEnabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
    btn.style.color = soundEnabled ? '#00ff00' : '#666';
  }
}

// ====================================
// TYPEWRITER EFFECT
// ====================================

function typewriterEffect(element, text, speed = 30) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '█';
    element.appendChild(cursor);

    const timer = setInterval(() => {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        if (text[i] !== ' ') playTypeSound();
        i++;
      } else {
        cursor.remove();
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function typeAllLines(container, lines, speed = 30) {
  for (const line of lines) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line';
    container.appendChild(lineDiv);
    await typewriterEffect(lineDiv, line, speed);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// ====================================
// STATS + COUNT-UP ANIMATION
// ====================================

function countUp(element, target, duration = 700) {
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateStats() {
  const books = Object.values(booksData);
  countUp(document.getElementById('stat-completed'), books.filter(b => b.status === 'completed').length);
  countUp(document.getElementById('stat-reading'),   books.filter(b => b.status === 'reading').length);
  countUp(document.getElementById('stat-queued'),    books.filter(b => b.status === 'to-read').length);
  countUp(document.getElementById('stat-total'),     books.length);
}

// ====================================
// RENDER CARDS
// ====================================

const GENRE_META = {
  'History':          { cls: 'history',   emoji: '🏛️' },
  'Fantasy':          { cls: 'fantasy',   emoji: '✨' },
  'Adventure':        { cls: 'adventure', emoji: '⚔️' },
  'Historical Fiction': { cls: 'fiction', emoji: '👑' },
  'Biography':        { cls: 'biography', emoji: '📝' },
  'Economics':        { cls: 'economics', emoji: '💰' },
  'Science':          { cls: 'science',   emoji: '🔬' },
  'Philosophy':       { cls: 'philosophy', emoji: '🧠' },
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

function buildCardHTML(id, book, index) {
  const statusClass = getStatusClass(book.status);
  const spineTitle = book.title.toUpperCase().slice(0, 16);

  const statusBadgeHTML = {
    reading:   '<span class="status-icon">📖</span><span>READING</span>',
    completed: '<span class="status-icon">✅</span><span>COMPLETED</span>',
    'to-read': '<span class="status-icon">📌</span><span>TO READ</span>',
  }[book.status] || '';

  let metaHTML = '';
  if (book.status === 'reading') {
    metaHTML = `
      <div class="meta-item">
        <span class="meta-label">Progress:</span>
        <span class="meta-value">${book.currentPage || 0}/${book.pages || '?'} pages (${book.progress || 0}%)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Started:</span>
        <span class="meta-value">${book.started || '—'}</span>
      </div>`;
  } else if (book.status === 'completed') {
    metaHTML = `
      <div class="meta-item">
        <span class="meta-label">Completed:</span>
        <span class="meta-value">${book.completed || '—'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Rating:</span>
        <span class="meta-value">${'★'.repeat(book.rating || 0)}${'☆'.repeat(5 - (book.rating || 0))} ${book.rating || 0}/5</span>
      </div>`;
  } else {
    metaHTML = `
      <div class="meta-item">
        <span class="meta-label">Status:</span>
        <span class="meta-value">In Queue</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Pages:</span>
        <span class="meta-value">${book.pages || '?'}</span>
      </div>`;
  }

  const progressHTML = book.status === 'reading'
    ? `<div class="progress-bar"><div class="progress-fill" style="width:${book.progress || 0}%"></div></div>`
    : '';

  const genreMeta = GENRE_META[book.category] || { cls: '', emoji: '📚' };
  const genreTag = book.category
    ? `<span class="tag ${genreMeta.cls}">${genreMeta.emoji} ${book.category}</span>`
    : '';

  return `
    <div class="book-spine">
      <div class="spine-light"></div>
      <div class="spine-text">${spineTitle}</div>
    </div>
    <div class="book-body">
      <div class="book-header">
        <div class="status-badge ${statusClass}">${statusBadgeHTML}</div>
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
  return Object.entries(booksData).filter(([, book]) => {
    const matchFilter = activeFilter === 'all' || book.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || book.title.toLowerCase().includes(q)
      || book.author.toLowerCase().includes(q)
      || (book.category || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function renderBooks() {
  const grid = document.getElementById('books-grid');
  grid.innerHTML = '';

  const entries = getFilteredEntries();

  if (entries.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">📭</div>
        <div class="no-results-text">&gt; NO RECORDS FOUND</div>
        <div class="no-results-sub">Adjust filters or search query</div>
      </div>`;
    return;
  }

  entries.forEach(([id, book], index) => {
    const card = document.createElement('div');
    card.className = `book-card ${getStatusClass(book.status)} card-enter`;
    card.dataset.bookId = id;
    card.style.animationDelay = `${index * 0.07}s`;
    card.innerHTML = buildCardHTML(id, book, index);
    card.addEventListener('click', () => showBookDetails(id));
    grid.appendChild(card);
  });
}

// ====================================
// FILTER + SEARCH
// ====================================

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderBooks();
}

// ====================================
// BOOK DETAIL MODAL
// ====================================

function showBookDetails(bookId) {
  const book = booksData[bookId];
  if (!book) return;

  const modal   = document.getElementById('book-modal');
  const content = document.getElementById('modal-content');
  const overlay = document.getElementById('modal-overlay');

  modal.style.display   = 'flex';
  overlay.style.display = 'block';
  content.innerHTML = '';

  const soundBtn = document.createElement('button');
  soundBtn.id = 'sound-toggle';
  soundBtn.className = 'sound-toggle-btn';
  soundBtn.innerHTML = soundEnabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
  soundBtn.style.color = soundEnabled ? '#00ff00' : '#666';
  soundBtn.onclick = toggleSound;
  content.appendChild(soundBtn);

  const terminal = document.createElement('div');
  terminal.className = 'terminal-container';
  content.appendChild(terminal);

  const lines = [
    '> ACCESSING LIBRARY DATABASE...',
    '> LOADING BOOK DATA...',
    '',
    `📚 ${book.title.toUpperCase()}`,
    book.subtitle || '',
    '',
    '>> BOOK INFORMATION',
    `Author:   ${book.author}`,
    `Category: ${book.category || 'Unknown'}`,
    `Pages:    ${book.pages || '?'}`,
    `Status:   ${book.status.toUpperCase().replace('-', ' ')}`,
  ];

  if (book.status === 'reading') {
    lines.push('', '>> READING PROGRESS',
      `Started:     ${book.started || '—'}`,
      `Current page: ${book.currentPage || 0} / ${book.pages}`,
      `Progress:    ${book.progress || 0}%`,
      ...(book.estimated ? [`Est. finish: ${book.estimated}`] : [])
    );
  }

  if (book.status === 'completed') {
    lines.push('', '>> COMPLETION INFO',
      `Completed: ${book.completed || '—'}`
    );
  }

  if (book.rating) {
    lines.push('', '>> RATING',
      `${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)} (${book.rating}/5)`
    );
  }

  if (book.synopsis) {
    lines.push('', '>> SYNOPSIS', book.synopsis);
  }

  if (book.notes?.length) {
    lines.push('', '>> PERSONAL NOTES');
    book.notes.forEach((n, i) => lines.push(`${i + 1}. ${n}`));
  }

  lines.push('', '> DATA TRANSFER COMPLETE', '> [EDIT] or [DELETE] below  |  [ESC] to exit');

  typeAllLines(terminal, lines, 18).then(() => {
    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    actions.innerHTML = `
      <button class="terminal-action-btn edit-btn">[ EDIT ]</button>
      <button class="terminal-action-btn delete-btn">[ DELETE ]</button>`;
    terminal.appendChild(actions);

    actions.querySelector('.edit-btn').addEventListener('click', () => {
      closeModal();
      openFormModal(bookId);
    });

    actions.querySelector('.delete-btn').addEventListener('click', () => {
      confirmDelete(bookId, terminal);
    });
  });
}

function confirmDelete(bookId, terminal) {
  const book = booksData[bookId];
  const warnLine = document.createElement('div');
  warnLine.className = 'terminal-line';
  warnLine.style.color = '#ff4444';
  warnLine.textContent = `> WARNING: Permanently delete "${book.title}"?`;
  terminal.appendChild(warnLine);

  const confirmActions = document.createElement('div');
  confirmActions.className = 'modal-actions';
  confirmActions.innerHTML = `
    <button class="terminal-action-btn delete-btn" id="confirm-yes">[ CONFIRM DELETE ]</button>
    <button class="terminal-action-btn cancel-btn" id="confirm-no">[ CANCEL ]</button>`;
  terminal.appendChild(confirmActions);

  document.getElementById('confirm-yes').addEventListener('click', () => {
    delete booksData[bookId];
    saveBooks();
    closeModal();
    updateStats();
    renderBooks();
  });

  document.getElementById('confirm-no').addEventListener('click', () => {
    warnLine.remove();
    confirmActions.remove();
  });
}

function closeModal() {
  document.getElementById('book-modal').style.display  = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
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

  const ratingVal = book?.rating || 0;

  content.innerHTML = `
    <div class="terminal-form">
      <div class="terminal-line">&gt; ${isEdit ? 'MODIFY BOOK RECORD' : 'INITIALIZE NEW BOOK RECORD'}</div>
      <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      <br>

      <div class="form-field">
        <label class="terminal-label">&gt; TITLE *</label>
        <input id="f-title" class="terminal-input" value="${escHtml(book?.title || '')}" placeholder="Book title">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; SUBTITLE</label>
        <input id="f-subtitle" class="terminal-input" value="${escHtml(book?.subtitle || '')}" placeholder="Optional subtitle">
      </div>
      <div class="form-field">
        <label class="terminal-label">&gt; AUTHOR *</label>
        <input id="f-author" class="terminal-input" value="${escHtml(book?.author || '')}" placeholder="Author name">
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
            `<span class="star-pick${i < ratingVal ? ' filled' : ''}" data-val="${i + 1}">★</span>`
          ).join('')}
        </div>
        <input type="hidden" id="f-rating" value="${ratingVal}">
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

  // Status field visibility toggle
  const statusSel = document.getElementById('f-status');
  statusSel.addEventListener('change', () => {
    document.getElementById('reading-fields').style.display   = statusSel.value === 'reading'   ? 'block' : 'none';
    document.getElementById('completed-fields').style.display = statusSel.value === 'completed' ? 'block' : 'none';
  });

  // Interactive star picker
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
  const currentPage = parseInt(document.getElementById('f-current-page').value) || 0;
  const progress    = pages && currentPage ? Math.round((currentPage / pages) * 100) : (parseInt(document.getElementById('f-current-page')?.value) ? 0 : undefined);
  const rating      = parseInt(document.getElementById('f-rating').value) || undefined;

  const book = {
    title,
    author,
    status,
    ...(document.getElementById('f-subtitle').value.trim() && { subtitle: document.getElementById('f-subtitle').value.trim() }),
    ...(document.getElementById('f-category').value && { category: document.getElementById('f-category').value }),
    ...(pages && { pages }),
    ...(rating && { rating }),
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

  booksData[id] = book;
  saveBooks();
  closeFormModal();
  updateStats();
  renderBooks();
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
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ====================================
// INIT
// ====================================

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderBooks();

  document.getElementById('add-book-btn').addEventListener('click', () => openFormModal());

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => setFilter(card.dataset.filter));
  });

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderBooks();
  });

  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('close-form-modal').addEventListener('click', closeFormModal);

  document.getElementById('modal-overlay').addEventListener('click', () => {
    closeModal();
    closeFormModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeFormModal(); }
  });
});
