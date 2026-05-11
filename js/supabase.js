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

// Use implicit flow so password-reset links contain #type=recovery in the hash —
// detectable synchronously before any async code runs.
export const supabase = globalThis.supabase.createClient(url, anon, {
  auth: { flowType: 'implicit' },
});
