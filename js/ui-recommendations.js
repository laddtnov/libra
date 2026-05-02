import { state, escHtml } from './state.js';

function computeRecommendations() {
  const books = Object.entries(state.booksData);

  const genreCount = {};
  let totalCompleted = 0;
  for (const [, b] of books) {
    if (b.status === 'completed') {
      totalCompleted++;
      if (b.category && b.category !== 'Other') {
        genreCount[b.category] = (genreCount[b.category] || 0) + 1;
      }
    }
  }

  const queued = books.filter(([, b]) => b.status === 'to-read');

  const scored = queued.map(([id, b]) => {
    const genreScore = b.category ? (genreCount[b.category] || 0) : 0;
    const ratingBoost = b.rating ? b.rating * 0.2 : 0;
    const score = genreScore * 2 + ratingBoost;
    let reason;
    if (genreScore > 0) {
      reason = `${genreCount[b.category]} completed ${b.category} book${genreCount[b.category] !== 1 ? 's' : ''}`;
    } else if (b.rating) {
      reason = `Rated ${b.rating}/5 stars`;
    } else {
      reason = 'In your queue';
    }
    return { id, book: b, score, reason };
  });

  scored.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title));

  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return { recommendations: scored.slice(0, 6), topGenres, totalCompleted };
}

function buildGenreBars(topGenres) {
  if (!topGenres.length) {
    return `<div class="recs-no-data">&gt; No genre data yet — complete some books to build your profile.</div>`;
  }
  const max = topGenres[0][1];
  return topGenres.map(([genre, count]) => {
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

function buildRecCards(recommendations) {
  if (!recommendations.length) {
    return `<div class="recs-no-data">&gt; Add books to your queue to get recommendations.</div>`;
  }
  return recommendations.map(({ book, reason }) => {
    const safeTitle = escHtml(book.title);
    const safeAuthor = escHtml(book.author);
    const safeCategory = escHtml(book.category || 'Other');
    const safeReason = escHtml(reason);
    const coverHTML = book.coverId
      ? `<img class="rec-cover" src="https://covers.openlibrary.org/b/id/${book.coverId}-S.jpg" alt="" loading="lazy">`
      : `<div class="rec-cover-placeholder">${escHtml(book.title.charAt(0).toUpperCase())}</div>`;
    return `
      <div class="rec-card">
        ${coverHTML}
        <div class="rec-card-body">
          <div class="rec-card-title">${safeTitle}</div>
          <div class="rec-card-author">by ${safeAuthor}</div>
          <div class="rec-card-meta">
            <span class="rec-tag">${safeCategory}</span>
            <span class="rec-reason">&gt; ${safeReason}</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

export function renderRecsPanel() {
  const content = document.getElementById('recs-content');
  if (!content) return;

  const { recommendations, topGenres, totalCompleted } = computeRecommendations();

  const statsLine = totalCompleted > 0
    ? `&gt; Analyzed ${totalCompleted} completed book${totalCompleted !== 1 ? 's' : ''} — genre profile loaded.`
    : `&gt; No completed books yet — finish some reads to unlock recommendations.`;

  content.innerHTML = `
    <div class="recs-stats-line">${statsLine}</div>

    <div class="recs-section">
      <div class="recs-section-title">&gt;&gt; GENRE PROFILE</div>
      <div class="genre-bars">${buildGenreBars(topGenres)}</div>
    </div>

    <div class="recs-section">
      <div class="recs-section-title">&gt;&gt; RECOMMENDED READS</div>
      <div class="rec-cards">${buildRecCards(recommendations)}</div>
    </div>`;
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
