# M1 — ISBN Barcode Scanner

**Date:** 2026-05-20
**Status:** Approved
**Milestone:** M1

---

## Overview

Add a camera-based ISBN barcode scanner to Libra. Clicking `⊞ SCAN ISBN` in the main toolbar opens a compact modal with a live camera viewfinder. When a barcode is detected, the scanner fetches book data from Open Library and opens the existing Add Book form pre-filled — user reviews and saves as normal.

---

## Architecture

### New file
- `js/ui-scanner.js` — modal lifecycle, camera stream, ZXing scanning loop, Open Library fetch, prefill handoff

### Modified files
- `index.html` — add `⊞ SCAN ISBN` toolbar button + ZXing CDN `<script>` tag
- `js/app-ui.js` — wire button click → `openScannerModal()`
- `js/ui-form-modal.js` — add optional `prefill` param to `openFormModal()` to accept ISBN scan data

### Data flow
```
toolbar btn click
  → openScannerModal()           [ui-scanner.js]
  → getUserMedia (camera stream)
  → ZXing BrowserMultiFormatReader scans frames (EAN_13 only)
  → ISBN-13 detected
  → fetch openlibrary.org/isbn/{isbn}.json
  → if author key present: fetch openlibrary.org/authors/{key}.json
  → map fields → prefill object
  → closeScanner() — stop stream + reset ZXing reader
  → openFormModal({ prefill })   [ui-form-modal.js]
  → user reviews pre-filled form → saves normally
```

### ZXing loading
Loaded from jsDelivr CDN as a single UMD script — no bundler required, consistent with Libra's vendor approach:
```html
<script src="https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js"></script>
```

---

## Scanner Modal

### Structure
```
┌─ ⊞ ISBN SCANNER ─────────── [ ✕ ] ─┐
│  ┌─────────────────────────────────┐ │
│  │  [camera viewfinder]            │ │
│  │    corner bracket overlays      │ │
│  │    animated cyan scan line      │ │
│  │  ▸ SCANNING FOR BARCODE...      │ │
│  └─────────────────────────────────┘ │
│  ISBN: [________________] [ GO ]     │
│  CAMERA ACTIVE          OPEN LIBRARY │
└──────────────────────────────────────┘
```

### Camera states

| State | Display |
|---|---|
| `requesting` | "▸ REQUESTING CAMERA…" |
| `scanning` | Live video + animated scan line |
| `found` | Camera freezes, "✓ FETCHING BOOK DATA…" |
| `denied` | "CAMERA UNAVAILABLE" + manual input only |

### Camera lifecycle rules
- Stream starts immediately when modal opens
- On ISBN detected: `stream.getTracks().forEach(t => t.stop())` + `reader.reset()`
- On modal close (`✕` or `Escape`): same cleanup — no stream leak
- ZXing format filter: `['EAN_13']` only — avoids false triggers from non-book barcodes

---

## Open Library ISBN Lookup

**Endpoint:** `https://openlibrary.org/isbn/{isbn}.json`

### Field mapping

| Open Library | Libra field | Notes |
|---|---|---|
| `title` | `title` | direct |
| `authors[0]` → `/authors/{key}.json` → `name` | `author` | requires 2nd fetch |
| `number_of_pages` | `pages` | optional |
| `covers[0]` | `coverId` | numeric ID, already supported |
| `description` | `synopsis` | may be `{value:"…"}` object or plain string — normalise both |
| `subjects` | `category` | passed to existing `guessCategory()` from `state.js` |

### Two-fetch strategy
```js
const book = await fetch(`/isbn/${isbn}.json`).then(r => r.json());
const authorKey = book.authors?.[0]?.key;
const authorName = authorKey
  ? await fetch(`https://openlibrary.org${authorKey}.json`).then(r => r.json()).then(a => a.name)
  : '';
```

---

## Error Handling

| Scenario | User sees | Recovery |
|---|---|---|
| Camera permission denied | "CAMERA UNAVAILABLE", manual input active | Type/paste ISBN → GO |
| Camera not present | Same as above | Manual input |
| ISBN 404 from Open Library | "ISBN NOT FOUND — try manual entry", scan line restarts | Rescan or type ISBN |
| Author fetch fails | Form opens without author pre-filled | User fills it in |
| Network error | `showToast()` error, modal stays open | User retries or closes |
| Duplicate book | Existing dupe-detection in `openFormModal()` handles it | Already built |
| Non-ISBN EAN-13 barcode | Silently ignored — EAN_13 filter catches format, ISBN check rejects non-978/979 prefix | Auto-continues scanning |

---

## Testing Checklist

### Happy path
- [ ] Click `⊞ SCAN ISBN` → modal opens, camera activates within 2s
- [ ] Point camera at ISBN-13 barcode → book detected, form opens pre-filled
- [ ] Pre-filled form: correct title, author, pages, cover
- [ ] Save → book appears in grid normally

### Fallbacks
- [ ] Deny camera permission → "CAMERA UNAVAILABLE", manual input works
- [ ] Type valid ISBN manually → GO → form pre-fills correctly
- [ ] Type unknown ISBN → "ISBN NOT FOUND", can retry

### Edge cases
- [ ] Close modal with `✕` → camera LED off, no stream leak
- [ ] Close modal with `Escape` → same
- [ ] Open scanner twice in same session → no errors
- [ ] Scan non-book EAN-13 barcode → no false trigger
- [ ] Book with no author in Open Library → form opens, author field empty

### Cross-device
- [ ] Mobile Chrome (Android) — primary scan target
- [ ] Mobile Safari (iOS 17+) — camera + ZXing work
- [ ] Desktop Chrome — manual ISBN input as primary path
