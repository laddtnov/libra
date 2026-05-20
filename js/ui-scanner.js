import { openFormModal } from './ui-form-modal.js';
import { showToast } from './ui-feedback.js';
import { guessCategory } from './state.js';

// Module-level state — one scanner active at a time
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

// Calls reader.reset(), logging rather than silently swallowing if it throws
// (e.g. stream already closed by the browser before cleanup runs).
function tryResetReader(reader) {
  try {
    reader.reset();
  } catch (err) {
    console.warn('ZXing reader reset failed:', err);
  }
}

// ── Close / cleanup ────────────────────────────────────────────────────────

export function closeScannerModal() {
  if (_reader) {
    tryResetReader(_reader);
    _reader = null;
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
    const reader = new ZXingBrowser.BrowserMultiFormatReader();
    _reader = reader;

    // ideal facingMode requests rear camera on mobile, falls back to any camera on desktop
    await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      video,
      (result, _err) => {
        if (_reader === null) return; // modal was closed during camera init
        if (!result) return; // NotFoundException fires every frame with no barcode — ignore
        const code = result.getText();
        if (!isIsbn13(code)) return; // ignore non-ISBN-13 EAN codes

        // Stop scanning immediately — avoid duplicate handleIsbn calls
        _reader.reset();
        _reader = null;
        handleIsbn(code);
      });

    // If modal was closed while camera was initialising, clean up and bail
    if (_reader === null) {
      tryResetReader(reader);
      return;
    }

    setStatus('▸ SCANNING FOR BARCODE...');
    setCamLabel('CAMERA ACTIVE');
    setScanLine(true);

  } catch (err) {
    console.warn('Camera unavailable:', err);
    setScanLine(false);
    setStatus('CAMERA UNAVAILABLE — enter ISBN manually');
    setCamLabel('NO CAMERA');
  }
}

function resetReaderAndRestartCamera() {
  if (_reader) {
    tryResetReader(_reader);
    _reader = null;
  }
  startCamera();
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
    } else {
      showToast('Network error — check connection', 'delete');
      setStatus('▸ SCANNING FOR BARCODE...');
    }
    resetReaderAndRestartCamera();
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
  if (authorKey && /^\/authors\/OL\w+A$/.test(authorKey)) {
    try {
      const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (aRes.ok) {
        const aData = await aRes.json();
        authorName = aData.name ?? '';
      }
    } catch (err) {
      console.warn('Author lookup failed:', err);
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
