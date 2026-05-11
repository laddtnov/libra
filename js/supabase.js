import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

if (!globalThis.supabase) throw new Error('Supabase SDK not loaded');

// Local config used for dev; on Vercel fetch from /api/config when placeholders present
let url = SUPABASE_URL, anon = SUPABASE_ANON;

if (!url?.startsWith('http')) {
  try {
    const r = await fetch('/api/config');
    const cfg = await r.json();
    url  = cfg.supabaseUrl;
    anon = cfg.supabaseAnon;
  } catch { /* stay silent — auth will be skipped */ }
}

export const supabase = globalThis.supabase.createClient(url, anon);

// Catch PASSWORD_RECOVERY the instant the client processes the ?code= in the URL.
// This fires before app-ui.js has a chance to register its own listener.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    sessionStorage.setItem('libra-recovery-active', '1');
  }
});
