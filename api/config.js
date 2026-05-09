export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({
    supabaseUrl:  process.env.SUPABASE_URL       || '',
    supabaseAnon: process.env.SUPABASE_ANON_KEY  || '',
  });
}
