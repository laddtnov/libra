# Libra — Cyberpunk Reading Tracker

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A personal reading tracker with a full cyberpunk neon UI — glitch title, status-colored book spines, Open Library auto-fill, AI-powered recommendations, cross-device cloud sync, and a full reading stats dashboard.

[🌐 Live Demo](https://libra.laddtnov.xyz/)

</div>

---

## ✨ Features

### Core
- **Full CRUD** — add, edit, delete books with a cyberpunk form modal
- **Cloud sync** — sign in with magic link, books sync across all devices via Supabase
- **Offline first** — localStorage fallback when offline; syncs on reconnect
- **Open Library auto-fill** — search any title, auto-populate author, pages, cover, synopsis, genre
- **Stats cards** — Completed / Reading / Queued / Total with count-up animation

### Reading Goal & Streaks
- **Annual reading goal** — set a target, watch the neon progress bar fill up
- **Reading streaks** — consecutive days with sessions logged; flame badge with hover animation
- **Milestone toasts** — fire at 7, 14, 30, 60, 100-day streaks

### Stats Dashboard
- Pages read per month (bar chart)
- Books finished per month
- Average rating by genre
- Top categories breakdown
- All-time totals: pages read, books completed, avg rating

### Book Cards
- **Status-colored spines** — orange for Reading, green for Completed, purple for Queued
- **Progress ring** — animated SVG ring on Reading cards, driven by session log
- **Cover thumbnails** — pulled from Open Library when available
- **3D tilt effect** — cards tilt on mouse move with spring-back
- **Star ratings** — gold stars with hover pulse

### Detail Modal
- Full fields: status, category, pages, progress, dates, synopsis, notes
- **Quotes & Highlights** — save memorable passages with page numbers
- **Reading Session Log** — log date + pages; drives the progress ring automatically
- **Where to Find** — 6 one-click links (Open Library, WorldCat, ThriftBooks, AbeBooks, Amazon, Google Books)
- **Reading Lists** — toggle book in/out of any named list

### Toolbar
- **Live search** — filters by title/author/category; triggers Open Library web discover
- **Filter buttons** — All / Reading / Done / Queued
- **Sort dropdown** — Title, Rating, Pages, Date Added
- **📊 STATS** — full reading statistics dashboard
- **🎁 WRAPPED** — shareable year-in-review card, downloadable as PNG
- **⚡ RECOMMEND** — AI or genre-based book recommendations
- **⊕ GOODREADS** — import your Goodreads CSV export with duplicate detection
- **Export / Import** — one-click JSON backup and restore
- **♥ SUPPORT** — Stripe + crypto donation panel with Resend appreciation email

### AI Recommendations
- Paste your **Claude API key** (stored locally, never leaves your browser)
- Claude analyses your completed books and returns 6 personalised picks
- Open Library enriches each suggestion with cover and metadata
- Falls back to genre-based search when no key is set

### Reading Wrapped
- On-demand year-in-review canvas card
- Shows: books read, pages read, top genre, best streak, favourite book
- Download as PNG and share

### Goodreads Import
- Upload your Goodreads CSV export
- Auto-maps: title, author, rating, pages, status, completed date
- Skips duplicates with a summary toast

### Multi-language
- 6 languages: **EN · UA · ES · RU · DE · PL**
- Persisted in localStorage; switch any time from the header

### PWA — Installable & Offline
- Install on desktop or mobile from the browser address bar
- Full offline support via service worker (cache-first)
- External API calls fail gracefully when offline

---

## 🚀 Quick Start

```bash
git clone https://github.com/laddtnov/book-archive.git
cd book-archive
```

Copy credentials file:
```bash
cp js/config.example.js js/config.js
# fill in your Supabase URL and anon key
```

Then open `index.html` — no build step, no dependencies.

---

## ☁️ Cloud Sync Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `db/002_user_books.sql` in the Supabase SQL Editor
3. Fill in `js/config.js` with your project URL and anon key
4. Click **[ SIGN IN ]** in the header → enter email → click magic link

---

## 📊 Book Statuses

| Status | Color |
|--------|-------|
| 📖 Reading | Orange — SVG progress ring, session log |
| ✅ Completed | Green — steady glow |
| 📌 Queued | Purple — soft glow |

---

## 🤖 AI Recommendations Setup

1. Open the **⚡ RECOMMEND** panel
2. Click **⚙ CLAUDE API KEY**
3. Paste your key from [console.anthropic.com](https://console.anthropic.com)
4. Hit **[ SAVE ]** — AI picks render instantly

Your key is stored only in localStorage and sent exclusively to `api.anthropic.com`.

---

## 🛠️ Tech Stack

- **HTML5 / CSS3 / JavaScript ES6+** — vanilla, no frameworks; ~25 modular ES modules
- **Supabase** — Postgres + auth (magic link) + cross-device sync
- **Open Library API** — book search, covers, metadata (no key required)
- **Claude API** — AI recommendations (user-supplied key, optional)
- **Resend** — transactional email for donation appreciation
- **Service Worker** — PWA offline cache (libra-v25)
- **Vercel** — hosting + serverless functions

---

## 📱 Responsive

- **Desktop:** 3–4 column grid
- **Tablet:** 2 columns
- **Mobile:** single column, touch-friendly

---

## 📬 Contact

**Laddtnov**
- GitHub: [@laddtnov](https://github.com/laddtnov)
- Email: novytskiyvladislav@proton.me
- Portfolio: [laddtnov.github.io/portfolio-website](https://laddtnov.github.io/portfolio-website/)

---

## 🌠 More Projects

1. [🌌 Interactive Solar System](https://github.com/laddtnov/solar-system)
2. [💼 Cyberpunk Portfolio](https://github.com/laddtnov/laddtnov-hub)
3. [📚 Libra — Book Tracker](https://github.com/laddtnov/book-archive) — this project

---

<div align="center">

**Made with HTML, CSS, JavaScript, and Supabase**

**If you like this project, give it a ⭐**

</div>
