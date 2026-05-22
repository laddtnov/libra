// Proxy for Anthropic API calls — keeps the browser from needing
// anthropic-dangerous-direct-browser-access and tightens CSP connect-src to 'self'.
// The user's key is theirs; we forward it server-side over HTTPS.

const rateMap = new Map();
const RATE_LIMIT    = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip) {
  const now  = Date.now();
  const hits = (rateMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  return false;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-claude-key');
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'rate_limited' });

  const apiKey = req.headers['x-claude-key'] ?? '';
  if (!apiKey.startsWith('sk-ant-')) {
    return res.status(400).json({ error: 'invalid_key' });
  }

  const { prompt, model = 'claude-haiku-4-5-20251001', max_tokens = 512 } = req.body ?? {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 8000) {
    return res.status(400).json({ error: 'invalid_prompt' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':          apiKey,
        'anthropic-version':  '2023-06-01',
        'content-type':       'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (upstream.status === 401) return res.status(401).json({ error: 'invalid_key' });
    if (!upstream.ok)           return res.status(502).json({ error: `upstream_${upstream.status}` });

    const data = await upstream.json();
    return res.status(200).json({ text: data.content[0].text.trim() });
  } catch {
    return res.status(502).json({ error: 'upstream_unreachable' });
  }
}
