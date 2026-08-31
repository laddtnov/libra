// Reading-progress and record-integrity tests.
//
// Every case here is a bug that actually shipped. The session-log bugs went
// unnoticed for an unknown stretch because nothing exercised this logic outside
// a browser — so the point of these is less "prove it works today" than "fail
// loudly the next time someone makes the session log authoritative again".
//
// Run: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';

// state.js calls loadBooks() at module scope, which reads localStorage. Stub it
// before importing rather than restructuring the module to suit the test.
globalThis.localStorage = {
  store: new Map(),
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; },
  setItem(k, v) { this.store.set(k, String(v)); },
  removeItem(k) { this.store.delete(k); },
};

const {
  sessionPages,
  anchorPageBaseline,
  syncProgress,
  carryOverUneditedFields,
  normalizeBooks,
} = await import('../js/state.js');

// ── sessionPages ──────────────────────────────────────────────────────────────

test('sessionPages sums the log and tolerates junk entries', () => {
  assert.equal(sessionPages({ sessions: [{ pages: 10 }, { pages: 15 }] }), 25);
  assert.equal(sessionPages({}), 0);
  assert.equal(sessionPages(null), 0);
  // A malformed session must not turn the total into NaN and wipe the page.
  assert.equal(sessionPages({ sessions: [{ pages: 10 }, { pages: 'x' }] }), 10);
});

// ── The reported bug ──────────────────────────────────────────────────────────

test('logging a session adds to the page you were already on', () => {
  // Reported: 260 pages into a book, log 10, and it showed page 10.
  const book = { pages: 400, currentPage: 260, sessions: [] };

  anchorPageBaseline(book);
  book.sessions.push({ date: '2026-08-31', pages: 10 });
  syncProgress(book);

  assert.equal(book.currentPage, 270);
  assert.equal(book.pageBaseline, 260);
  assert.equal(book.progress, 68);
});

test('deleting a session returns you to where you were, not to zero', () => {
  const book = { pages: 400, currentPage: 260, sessions: [] };
  anchorPageBaseline(book);
  book.sessions.push({ pages: 10 });
  syncProgress(book);

  book.sessions.pop();
  syncProgress(book);

  assert.equal(book.currentPage, 260);
  assert.equal(book.progress, 65);
});

test('a book tracked only by sessions is unaffected — anchors at zero', () => {
  // The pre-existing shape: every page came from the log, so the baseline is 0
  // and behaviour must be identical to before pageBaseline existed.
  const book = { pages: 400, currentPage: 25, sessions: [{ pages: 10 }, { pages: 15 }] };

  anchorPageBaseline(book);
  assert.equal(book.pageBaseline, 0);

  book.sessions.push({ pages: 20 });
  syncProgress(book);
  assert.equal(book.currentPage, 45);
});

test('a session past the last page clamps instead of reading 440/400', () => {
  const book = { pages: 400, currentPage: 390, sessions: [] };
  anchorPageBaseline(book);
  book.sessions.push({ pages: 50 });
  syncProgress(book);

  assert.equal(book.currentPage, 400);
  assert.equal(book.progress, 100);
});

test('a book with no page count still tracks an absolute page', () => {
  const book = { currentPage: 40, sessions: [] };
  anchorPageBaseline(book);
  book.sessions.push({ pages: 10 });
  syncProgress(book);

  assert.equal(book.currentPage, 50);
  assert.equal(book.progress, 0); // no total, so no meaningful percentage
});

// ── The data-loss bug ─────────────────────────────────────────────────────────

test('editing a book keeps the session log and quotes the form cannot edit', () => {
  // Saving the edit form replaced the whole record, so pressing UPDATE RECORD
  // without changing anything destroyed the reading history.
  const previous = {
    title: 'A', sessions: [{ pages: 10 }, { pages: 15 }], quotes: [{ text: 'q', page: 1 }],
  };
  const fromForm = { title: 'A (edited)', currentPage: 285, pages: 400 };

  carryOverUneditedFields(fromForm, previous);

  assert.equal(fromForm.sessions.length, 2);
  assert.equal(fromForm.quotes.length, 1);
  assert.equal(fromForm.title, 'A (edited)'); // the form still wins where it owns the field
});

test('carrying over is safe for a new book with no previous record', () => {
  const fresh = { title: 'New' };
  carryOverUneditedFields(fresh, null);
  assert.equal(fresh.sessions, undefined);
  assert.equal(fresh.quotes, undefined);
});

test('a manual page edit re-anchors so the log keeps counting from it', () => {
  const book = {
    pages: 400, currentPage: 300, sessions: [{ pages: 10 }, { pages: 15 }],
  };
  anchorPageBaseline(book); // what saveBook does after the form sets the page

  assert.equal(book.pageBaseline, 275); // 300 typed, 25 already logged

  book.sessions.push({ pages: 20 });
  syncProgress(book);
  assert.equal(book.currentPage, 320);
});

// ── The whitelist ─────────────────────────────────────────────────────────────

test('the baseline survives an import or cloud sync', () => {
  // normalizeBooks is a whitelist and runs on every import and sync. An
  // unlisted pageBaseline is silently dropped, which resets it to 0 and brings
  // the original bug back on the next device.
  const synced = normalizeBooks({
    b: {
      title: 'T', author: 'A', status: 'reading',
      pages: 400, currentPage: 285, pageBaseline: 260,
      sessions: [{ date: '2026-08-30', pages: 25 }],
    },
  });

  assert.equal(synced.b.pageBaseline, 260);
  assert.equal(synced.b.currentPage, 285);
});

test('a book that never had a baseline stays unanchored, not zeroed', () => {
  // 0 would claim "started logging from page 1", so the first session on an
  // imported book would throw its progress away — the original bug.
  const imported = normalizeBooks({
    b: { title: 'T', author: 'A', status: 'reading', pages: 400, currentPage: 260 },
  });

  assert.equal('pageBaseline' in imported.b, false);

  // and the first session then derives the right anchor from the existing page
  const book = imported.b;
  book.sessions = [];
  anchorPageBaseline(book);
  book.sessions.push({ pages: 10 });
  syncProgress(book);
  assert.equal(book.currentPage, 270);
});

test('normalizeBooks still rejects a prototype-pollution key', () => {
  const polluted = JSON.parse('{"__proto__": {"pwned": true}, "ok": {"title":"T","author":"A"}}');
  const clean = normalizeBooks(polluted);

  assert.equal({}.pwned, undefined);
  assert.equal(clean.ok.title, 'T');
});
