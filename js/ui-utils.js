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

export function trapFocus(container) {
  function handler(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !container.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
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
