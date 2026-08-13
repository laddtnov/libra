# Libra — Cyberpunk Reading Tracker

<div align="center">

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/laddtnov)

</div>

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A personal reading tracker with a full cyberpunk neon UI — glitch title, status-colored book spines, Open Library auto-fill, genre-based recommendations, cross-device cloud sync, and a full reading stats dashboard.

[🌐 Live Demo](https://libra.laddtnov.xyz/)

</div>

---

## ✨ Features

### Core
- **Full CRUD** — add, edit, delete books with a cyberpunk form modal
- **Cloud sync** — sign in with email + password, books sync across all devices via Supabase
- **Offline first** — localStorage fallback when offline; syncs on reconnect; auto-pulls on tab focus
- **Open Library auto-fill** — search any title, auto-populate author, pages, cover, synopsis, genre
- **Stats cards** — Completed / Reading / Queued / Total with count-up animation
- **Custom tags** — tag books freely; search by tag name
- **Auto-complete** — book auto-marks as completed when session pages reach total

### Reading Goal & Streaks
- **Annual reading goal** — set a target, watch the neon progress bar fill up
- **Per-genre goals** — e.g. "Read 5 Fantasy books this year" with mini progress bars
- **Reading streaks** — consecutive days with sessions logged; flame badge with hover animation
- **Milestone toasts** — fire at 7, 14, 30, 60, 100-day streaks

### Reading Timer & Sessions
- **Reading timer** — start/pause/stop timer in session log; elapsed minutes saved with session
- **Reading Session Log** — log date + pages; drives the progress ring automatically
- **Pace estimator** — calculates avg pages/day from sessions → estimated finish date

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
- **Custom tags** — cyan chips displayed on cards

### Detail Modal
- Full fields: status, category, pages, progress, dates, synopsis, notes, tags
- **Quotes & Highlights** — save memorable passages with page numbers
- **Where to Find** — 6 one-click links (Open Library, WorldCat, ThriftBooks, AbeBooks, Amazon, Google Books)
- **Reading Lists** — toggle book in/out of any named list
- **Pace estimator** — EST. FINISH date shown for reading books

### Toolbar
- **Live search** — filters by title/author/category/tags; triggers Open Library web discover
- **Filter buttons** — All / Reading / Done / Queued
- **Sort dropdown** — Title, Rating, Pages, Date Added
- **📊 STATS** — full reading statistics dashboard
- **⚡ RECOMMEND** — genre-based book recommendations
- **⊕ GOODREADS** — import your Goodreads CSV export with duplicate detection
- **Export / Import** — one-click JSON backup and restore

### Auth
- Email + password sign up / sign in
- Forgot password → reset link via email (cyberpunk-styled email template)
- Settings sync across devices (goal, API key, streak, display name)

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
git clone https://github.com/laddtnov/libra.git
cd libra
```

Copy credentials file:
```bash
cp js/config.example.js js/config.js
# fill in your Supabase URL and anon key
```

Then open `index.html` — no build step needed for the frontend.

---

## ☁️ Cloud Sync Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run all migrations in order in the Supabase SQL Editor:
   - `db/002_user_books.sql`
   - `db/003_user_settings.sql`
3. Fill in `js/config.js` with your project URL and anon key
4. Click **[ SIGN IN ]** in the header → create an account or log in

---

## 📊 Book Statuses

| Status | Color |
|--------|-------|
| 📖 Reading | Orange — SVG progress ring, session log |
| ✅ Completed | Green — steady glow |
| 📌 Queued | Purple — soft glow |

---

## 🛠️ Tech Stack

- **HTML5 / CSS3 / JavaScript ES6+** — vanilla, no frameworks; ~30 modular ES modules
- **Supabase** — Postgres + email+password auth + cross-device sync
- **Open Library API** — book search, covers, metadata (no key required)
- **Resend** — transactional email (password reset)
- **Service Worker** — PWA offline cache
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
3. [📚 Libra — Book Tracker](https://github.com/laddtnov/libra) — this project

---

<div align="center">

**Made with HTML, CSS, JavaScript, and Supabase**

**If you like this project, give it a ⭐**

</div>
