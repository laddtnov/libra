const CACHE = 'libra-v69';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/foundation.css',
  '/css/books.css',
  '/css/modal-shell.css',
  '/css/toolbar-and-empty.css',
  '/css/actions.css',
  '/css/form-modal.css',
  '/css/detail-modal.css',
  '/css/detail-panel.css',
  '/css/openlibrary-search.css',
  '/css/responsive.css',
  '/css/toast.css',
  '/css/sort.css',
  '/css/lists.css',
  '/css/recommendations.css',
  '/css/discover.css',
  '/css/lang-switcher.css',
  '/css/backup.css',
  '/css/quotes.css',
  '/css/sessions.css',
  '/css/availability.css',
  '/css/auth.css',
  '/css/goal.css',
  '/css/stats.css',
  '/css/theme-light.css',
  '/css/tags.css',
  '/js/app-ui.js',
  '/js/recovery-flag.js',
  '/js/sw-register.js',
  '/js/state.js',
  '/js/default-books.js',
  '/js/ui-render.js',
  '/js/ui-feedback.js',
  '/js/ui-detail-modal.js',
  '/js/ui-form-modal.js',
  '/js/ui-search.js',
  '/js/ui-lists.js',
  '/js/ui-bulk.js',
  '/js/ui-recommendations.js',
  '/js/ui-discover.js',
  '/js/ui-backup.js',
  '/js/ui-quotes.js',
  '/js/ui-notes.js',
  '/js/ui-sessions.js',
  '/js/ui-availability.js',
  '/js/i18n.js',
  '/js/vendor/supabase.min.js',
  '/js/supabase.js',
  '/js/auth.js',
  '/js/ui-auth.js',
  '/js/ui-goal.js',
  '/js/ui-reminders.js',
  '/js/ui-streak.js',
  '/js/ui-stats.js',
  '/js/ui-goodreads.js',
  '/js/ui-utils.js',
  '/assets/icons/libra-icon-16.png',
  '/assets/icons/libra-icon-32.png',
  '/assets/icons/libra-icon-48.png',
  '/assets/icons/libra-icon-192.png',
  '/assets/icons/libra-icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/fonts/orbitron-latin.woff2',
  '/assets/fonts/rajdhani-400-latin.woff2',
  '/assets/fonts/rajdhani-600-latin.woff2',
  '/assets/fonts/rajdhani-700-latin.woff2',
];

globalThis.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  globalThis.skipWaiting();
});

globalThis.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  globalThis.clients.claim();
});

globalThis.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Cross-origin: don't touch it. Re-issuing the request from here turns an
  // <img> load into a worker fetch(), which CSP judges under connect-src
  // instead of img-src — and connect-src does not list the cover host, so
  // every cover was blocked. Letting it through unhandled keeps the original
  // request type, and a failed cover already has an error-event fallback.
  if (!event.request.url.startsWith(self.location.origin)) return;

  // App shell — cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
