# M1 — ISBN Barcode Scanner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toolbar SCAN ISBN button that opens a compact camera modal, scans ISBN-13 barcodes via ZXing, fetches book data from Open Library, then opens the Add Book form pre-filled.

**Architecture:** New `js/ui-scanner.js` owns the full scanner lifecycle (modal, camera, fetch, handoff). `index.html` gets the button, modal HTML, and ZXing CDN script. `ui-form-modal.js` gains an optional `prefill` param. `app-ui.js` wires the button and Escape/overlay close.

**Tech Stack:** ZXing `@zxing/browser` UMD (jsDelivr CDN), Open Library ISBN API, vanilla JS ES modules, existing modal/toast patterns.

---

## File Map

| Action | File | What changes |
|---|---|---|
| Modify | `index.html` | ZXing script tag, `#scan-isbn-btn` button, `#scanner-modal` HTML |
| Modify | `css/main.css` | Scanner modal styles, viewfinder, corner brackets, scan-line animation |
| **Create** | `js/ui-scanner.js` | All scanner logic: modal, camera, ZXing, fetch, prefill handoff |
| Modify | `js/ui-form-modal.js` | Add `prefill` param to `openFormModal()` |
| Modify | `js/app-ui.js` | Import + wire `#scan-isbn-btn`, Escape/overlay close |

---

## Task 1: Add ZXing CDN, scanner button, and modal HTML to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add ZXing CDN script tag**

  Open `index.html`. Before the closing `</body>` tag, add ZXing immediately before the existing app entry script:

  ```html
  <!-- ZXing barcode scanner (ISBN support) -->
  <script src="https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js"></script>
  ```

- [ ] **Step 2: Add the scanner toolbar button**

  Find line ~177:
  ```html
  <button class="recs-btn" id="recommend-btn" data-i18n="btn_recommend">⚡ RECOMMEND</button>
  ```

  Add immediately after:
  ```html
  <button class="scan-isbn-btn" id="scan-isbn-btn">⊞ SCAN ISBN</button>
  ```

- [ ] **Step 3: Add the scanner modal HTML**

  After the closing `</div>` of `#form-modal` (line ~222), add:

  ```html
  <!-- Scanner Modal -->
  <div id="scanner-modal" style="display:none">
    <div class="scanner-modal-container">
      <div class="scanner-header">
        <span class="scanner-title">⊞ ISBN SCANNER</span>
        <button id="close-scanner-modal" class="close-btn">✕</button>
      </div>
      <div class="scanner-viewfinder-wrap" id="scanner-viewfinder-wrap">
        <video id="scanner-video" class="scanner-video" playsinline muted></video>
        <div class="scanner-corners">
          <span class="sc-corner tl"></span>
          <span class="sc-corner tr"></span>
          <span class="sc-corner bl"></span>
          <span class="sc-corner br"></span>
        </div>
        <div class="scanner-line" id="scanner-line"></div>
        <div class="scanner-status" id="scanner-status">▸ REQUESTING CAMERA...</div>
      </div>
      <div class="scanner-fallback">
        <span class="scanner-fallback-label">ISBN:</span>
        <input id="scanner-isbn-input" class="terminal-input scanner-isbn-input"
               placeholder="9780000000000" maxlength="13" autocomplete="off" spellcheck="false">
        <button id="scanner-go-btn" class="terminal-action-btn scanner-go-btn">GO</button>
      </div>
      <div class="scanner-footer">
        <span id="scanner-cam-label">INITIALISING</span>
        <span>OPEN LIBRARY API</span>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 4: Verify in browser DevTools console**

  ```js
  document.getElementById('scan-isbn-btn')   // returns button element
  document.getElementById('scanner-modal')   // returns div element
  typeof ZXingBrowser                        // returns "object"
  ```

  Expected: all three truthy, no console errors.

- [ ] **Step 5: Commit**

  ```bash
  git add index.html
  git commit -m "feat: add ZXing CDN, SCAN ISBN toolbar button, scanner modal HTML"
  ```

---

## Task 2: Add scanner CSS to main.css

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Append scanner styles to end of css/main.css**

  ```css
  /* == Scanner Modal ================================================ */
  #scanner-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
  }

  .scanner-modal-container {
    background: var(--bg-card, #0d1117);
    border: 1px solid var(--neon-cyan, #00f2ff);
    border-radius: 4px;
    width: min(340px, 92vw);
    font-family: 'Space Mono', monospace;
    box-shadow: 0 0 24px rgba(0, 242, 255, 0.15);
    overflow: hidden;
  }

  .scanner-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(0, 242, 255, 0.15);
    background: rgba(0, 242, 255, 0.04);
  }

  .scanner-title {
    font-size: 11px;
    color: var(--neon-cyan, #00f2ff);
    letter-spacing: 1px;
  }

  .scanner-viewfinder-wrap {
    position: relative;
    background: #080c14;
    height: 180px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scanner-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.9;
  }

  .scanner-corners {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .sc-corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: var(--neon-cyan, #00f2ff);
    border-style: solid;
  }

  .sc-corner.tl { top: 12px;    left: 12px;    border-width: 2px 0 0 2px; }
  .sc-corner.tr { top: 12px;    right: 12px;   border-width: 2px 2px 0 0; }
  .sc-corner.bl { bottom: 12px; left: 12px;    border-width: 0 0 2px 2px; }
  .sc-corner.br { bottom: 12px; right: 12px;   border-width: 0 2px 2px 0; }

  @keyframes isbn-scan {
    0%   { top: 15%; opacity: 1; }
    85%  { opacity: 1; }
    100% { top: 82%; opacity: 0.4; }
  }

  .scanner-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 5%, var(--neon-cyan, #00f2ff) 50%, transparent 95%);
    box-shadow: 0 0 8px var(--neon-cyan, #00f2ff);
    z-index: 3;
    animation: isbn-scan 1.8s ease-in-out infinite alternate;
    pointer-events: none;
  }

  .scanner-line.hidden { display: none; }

  .scanner-status {
    position: absolute;
    bottom: 8px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
    color: rgba(0, 242, 255, 0.7);
    z-index: 4;
    letter-spacing: 1px;
    pointer-events: none;
  }

  .scanner-fallback {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-top: 1px solid rgba(0, 242, 255, 0.08);
  }

  .scanner-fallback-label {
    font-size: 10px;
    color: rgba(0, 242, 255, 0.5);
    flex-shrink: 0;
  }

  .scanner-isbn-input { flex: 1; font-size: 11px; }

  .scanner-go-btn { flex-shrink: 0; font-size: 10px; padding: 5px 12px; }

  .scanner-footer {
    display: flex;
    justify-content: space-between;
    padding: 6px 14px;
    font-size: 9px;
    color: rgba(0, 242, 255, 0.35);
    border-top: 1px solid rgba(0, 242, 255, 0.06);
    letter-spacing: 0.5px;
  }

  .scan-isbn-btn {
    background: transparent;
    border: 1px solid rgba(0, 242, 255, 0.5);
    color: var(--neon-cyan, #00f2ff);
    padding: 6px 12px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .scan-isbn-btn:hover {
    border-color: var(--neon-cyan, #00f2ff);
    box-shadow: 0 0 10px rgba(0, 242, 255, 0.3);
  }
  ```

- [ ] **Step 2: Verify styles**

  In DevTools console:
  ```js
  document.getElementById('scanner-modal').style.display = 'flex'
  ```

  Expected: modal centred over page, cyan border, animated scan line, corner brackets. Camera area is dark (no stream yet).
  Reset: `document.getElementById('scanner-modal').style.display = 'none'`

- [ ] **Step 3: Commit**

  ```bash
  git add css/main.css
  git commit -m "feat: scanner modal CSS — viewfinder, corners, scan-line animation"
  ```

---

## Task 3: Create js/ui-scanner.js

**Files:**
- Create: `js/ui-scanner.js`

- [ ] **Step 1: Create js/ui-scanner.js with full implementation**

  ```js
  import { openFormModal } from './ui-form-modal.js';
  import { showToast } from './ui-feedback.js';
  import { guessCategory } from './state.js';

  // Module-level state — one scanner active at a time
  let _stream = null;
  let _reader = null;

  // ── UI helpers ─────────────────────────────────────────────────────────────

  function setStatus(text) {
    const el = document.getElementById('scanner-status');
    if (el) el.textContent = text;
  }

  function setCamLabel(text) {
    const el = document.getElementById('scanner-cam-label');
    if (el) el.textContent = text;
  }

  function setScanLine(visible) {
    document.getElementById('scanner-line')?.classList.toggle('hidden', !visible);
  }

  function isIsbn13(code) {
    return /^(978|979)\d{10}$/.test(code);
  }

  // ── Close / cleanup ────────────────────────────────────────────────────────

  export function closeScannerModal() {
    if (_reader) {
      try { _reader.reset(); } catch (_) {}
      _reader = null;
    }
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop());
      _stream = null;
    }
    const video = document.getElementById('scanner-video');
    if (video) video.srcObject = null;
    document.getElementById('scanner-modal').style.display = 'none';
  }

  // ── Open ───────────────────────────────────────────────────────────────────

  export function openScannerModal() {
    setStatus('▸ REQUESTING CAMERA...');
    setCamLabel('INITIALISING');
    setScanLine(false);
    document.getElementById('scanner-isbn-input').value = '';
    document.getElementById('scanner-modal').style.display = 'flex';

    document.getElementById('close-scanner-modal').onclick = closeScannerModal;

    document.getElementById('scanner-go-btn').onclick = () => {
      const raw = document.getElementById('scanner-isbn-input').value.trim();
      handleManualIsbn(raw);
    };

    document.getElementById('scanner-isbn-input').onkeydown = e => {
      if (e.key === 'Enter') {
        const raw = document.getElementById('scanner-isbn-input').value.trim();
        handleManualIsbn(raw);
      }
    };

    startCamera();
  }

  // ── Manual entry ───────────────────────────────────────────────────────────

  function handleManualIsbn(raw) {
    // Strip hyphens/spaces — users sometimes paste formatted ISBNs like 978-0-345-39180-3
    const code = raw.replace(/[\s-]/g, '');
    if (!isIsbn13(code)) {
      setStatus('✕ ENTER A VALID 13-DIGIT ISBN');
      return;
    }
    handleIsbn(code);
  }

  // ── Camera + ZXing ────────────────────────────────────────────────────────

  async function startCamera() {
    const video = document.getElementById('scanner-video');
    try {
      _reader = new ZXingBrowser.BrowserMultiFormatReader();

      // undefined deviceId = browser picks rear/environment camera
      await _reader.decodeFromVideoDevice(undefined, video, (result, _err) => {
        if (!result) return; // NotFoundException fires every frame with no barcode — ignore
        const code = result.getText();
        if (!isIsbn13(code)) return; // ignore non-ISBN-13 EAN codes

        // Stop scanning immediately — avoid duplicate handleIsbn calls
        _reader.reset();
        _reader = null;
        handleIsbn(code);
      });

      setStatus('▸ SCANNING FOR BARCODE...');
      setCamLabel('CAMERA ACTIVE');
      setScanLine(true);

    } catch (_err) {
      setScanLine(false);
      setStatus('CAMERA UNAVAILABLE — enter ISBN manually');
      setCamLabel('NO CAMERA');
    }
  }

  async function handleIsbn(isbn) {
    setScanLine(false);
    setStatus('✓ FETCHING BOOK DATA...');
    setCamLabel('LOOKING UP');

    try {
      const prefill = await fetchBookByIsbn(isbn);
      closeScannerModal();
      openFormModal(null, prefill);
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        setStatus('ISBN NOT FOUND — try manual entry');
        setCamLabel('NOT FOUND');
        // Restart camera for another scan attempt
        startCamera();
      } else {
        showToast('Network error — check connection', 'delete');
        setStatus('▸ SCANNING FOR BARCODE...');
        setScanLine(true);
      }
    }
  }

  // ── Open Library fetch ────────────────────────────────────────────────────

  async function fetchBookByIsbn(isbn) {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (res.status === 404) throw new Error('NOT_FOUND');
    if (!res.ok) throw new Error('NETWORK');
    const data = await res.json();

    let authorName = '';
    const authorKey = data.authors?.[0]?.key;
    if (authorKey) {
      try {
        const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (aRes.ok) {
          const aData = await aRes.json();
          authorName = aData.name ?? '';
        }
      } catch (_) {
        // Author lookup failed — continue without author name
      }
    }

    return buildPrefill(data, authorName);
  }

  function buildPrefill(data, authorName) {
    // description may be a plain string or { value: "..." } object
    const rawDesc = data.description;
    const synopsis = typeof rawDesc === 'string' ? rawDesc : (rawDesc?.value ?? '');

    const subjects = Array.isArray(data.subjects) ? data.subjects : [];
    const category = guessCategory(subjects) ?? 'Other';

    const prefill = {};
    if (data.title)           prefill.title    = data.title;
    if (authorName)           prefill.author   = authorName;
    if (data.number_of_pages) prefill.pages    = data.number_of_pages;
    if (data.covers?.[0])     prefill.coverId  = data.covers[0];
    if (synopsis)             prefill.synopsis = synopsis;
    if (category)             prefill.category = category;
    return prefill;
  }
  ```

- [ ] **Step 2: Verify module loads without errors**

  Temporarily add to top of `js/app-ui.js` imports:
  ```js
  import { openScannerModal, closeScannerModal } from './ui-scanner.js';
  ```

  Reload `index.html`. DevTools console: zero import errors.
  Leave this import in place for Task 5.

- [ ] **Step 3: Test Open Library fetch directly**

  In DevTools console (Hitchhiker's Guide — ISBN 9780345391803):
  ```js
  const r = await fetch('https://openlibrary.org/isbn/9780345391803.json');
  const d = await r.json();
  console.log(d.title, d.number_of_pages, d.covers?.[0], d.authors?.[0]?.key);
  ```

  Expected: `The Hitchhiker's Guide to the Galaxy  193  <number>  /authors/OL26320A`

- [ ] **Step 4: Commit**

  ```bash
  git add js/ui-scanner.js
  git commit -m "feat: ui-scanner.js — camera, ZXing loop, Open Library fetch, prefill handoff"
  ```

---

## Task 4: Update openFormModal() to accept prefill data

**Files:**
- Modify: `js/ui-form-modal.js`

- [ ] **Step 1: Change function signature**

  Find:
  ```js
  export function openFormModal(bookId = null) {
  ```

  Change to:
  ```js
  export function openFormModal(bookId = null, prefill = null) {
  ```

- [ ] **Step 2: Apply prefill after form renders**

  Inside `openFormModal`, find the line where `content.innerHTML = ...` is set (large template literal). Add this block immediately after the `content.innerHTML = ...` assignment:

  ```js
  // Populate fields from ISBN scan data (new book only)
  if (!bookId && prefill) {
    if (prefill.title)    document.getElementById('f-title').value    = prefill.title;
    if (prefill.author)   document.getElementById('f-author').value   = prefill.author;
    if (prefill.pages)    document.getElementById('f-pages').value    = prefill.pages;
    if (prefill.synopsis) document.getElementById('f-synopsis').value = prefill.synopsis;
    if (prefill.coverId)  document.getElementById('f-cover-id').value = prefill.coverId;
    if (prefill.category) {
      const sel = document.getElementById('f-category');
      const match = [...sel.options].find(o => o.value === prefill.category);
      if (match) sel.value = prefill.category;
    }
  }
  ```

- [ ] **Step 3: Verify in DevTools console**

  ```js
  const { openFormModal } = await import('./js/ui-form-modal.js');
  openFormModal(null, {
    title: 'Test Book',
    author: 'Test Author',
    pages: 300,
    category: 'Science'
  });
  ```

  Expected: Add Book form opens with all four fields pre-populated. Category select shows "Science".

- [ ] **Step 4: Commit**

  ```bash
  git add js/ui-form-modal.js
  git commit -m "feat: openFormModal accepts optional prefill param for ISBN scan handoff"
  ```

---

## Task 5: Wire scan button in app-ui.js + Escape/overlay close

**Files:**
- Modify: `js/app-ui.js`

- [ ] **Step 1: Confirm import exists**

  Verify this is in the import block at the top of `js/app-ui.js` (added in Task 3 Step 2):
  ```js
  import { openScannerModal, closeScannerModal } from './ui-scanner.js';
  ```

  If missing, add it now.

- [ ] **Step 2: Wire button click in initApp()**

  Find:
  ```js
  document.getElementById('add-book-btn').addEventListener('click', () => openFormModal());
  ```

  Add immediately after:
  ```js
  document.getElementById('scan-isbn-btn').addEventListener('click', openScannerModal);
  ```

- [ ] **Step 3: Add closeScannerModal to Escape handler**

  Find the `keydown` Escape block and add `closeScannerModal()`:

  ```js
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeFormModal();
      closeScannerModal();
      closePreviewModal();
      closeListsPanel();
      closeRecsPanel();
      closeDonatePanel();
      closeStatsPanel();
      closeWrappedModal();
    }
  });
  ```

- [ ] **Step 4: Add closeScannerModal to overlay click handler**

  Find the `modal-overlay` click handler and add `closeScannerModal()`:

  ```js
  document.getElementById('modal-overlay').addEventListener('click', () => {
    closeModal();
    closeFormModal();
    closeScannerModal();
    closePreviewModal();
    closeListsPanel();
    closeRecsPanel();
    closeDonatePanel();
    closeStatsPanel();
    closeWrappedPanel();
  });
  ```

- [ ] **Step 5: Full end-to-end test**

  Reload `index.html`. Test every scenario:

  1. Click `⊞ SCAN ISBN` → modal opens, browser prompts for camera
  2. Grant permission → video feed appears, scan line animates, footer: "CAMERA ACTIVE"
  3. Point camera at ISBN-13 barcode → Add Book form opens pre-filled
  4. Save → book appears in grid ✓
  5. Open scanner → press `Escape` → modal closes, camera LED off ✓
  6. Open scanner → click `✕` → same ✓
  7. Open scanner → click backdrop → same ✓
  8. Type `9780345391803` → GO → form pre-fills with Hitchhiker's Guide ✓
  9. Type `978-0-345-39180-3` (hyphenated) → GO → same result ✓
  10. Type `9789999999999` → GO → "ISBN NOT FOUND" shown ✓
  11. Deny camera permission → "CAMERA UNAVAILABLE", manual input works ✓
  12. Open scanner twice in session → no errors ✓

- [ ] **Step 6: Commit**

  ```bash
  git add js/app-ui.js
  git commit -m "feat: wire SCAN ISBN button + closeScannerModal in Escape and overlay handlers"
  ```
