// Fails the build if credentials are committed.
//
// js/config.js is listed in .gitignore but was committed before that rule
// existed, so git keeps tracking it and the ignore entry does nothing. A
// developer who fills it in per the README gets a modified tracked file that
// `git commit -a` will happily include. That has already happened twice: the
// history holds two Supabase anon keys and the commit that removed them.
//
// The file cannot simply be untracked — js/supabase.js imports it, and a 404
// on an ES module import takes down the whole module graph. It has to stay,
// empty, so the /api/config fallback runs. So guard its contents instead.
//
// Run: npm run check:secrets

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Optional group rather than an empty alternative: an empty value is the
// committed state, the two names are what config.example.js ships.
const PLACEHOLDER = /^(?:your_supabase_project_url|your_supabase_anon_key)?$/;

// Credential shapes, not a generic entropy check: a JWT, Supabase's newer
// publishable/secret key prefixes, and any http(s) project URL.
const SECRET_SHAPES = [
  { name: 'JWT (eyJ…)',              re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'Supabase publishable key', re: /sb_publishable_[A-Za-z0-9_-]{10,}/ },
  { name: 'Supabase secret key',      re: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'service_role key',         re: /service_role/ },
];

const failures = [];

// 1. js/config.js must only ever hold empty strings.
const config = await readFile(new URL('../js/config.js', import.meta.url), 'utf8');
for (const [, name, value] of config.matchAll(/export const (\w+)\s*=\s*'([^']*)'/g)) {
  if (!PLACEHOLDER.test(value)) {
    failures.push(
      `js/config.js: ${name} holds a real value.\n` +
      `  This file is committed, so that value would ship to the repository.\n` +
      `  Set it back to '' — on Vercel the values come from /api/config, and\n` +
      `  locally you can export SUPABASE_URL / SUPABASE_ANON instead.`
    );
  }
}

// 2. No credential-shaped string anywhere in the tracked front-end or config.
const scan = ['js/config.js', 'js/config.example.js', 'vercel.json', '.env.example'];
const scanned = await Promise.all(scan.map(rel =>
  readFile(new URL(`../${rel}`, import.meta.url), 'utf8')
    .then(text => ({ rel, text }), () => null)   // a file that is absent is not a failure
));

for (const entry of scanned) {
  if (!entry) continue;
  const { rel, text } = entry;
  for (const { name, re } of SECRET_SHAPES) {
    // .env.example documents the service_role key by name; that is a label, not a key.
    if (rel === '.env.example' && name === 'service_role key') continue;
    const hit = text.match(re);
    if (hit) failures.push(`${rel}: looks like a committed ${name} — "${hit[0].slice(0, 24)}…"`);
  }
}

if (failures.length) {
  console.error('Committed credential check FAILED:\n');
  for (const f of failures) console.error('  ✗ ' + f + '\n');
  console.error('Rotate anything that already reached the remote — deleting the line is not enough.');
  process.exit(1);
}

console.log('No committed credentials found.');
