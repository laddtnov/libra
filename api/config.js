const ALLOWED_ORIGINS = new Set([
  'https://libra-book-tracker.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean));

export default function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.json({
    supabaseUrl:  process.env.SUPABASE_URL        || '',
    supabaseAnon: process.env.SUPABASE_ANON_KEY   || '',
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY  || '',
  });
}
