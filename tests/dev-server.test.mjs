// Dev-server exposure tests.
//
// The dev server's root is the repository, so .env and .git sit next to the
// site. It also bound every interface, which put both on the local network.
// These cases pin the two properties that keep a dev tool on the dev machine.
//
// Run: npm test

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile, unlink } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 3988;
const ENV_PROBE = new URL('../.env', import.meta.url);

let server;

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${PORT}/index.html`); return; }
    catch { await new Promise(r => setTimeout(r, 100)); }
  }
  throw new Error('dev server did not start');
}

before(async () => {
  // A stand-in .env — the real risk is a developer's actual secrets file.
  await writeFile(ENV_PROBE, 'SUPABASE_SERVICE_KEY=test_only_not_a_real_key\n');
  server = spawn(process.execPath, ['scripts/dev-server.mjs'], {
    cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore',
  });
  await waitForServer();
});

after(async () => {
  server?.kill();
  await unlink(ENV_PROBE).catch(() => {});
});

test('does not serve .env', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/.env`);
  assert.equal(res.status, 404);
  assert.ok(!(await res.text()).includes('SUPABASE_SERVICE_KEY'));
});

test('does not serve the .git directory', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/.git/config`);
  assert.equal(res.status, 404);
});

test('does not serve a dotfile nested below the root', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/js/../.env`);
  assert.equal(res.status, 404);
});

test('binds loopback only, not the local network', async () => {
  const lan = Object.values(networkInterfaces()).flat()
    .find(i => i && i.family === 'IPv4' && !i.internal)?.address;

  if (!lan) return; // nothing to assert on a host with no LAN interface

  await assert.rejects(
    fetch(`http://${lan}:${PORT}/index.html`, { signal: AbortSignal.timeout(3000) }),
    'dev server answered on the LAN address — it should bind 127.0.0.1 only',
  );
});

test('still serves the site itself', async () => {
  const res = await fetch(`http://127.0.0.1:${PORT}/index.html`);
  assert.equal(res.status, 200);
  // and still with production headers, which is the point of this server
  assert.match(res.headers.get('content-security-policy') ?? '', /default-src 'none'/);
});
