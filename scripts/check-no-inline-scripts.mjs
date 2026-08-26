// The CSP is `script-src 'self'` with no unsafe-inline, so an inline <script>
// or an on*= handler is dead code in production: the browser blocks it and the
// page carries on as if the code were never written. That is exactly how the
// service worker went unregistered and password-reset links stopped opening the
// reset screen — silently, for months. Catch it here instead of in a console.
import { readFileSync } from 'node:fs';

const FILES = ['index.html'];
const problems = [];

for (const file of FILES) {
  const html = readFileSync(file, 'utf8');

  // A <script> tag carrying a body but no src attribute.
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi)) {
    const [, attrs, body] = match;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (!body.trim()) continue;
    const line = html.slice(0, match.index).split('\n').length;
    problems.push({ file, line, what: 'inline <script>', fix: 'move the code into a file under js/ and load it with src' });
  }

  // An on*= attribute on any element.
  for (const match of html.matchAll(/<[a-z][^>]*?\s(on[a-z]+)\s*=/gi)) {
    const line = html.slice(0, match.index).split('\n').length;
    problems.push({ file, line, what: `inline ${match[1]}= handler`, fix: 'bind it with addEventListener instead' });
  }
}

if (problems.length) {
  for (const p of problems) {
    console.log(`::error file=${p.file},line=${p.line}::${p.what} — the CSP blocks it. Fix: ${p.fix}.`);
  }
  process.exit(1);
}

console.log(`No inline scripts or handlers in ${FILES.join(', ')}.`);
