const ALLOWED_ORIGINS = new Set([
  'https://libra.laddtnov.xyz',
  'https://libra-book-tracker.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean));

export default function handler(req, res) {
  const origin = req.headers.origin || '';
  // Vary: the response body is origin-independent but this header is not, so a
  // shared cache must not reuse one origin's response for another.
  res.setHeader('Vary', 'Origin');
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.json({
    supabaseUrl:  process.env.SUPABASE_URL        || '',
    supabaseAnon: process.env.SUPABASE_ANON_KEY   || '',
  });
}
