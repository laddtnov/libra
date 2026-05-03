# 📚 Cyberpunk Book Tracker

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A personal reading tracker with a full cyberpunk neon UI — glitch title, status-colored book spines, Open Library auto-fill, and a Fallout-style detail terminal.

[🌐 Live Demo](https://libra.laddtnov.xyz/)

![Portfolio Preview](Screenshot-book-desktop.png)

</div>

---

## ✨ Features

### Core
- **Full CRUD** — add, edit, delete books with a neon cyberpunk form modal
- **localStorage persistence** — your library survives page refresh
- **Open Library auto-fill** — search any title and auto-populate author, pages, cover, synopsis, and genre
- **Stats dashboard** — Completed / Reading / Queued / Total with count-up animation; re-animates on every filter change
- **Clickable stat cards** — tap a stat card to instantly filter the grid

### Book Cards
- **Status-colored spines** — orange for Reading, green for Completed, purple for Queued
- **Status-matched hover glow** — each card glows in its own status color on hover
- **Progress bar** — animated neon gradient bar on Reading cards
- **Star ratings** — gold stars with hover pulse on card hover

### Toolbar
- **Live search** — filters by title, author, or category in real time
- **Filter buttons** — All / Reading / Done / Queued
- **Sort dropdown** — Title A→Z, Title Z→A, Rating, Pages, Date Added

### Detail Modal (Fallout terminal style)
- Instant render — cyberpunk neon redesign with dark gradient, cyan border, pink labels
- Book cover from Open Library (if available)
- Full fields: status, category, pages, progress, dates, synopsis, notes
- Edit and Delete always visible; Delete requires inline confirmation
- Sound toggle (Web Audio API click effect)

### Toast Notifications
- Neon toasts slide in from the top-right on every save, update, or delete
- Color-coded: green for save/update, red for delete

### UI & Animations
- `BOOK.ARCHIVE` title glitch animation (pink + cyan clip-path layers on hover)
- Tagline neon underline sweeps on hover
- Staggered card entrance (bounce-in, 70ms per card)
- Scrolling cyber-grid background
- CRT scanlines on modals

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
| 📖 Reading | Orange — animated progress bar |
| ✅ Completed | Green — steady glow |
| 📌 Queued | Purple — soft glow |

---

## 🛠️ Tech Stack

- **HTML5** — semantic structure, single page
- **CSS3** — Grid, Flexbox, custom properties, keyframe animations
- **JavaScript ES6+** — vanilla, no frameworks; Web Audio API, Open Library fetch
- **Open Library API** — free, no key required

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
3. [📚 Book Tracker](https://github.com/laddtnov/book-archive) — this project

---

<div align="center">

**Made with HTML, CSS, and JavaScript**

**If you like this project, give it a ⭐**

</div>
