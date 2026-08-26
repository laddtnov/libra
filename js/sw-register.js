// External rather than inline: the CSP is script-src 'self' with no
// unsafe-inline, so as an inline block this never ran in production — the
// service worker was registered only on hosts that send no CSP header.
if ('serviceWorker' in navigator) {
  globalThis.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('Service worker registration failed.', error);
    });
  });
}
