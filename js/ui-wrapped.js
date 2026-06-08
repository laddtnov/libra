import { state } from './state.js';
import { trapFocus, focusFirst } from './ui-utils.js';

let _releaseTrap = null;
let _triggerEl = null;

const W = 640, H = 900;

function allBooks()  { return Object.values(state.booksData); }
function completed() { return allBooks().filter(b => b.status === 'completed'); }

function topGenre() {
  const map = {};
  for (const b of completed()) {
    const cat = b.category || 'Other';
    map[cat] = (map[cat] || 0) + 1;
  }
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? '—';
}

function favBook() {
  return completed()
    .filter(b => b.rating)
    .sort((a, b) => b.rating - a.rating)[0] ?? null;
}

function totalPages() {
  return allBooks()
    .flatMap(b => b.sessions || [])
    .reduce((s, x) => s + (x.pages || 0), 0);
}

// ── Draw ──────────────────────────────────────────────────────────────────────
export function drawWrapped(canvas) {
  const year   = new Date().getFullYear();
  const done   = completed();
  const pages  = totalPages();
  const genre  = topGenre();
  const fav    = favBook();
  const streak = (() => {
    try { return JSON.parse(localStorage.getItem('libra-streak') || '{}').best || 0; } catch { return 0; }
  })();

  const ctx = canvas.getContext('2d');
  canvas.width  = W;
  canvas.height = H;

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d0d1a');
  bg.addColorStop(1, '#0a0a14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Grid lines ──
  ctx.strokeStyle = 'rgba(245,158,11,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Border ──
  ctx.strokeStyle = 'rgba(245,158,11,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // ── Inner accent border ──
  ctx.strokeStyle = 'rgba(245,158,11,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // ── Corner marks ──
  const corners = [[20,20],[W-20,20],[20,H-20],[W-20,H-20]];
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  for (const [cx, cy] of corners) {
    const sx = cx === 20 ? 1 : -1, sy = cy === 20 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(cx + sx * 20, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * 20); ctx.stroke();
  }

  // ── LIBRA logo ──
  ctx.fillStyle = 'rgba(245,158,11,0.25)';
  ctx.font = 'bold 11px "Courier New"';
  ctx.letterSpacing = '4px';
  ctx.fillText('>_ LIBRA', 44, 60);

  // ── Year heading ──
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 72px "Courier New"';
  ctx.letterSpacing = '8px';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(245,158,11,0.6)';
  ctx.shadowBlur = 24;
  ctx.fillText(String(year), W / 2, 160);

  ctx.font = 'bold 16px "Courier New"';
  ctx.letterSpacing = '6px';
  ctx.fillStyle = 'rgba(245,158,11,0.55)';
  ctx.shadowBlur = 0;
  ctx.fillText('READING WRAPPED', W / 2, 195);

  // ── Divider ──
  ctx.strokeStyle = 'rgba(245,158,11,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 220); ctx.lineTo(W - 60, 220); ctx.stroke();

  // ── Stat cards ──
  const stats = [
    { label: 'BOOKS READ',  value: String(done.length) },
    { label: 'PAGES READ',  value: pages >= 1000 ? `${(pages/1000).toFixed(1)}k` : String(pages) },
    { label: 'TOP GENRE',   value: genre.length > 10 ? genre.slice(0, 10) + '…' : genre },
    { label: 'BEST STREAK', value: `${streak}d` },
  ];

  const cardW = (W - 80 - 30) / 2;
  const cardH = 110;
  const startY = 250;

  stats.forEach(({ label, value }, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 40 + col * (cardW + 30);
    const y = startY + row * (cardH + 16);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(245,158,11,0.06)';
    roundRect(ctx, x, y, cardW, cardH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,158,11,0.25)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, cardW, cardH, 8);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px "Courier New"';
    ctx.shadowColor = 'rgba(245,158,11,0.5)';
    ctx.shadowBlur = 12;
    ctx.fillText(value, x + cardW / 2, y + 56);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(245,158,11,0.45)';
    ctx.font = '10px "Courier New"';
    ctx.letterSpacing = '3px';
    ctx.fillText(label, x + cardW / 2, y + 84);
  });

  // ── Fav book ──
  const favY = startY + 2 * (cardH + 16) + 20;

  ctx.strokeStyle = 'rgba(245,158,11,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, favY - 10); ctx.lineTo(W - 60, favY - 10); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(245,158,11,0.4)';
  ctx.font = '10px "Courier New"';
  ctx.letterSpacing = '3px';
  ctx.shadowBlur = 0;
  ctx.fillText('FAVOURITE BOOK OF THE YEAR', W / 2, favY + 14);

  if (fav) {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px "Courier New"';
    ctx.letterSpacing = '1px';
    ctx.shadowColor = 'rgba(245,158,11,0.3)';
    ctx.shadowBlur = 8;
    const titleText = fav.title.length > 32 ? fav.title.slice(0, 32) + '…' : fav.title;
    ctx.fillText(titleText, W / 2, favY + 50);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(245,158,11,0.55)';
    ctx.font = '14px "Courier New"';
    ctx.letterSpacing = '1px';
    ctx.fillText(`by ${fav.author}`, W / 2, favY + 78);

    const stars = '★'.repeat(fav.rating) + '☆'.repeat(5 - fav.rating);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '20px "Courier New"';
    ctx.letterSpacing = '4px';
    ctx.shadowColor = 'rgba(245,158,11,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(stars, W / 2, favY + 110);
  } else {
    ctx.fillStyle = 'rgba(245,158,11,0.3)';
    ctx.font = '14px "Courier New"';
    ctx.fillText('— no completed books yet —', W / 2, favY + 58);
  }

  // ── Footer ──
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(245,158,11,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, H - 80); ctx.lineTo(W - 60, H - 80); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(245,158,11,0.3)';
  ctx.font = '11px "Courier New"';
  ctx.letterSpacing = '2px';
  ctx.fillText('libra.laddtnov.xyz', W / 2, H - 52);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function openWrappedPanel() {
  const panel   = document.getElementById('wrapped-panel');
  const overlay = document.getElementById('modal-overlay');
  const canvas  = document.getElementById('wrapped-canvas');
  if (!panel || !canvas) return;

  drawWrapped(canvas);
  panel.style.display   = 'flex';
  overlay.style.display = 'block';

  _triggerEl = document.activeElement;
  _releaseTrap = trapFocus(panel);
  focusFirst(panel);
}

export function closeWrappedPanel() {
  document.getElementById('wrapped-panel').style.display   = 'none';
  document.getElementById('modal-overlay').style.display = 'none';

  if (_releaseTrap) { _releaseTrap(); _releaseTrap = null; }
  if (_triggerEl) { _triggerEl.focus?.(); _triggerEl = null; }
}

export function initWrappedPanel() {
  document.getElementById('close-wrapped-panel')?.addEventListener('click', closeWrappedPanel);
  document.getElementById('wrapped-download-btn')?.addEventListener('click', () => {
    const canvas = document.getElementById('wrapped-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `libra-wrapped-${new Date().getFullYear()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
}
