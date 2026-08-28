// Shared accessibility utilities for modal/panel dialogs.
//
// trapFocus(container) — keeps Tab / Shift+Tab cycling inside `container`'s
// focusable elements while a modal is open. Returns a cleanup function that
// removes the listener; call it when the modal closes.
//
// focusFirst(container) — moves focus to the first focusable element inside
// the modal, falling back to the container itself.

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Only elements that are actually visible/interactive should participate.
function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    el => !el.disabled && el.offsetParent !== null && !el.hasAttribute('hidden')
  );
}

export function trapFocus(container, onEscape) {
  function handler(e) {
    if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);

    if (e.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last || !container.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

export function focusFirst(container) {
  const focusable = getFocusable(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    // Container needs tabindex to be programmatically focusable.
    if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
    container.focus();
  }
}

// Cover images used inline onerror handlers, which the CSP (script-src 'self',
// no unsafe-inline) has always blocked — the fallbacks never ran in production.
// One delegated listener replaces them. Capture phase: error does not bubble.
export function initCoverFallbacks() {
  document.addEventListener('error', event => applyCoverFallback(event.target), true);

  // A cover Open Library does not have is answered with a 1x1 GIF and HTTP 200,
  // not a 404 — no error event fires, so the image "loads" and renders as a
  // blank stretched pixel. Treat that sentinel as a failed load so those books
  // get the same placeholder as a book with no cover id at all.
  document.addEventListener('load', event => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.naturalWidth <= 1) applyCoverFallback(img);
  }, true);
}

function applyCoverFallback(img) {
  if (!(img instanceof HTMLImageElement) || !img.dataset.coverFallback) return;

  if (img.dataset.coverFallback === 'swap') {
    const placeholder = img.nextElementSibling;
    if (placeholder) placeholder.hidden = false;
  }
  img.remove();
}
