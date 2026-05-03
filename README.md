# Libra — Cyberpunk Book Tracker

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A personal reading tracker with a full cyberpunk neon UI — glitch title, status-colored book spines, Open Library auto-fill, AI-powered recommendations, and a Fallout-style detail terminal.

[🌐 Live Demo](https://libra.laddtnov.xyz/)

![Libra Preview](Screenshot-book-desktop.png)

</div>

---

## ✨ Features

### Core
- **Full CRUD** — add, edit, delete books with a neon cyberpunk form modal
- **localStorage persistence** — your library survives page refresh, no account needed
- **Open Library auto-fill** — search any title, auto-populate author, pages, cover, synopsis, and genre
- **Stats dashboard** — Completed / Reading / Queued / Total with count-up animation; re-animates on every filter change
- **Clickable stat cards** — tap a stat card to instantly filter the grid

### Book Cards
- **Status-colored spines** — orange for Reading, green for Completed, purple for Queued
- **Status-matched hover glow** — each card glows in its own color on hover
- **3D tilt effect** — cards tilt on mouse move with spring-back on leave
- **Progress ring** — animated SVG ring on Reading cards, auto-updated by session log
- **Cover thumbnails** — pulled from Open Library when available
- **Star ratings** — gold stars with hover pulse

### Detail Modal (Fallout terminal style)
- Instant cyberpunk render — dark gradient, cyan border, pink labels
- Full fields: status, category, pages, progress, dates, synopsis, notes
- **Quotes & Highlights** — save memorable passages with page numbers per book
- **Reading Session Log** — log date + pages per session; automatically drives the progress ring
- **Where to Find** — 6 one-click links (Open Library, WorldCat, ThriftBooks, AbeBooks, Amazon, Google Books)
- **Reading Lists** — toggle the book in/out of any named list
- Edit and Delete with inline confirmation
- Sound toggle (Web Audio API click effect)

### Toolbar
- **Live search** — filters by title, author, or category in real time; triggers Open Library web discover
- **Filter buttons** — All / Reading / Done / Queued
- **Sort dropdown** — Title A→Z / Z→A, Rating, Pages, Date Added
- **Reading Lists** — create and manage named reading lists
- **Recommend** — AI or genre-based book recommendations
- **Export / Import** — one-click JSON backup and restore
- **Support** — Stripe + crypto donation panel

### AI Recommendations
- Paste your own **Claude API key** (stored locally, never leaves your browser)
- Claude analyses your completed books — titles, authors, genres, ratings
- Returns 6 personalised picks with a one-line reason per book
- Open Library enriches each suggestion with cover and metadata
- Falls back to genre-based Open Library search when no key is set

### Web Discover
- Search bar activates Open Library search in real time
- Result cards show cover, title, author, year, pages
- Click any card to preview full info and synopsis before adding
- One-click **+ ADD TO ARCHIVE** from the preview modal

### Multi-language
- 6 languages: **EN · UA · ES · RU · DE · PL**
- Language persisted in localStorage; switch any time from the header

### PWA — Installable & Offline
- Install on desktop or mobile from the browser address bar
- Full offline support via service worker cache-first strategy
- External API calls (Open Library, Claude) fail gracefully when offline

### UI & Animations
- `LIBRA` glitch title — pink + cyan clip-path layers on hover
- Scrolling cyber-grid background
- CRT scanlines on all modals
- Staggered card entrance (bounce-in, 70 ms per card)
- Neon toast notifications slide in from top-right

---

## 🚀 Quick Start

```bash
git clone https://github.com/laddtnov/book-archive.git
cd book-archive
open index.html
```

No build step. No dependencies. Just open the file.

---

## 📊 Book Statuses

| Status | Spine / Glow Color |
|--------|--------------------|
| 📖 Reading | Orange — SVG progress ring, session log |
| ✅ Completed | Green — steady glow |
| 📌 Queued | Purple — soft glow |

---

## 🤖 AI Recommendations Setup

1. Open the **⚡ RECOMMEND** panel
2. Click **⚙ CLAUDE API KEY**
3. Paste your key from [console.anthropic.com](https://console.anthropic.com)
4. Hit **[ SAVE ]** — the panel re-renders with AI picks instantly

Your key is stored only in your browser's localStorage and is sent exclusively to `api.anthropic.com`.

---

## 🛠️ Tech Stack

- **HTML5** — semantic single-page shell
- **CSS3** — Grid, Flexbox, custom properties, keyframe animations; ~20 modular CSS files
- **JavaScript ES6+** — vanilla, no frameworks; ES modules; Web Audio API
- **Open Library API** — book search, auto-fill, cover images (no key required)
- **Claude API** — AI recommendations (user-supplied key, optional)
- **Service Worker** — PWA offline cache

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

**Made with HTML, CSS, and JavaScript**

**If you like this project, give it a ⭐**

</div>
