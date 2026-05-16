import { state, saveBooks, escHtml, toPositiveInt } from './state.js';
import { renderBooks, updateStats } from './ui-render.js';
import { t } from './i18n.js';

// ── Timer state ───────────────────────────────────────────────────────────────
let timerInterval = null;
let timerElapsed  = 0;   // seconds
let timerRunning  = false;

function fmtTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
}

function resetTimer() {
  stopTimer();
  timerElapsed = 0;
  updateTimerUI();
}

function updateTimerUI() {
  const display = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start');
  const pauseBtn = document.getElementById('timer-pause');
  const stopBtn  = document.getElementById('timer-stop');
  const hint     = document.getElementById('timer-hint');

  if (display)  display.textContent = fmtTime(timerElapsed);
  if (startBtn) startBtn.style.display = timerRunning ? 'none' : '';
  if (pauseBtn) pauseBtn.style.display = timerRunning ? '' : 'none';
  if (stopBtn)  stopBtn.style.display  = timerElapsed > 0 ? '' : 'none';
  if (hint)     hint.textContent = timerElapsed > 0 && !timerRunning
    ? `> ${Math.ceil(timerElapsed / 60)} min logged — add to session below`
    : '';
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  const startedAt = Date.now() - timerElapsed * 1000;
  timerInterval = setInterval(() => {
    timerElapsed = Math.floor((Date.now() - startedAt) / 1000);
    updateTimerUI();
  }, 500);
  updateTimerUI();
}

// ── Session helpers ───────────────────────────────────────────────────────────
function syncProgress(book) {
  const total = (book.sessions || []).reduce((sum, s) => sum + s.pages, 0);
  book.currentPage = total;
  book.progress = book.pages ? Math.min(Math.round((total / book.pages) * 100), 100) : 0;
}

function fmtDuration(mins) {
  if (!mins || mins < 1) return '';
  return mins >= 60
    ? `${Math.floor(mins / 60)}h ${mins % 60}m`
    : `${mins}m`;
}

function sessionRowHTML(s, idx) {
  const dur = s.duration ? ` · ${fmtDuration(s.duration)}` : '';
  return `
    <div class="session-row">
      <span class="session-date">${escHtml(s.date)}</span>
      <span class="session-pages">+${s.pages} ${t('sessions_pages_unit')}${escHtml(dur)}</span>
      <button class="session-delete-btn" data-idx="${idx}">[×]</button>
    </div>`;
}

function buildListHTML(sessions) {
  if (!sessions.length) {
    return `<div class="sessions-empty">&gt; ${t('sessions_empty')}</div>`;
  }
  const totalPages = sessions.reduce((sum, s) => sum + s.pages, 0);
  const totalMins  = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const timeStr    = totalMins > 0 ? ` · ${fmtDuration(totalMins)} total` : '';
  const rows = [...sessions]
    .map((s, i) => ({ s, i }))
    .reverse()
    .map(({ s, i }) => sessionRowHTML(s, i))
    .join('');
  return `<div class="sessions-total">&gt; ${t('sessions_total')}: ${totalPages} ${t('sessions_pages_unit')}${escHtml(timeStr)}</div>${rows}`;
}

function refreshList(bookId) {
  const listEl = document.getElementById('sessions-list');
  if (!listEl) return;
  listEl.innerHTML = buildListHTML(state.booksData[bookId]?.sessions || []);
  bindDeleteButtons(bookId);
}

function bindDeleteButtons(bookId) {
  document.querySelectorAll('.session-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number.parseInt(btn.dataset.idx, 10);
      const book = state.booksData[bookId];
      if (!book?.sessions) return;
      book.sessions.splice(idx, 1);
      syncProgress(book);
      saveBooks();
      renderBooks();
      updateStats();
      refreshList(bookId);
    });
  });
}

export function renderSessionsSection(bookId) {
  const sessions = state.booksData[bookId]?.sessions || [];
  const today    = new Date().toISOString().slice(0, 10);
  timerElapsed   = 0;
  timerRunning   = false;

  return `
    <div class="detail-section">
      <div class="detail-section-title">&gt;&gt; ${t('sessions_title')}</div>

      <!-- Timer -->
      <div class="session-timer">
        <div id="timer-display" class="timer-display">00:00</div>
        <div class="timer-btns">
          <button id="timer-start" class="timer-btn timer-btn--start">[ ▶ START ]</button>
          <button id="timer-pause" class="timer-btn timer-btn--pause" style="display:none">[ ⏸ PAUSE ]</button>
          <button id="timer-stop"  class="timer-btn timer-btn--stop"  style="display:none">[ ■ STOP ]</button>
          <button id="timer-reset" class="timer-btn timer-btn--reset">[ RESET ]</button>
        </div>
        <div id="timer-hint" class="timer-hint"></div>
      </div>

      <div id="sessions-list">${buildListHTML(sessions)}</div>
      <div class="sessions-add-form">
        <div class="sessions-add-row">
          <input id="s-date"  class="session-date-input"  type="date"   value="${today}">
          <input id="s-pages" class="session-pages-input" type="number" min="1" placeholder="${t('sessions_ph_pages')}">
          <button id="s-add-btn" class="session-add-btn">${t('sessions_btn_add')}</button>
        </div>
      </div>
    </div>`;
}

export function initSessionsSection(bookId) {
  bindDeleteButtons(bookId);
  updateTimerUI();

  document.getElementById('timer-start')?.addEventListener('click', () => startTimer());
  document.getElementById('timer-pause')?.addEventListener('click', () => { stopTimer(); updateTimerUI(); });
  document.getElementById('timer-stop')?.addEventListener('click', () => {
    stopTimer();
    updateTimerUI();
    // Auto-focus pages input so user can log right away
    document.getElementById('s-pages')?.focus();
  });
  document.getElementById('timer-reset')?.addEventListener('click', () => resetTimer());

  document.getElementById('s-add-btn')?.addEventListener('click', () => {
    const dateEl  = document.getElementById('s-date');
    const pagesEl = document.getElementById('s-pages');
    const date    = dateEl.value.trim();
    const pages   = toPositiveInt(pagesEl.value);

    if (!date) {
      dateEl.classList.add('input-error');
      setTimeout(() => dateEl.classList.remove('input-error'), 600);
      return;
    }
    if (!pages) {
      pagesEl.classList.add('input-error');
      setTimeout(() => pagesEl.classList.remove('input-error'), 600);
      return;
    }

    const book = state.booksData[bookId];
    if (!book) return;
    if (!book.sessions) book.sessions = [];

    // Attach timer duration if timer was used
    const duration = timerElapsed > 0 ? Math.ceil(timerElapsed / 60) : undefined;
    const session  = duration ? { date, pages, duration } : { date, pages };
    book.sessions.push(session);

    syncProgress(book);

    // Auto-complete when all pages are read
    if (book.pages && book.currentPage >= book.pages && book.status === 'reading') {
      book.status   = 'completed';
      book.progress = 100;
      if (!book.completed) book.completed = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      import('./ui-feedback.js').then(({ showToast }) => {
        showToast(`✓ "${book.title}" marked as completed!`, 'success');
      }).catch(() => {});
    }

    saveBooks();
    renderBooks();
    updateStats();
    refreshList(bookId);
    import('./ui-streak.js').then(({ recordSessionToday }) => recordSessionToday()).catch(() => {});

    // Reset timer after logging
    resetTimer();
    pagesEl.value = '';
    pagesEl.focus();
  });
}
