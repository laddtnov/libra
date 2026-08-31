// Static dev server that sends the same headers as production.
//
// `npx serve` sends no Content-Security-Policy, so every CSP-blocked feature
// worked perfectly in local development and was dead on the live site. That gap
// shipped four separate bugs: the service worker never registered, password
// reset links opened the normal app, cover-image fallbacks never ran, and most
// book covers were refused because covers.openlibrary.org redirects to
// archive.org and CSP checks every hop of a redirect chain.
//
// So the headers here are not a copy — they are read out of vercel.json at
// startup, which is the only way they cannot drift from what production sends.
//
// Run: npm run dev

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 3847;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt':  'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// Vercel's `source` is a path pattern, not a regex. Only `/(.*)` — match
// everything — is in use, so support exactly that and refuse to guess at
// anything else rather than silently applying the wrong headers.
async function loadProductionHeaders() {
  const config = JSON.parse(await readFile(join(ROOT, 'vercel.json'), 'utf8'));
  const headers = [];

  for (const rule of config.headers ?? []) {
    if (rule.source !== '/(.*)') {
      console.warn(
        `[dev] vercel.json has a header rule for "${rule.source}" that this server ` +
        `does not know how to match. Those headers are NOT being sent — local and ` +
        `production now differ, which is the exact gap this server exists to close.`
      );
      continue;
    }
    for (const { key, value } of rule.headers ?? []) headers.push([key, value]);
  }

  return headers;
}

// Mirrors api/config.js, which Vercel runs as a serverless function. Without
// this the app cannot reach Supabase locally and half the surface is untestable.
function serveApiConfig(res) {
  res.setHeader('Content-Type', MIME['.json']);
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    supabaseUrl:  process.env.SUPABASE_URL      || '',
    supabaseAnon: process.env.SUPABASE_ANON_KEY || '',
  }));
}

async function resolveFile(urlPath) {
  // Strip the query, decode, and normalize before the traversal check — a raw
  // "..%2f" would otherwise walk out of ROOT once decoded.
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const candidate = join(ROOT, relative);

  if (candidate !== ROOT.replace(/[/\\]$/, '') && !candidate.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    return null;
  }

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const index = join(candidate, 'index.html');
      await stat(index);
      return index;
    }
    return candidate;
  } catch {
    return null;
  }
}

const productionHeaders = await loadProductionHeaders();

const server = createServer(async (req, res) => {
  for (const [key, value] of productionHeaders) res.setHeader(key, value);

  if (req.url.split('?')[0] === '/api/config') return serveApiConfig(res);

  const file = await resolveFile(req.url);
  if (!file) {
    res.statusCode = 404;
    res.setHeader('Content-Type', MIME['.html']);
    res.end('<h1>404</h1>');
    return;
  }

  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    // No caching: a stale asset behind a service worker is its own debugging
    // rabbit hole, and this only ever serves one developer.
    res.setHeader('Cache-Control', 'no-store');
    res.end(body);
  } catch {
    res.statusCode = 500;
    res.end('read error');
  }
});

server.listen(PORT, () => {
  const hasCsp = productionHeaders.some(([k]) => k === 'Content-Security-Policy');
  console.log(`Libra dev server  http://localhost:${PORT}`);
  console.log(`Sending ${productionHeaders.length} production headers from vercel.json`);
  if (!hasCsp) {
    console.warn('[dev] No Content-Security-Policy found in vercel.json — local will not match production.');
  }
});
