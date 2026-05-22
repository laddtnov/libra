import { state } from './state.js';

const API_KEY_STORAGE = 'libra-claude-key';

// localStorage is readable by any JS on the page, so XSS could expose this key.
// Acceptable for a single-user personal app; a backend-held key would eliminate the risk.
function getSavedKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

// ── Data aggregation ─────────────────────────────────────────────────────────

function aggregateLibraryData() {
  const books     = Object.values(state.booksData);
  const completed = books.filter(b => b.status === 'completed');
  const reading   = books.filter(b => b.status === 'reading');
  const queued    = books.filter(b => b.status === 'to-read');

  // Category counts across completed books
  const categoryCounts = {};
  completed.forEach(b => {
    const c = b.category || 'Other';
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${cat} (${count})`)
    .join(', ') || 'none';

  // Overall average rating
  const rated     = completed.filter(b => b.rating);
  const avgRating = rated.length
    ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1)
    : 'N/A';

  // Average rating per category
  const ratingByCategory = {};
  rated.forEach(b => {
    const c = b.category || 'Other';
    if (!ratingByCategory[c]) ratingByCategory[c] = [];
    ratingByCategory[c].push(b.rating);
  });
  const ratingByCategoryStr = Object.entries(ratingByCategory)
    .map(([cat, ratings]) =>
      `${cat}: ${(ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)}`
    ).join(', ') || 'N/A';

  // Completed books by month (YYYY-MM) — validate date before slicing
  const byMonth = {};
  completed.forEach(b => {
    if (!b.completed) return;
    const d = new Date(b.completed);
    if (Number.isNaN(d.getTime())) return;
    const month = b.completed.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });
  const booksByMonth = Object.entries(byMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, n]) => `${m}: ${n}`)
    .join(', ') || 'N/A';

  // Session aggregation
  let totalPages    = 0;
  let totalSessions = 0;
  const pagesByMonth = {};

  books.forEach(b => {
    if (!Array.isArray(b.sessions)) return;
    b.sessions.forEach(s => {
      const pages = s.pages || 0;
      totalPages += pages;
      totalSessions++;
      if (s.date) {
        const month = s.date.slice(0, 7);
        pagesByMonth[month] = (pagesByMonth[month] || 0) + pages;
      }
    });
  });

  // Most active reading month by pages
  const mostActiveMonth = Object.entries(pagesByMonth)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  // Avg pages/day estimated from first to last session month
  const allMonths = Object.keys(pagesByMonth).sort((a, b) => a.localeCompare(b));
  let avgPagesPerDay = 'N/A';
  if (allMonths.length >= 2) {
    const first = new Date(allMonths[0] + '-01');
    // Add 30 days to last month start to approximate end of that month
    const last  = new Date(allMonths.at(-1) + '-01');
    last.setDate(last.getDate() + 30);
    const days  = Math.max(1, Math.round((last - first) / 86_400_000));
    avgPagesPerDay = Math.round(totalPages / days);
  } else if (allMonths.length === 1) {
    avgPagesPerDay = Math.round(totalPages / 30);
  }

  return {
    completedCount:   completed.length,
    readingTitles:    reading.map(b => b.title).join(', ') || 'none',
    queuedCount:      queued.length,
    queuedCategories: [...new Set(queued.map(b => b.category || 'Other'))].join(', ') || 'none',
    topCategories,
    avgRating,
    ratingByCategory: ratingByCategoryStr,
    totalPages,
    avgPagesPerDay,
    mostActiveMonth,
    totalSessions,
    booksByMonth,
  };
}

// ── Prompt construction ───────────────────────────────────────────────────────

function buildPrompt(s) {
  return `You are analysing someone's personal reading library. Based on the data below, write a 3–5 sentence personal reading profile in second person ("You..."). Surface genuine patterns — genres, pace, ratings, timing, variety or lack of it. Be specific and conversational, not generic. No bullet points, no headers, no recommendations — just an honest narrative portrait of this reader.

Library summary:
- Completed: ${s.completedCount} books
- Currently reading: ${s.readingTitles}
- Queued: ${s.queuedCount} books across ${s.queuedCategories}
- Top categories: ${s.topCategories}
- Average rating: ${s.avgRating}/5
- Ratings by category: ${s.ratingByCategory}
- Pages read total: ${s.totalPages}
- Avg pages/day: ${s.avgPagesPerDay}
- Most active month: ${s.mostActiveMonth}
- Total sessions: ${s.totalSessions}
- Completed books by month: ${s.booksByMonth}`;
}

// ── Claude fetch ──────────────────────────────────────────────────────────────

async function callClaude(prompt, apiKey) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'content-type':  'application/json',
      'x-claude-key':  apiKey,
    },
    body: JSON.stringify({ prompt, max_tokens: 512 }),
  });

  if (res.status === 401) throw new Error('invalid_key');
  if (!res.ok) throw new Error(`api_error_${res.status}`);

  const data = await res.json();
  return data.text;
}

// ── Section render ────────────────────────────────────────────────────────────

export function renderInsightsSection(container) {
  const section = document.createElement('div');
  section.className = 'stats-section insights-section';

  const title = document.createElement('div');
  title.className = 'stats-section-title';
  title.textContent = 'AI INSIGHTS';
  section.appendChild(title);

  const apiKey = getSavedKey();

  if (!apiKey) {
    const hint = document.createElement('div');
    hint.className = 'stats-empty insights-hint';
    hint.textContent = '> Add a Claude API key in ⚡ RECOMMEND to unlock';
    section.appendChild(hint);
    container.appendChild(section);
    return;
  }

  const summary = aggregateLibraryData();

  if (summary.completedCount === 0) {
    const hint = document.createElement('div');
    hint.className = 'stats-empty insights-hint';
    hint.textContent = '> No completed books yet — finish a book to unlock insights';
    section.appendChild(hint);
    container.appendChild(section);
    return;
  }

  const btn = document.createElement('button');
  btn.className = 'terminal-action-btn insights-btn';
  btn.textContent = '[ ANALYSE MY LIBRARY ]';
  section.appendChild(btn);

  const output = document.createElement('p');
  output.className = 'insights-output';
  output.style.display = 'none';
  section.appendChild(output);

  btn.addEventListener('click', async () => {
    btn.textContent = '▸ ANALYSING...';
    btn.disabled    = true;
    output.style.display = 'none';

    try {
      const prompt  = buildPrompt(summary);
      const text    = await callClaude(prompt, apiKey);
      output.textContent   = text;
      output.style.display = 'block';
    } catch (err) {
      output.textContent   = err.message === 'invalid_key'
        ? '> Invalid API key — update it in ⚡ RECOMMEND'
        : '> AI unavailable — try again later';
      output.style.display = 'block';
    } finally {
      btn.textContent = '[ ANALYSE MY LIBRARY ]';
      btn.disabled    = false;
    }
  });

  container.appendChild(section);
}
