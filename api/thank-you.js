function buildEmail(name) {
  const greeting = name ? `AGENT ${name.toUpperCase()}` : 'AGENT';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>[ LIBRA ] — Thank You</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Courier New',Courier,monospace;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d1a;min-height:100vh;">
  <tr>
    <td align="center" style="padding:48px 16px;">

      <table width="560" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;width:100%;background:#0a0a14;border:1px solid rgba(245,158,11,0.45);border-radius:10px;
                    box-shadow:0 0 40px rgba(245,158,11,0.12),0 0 80px rgba(245,158,11,0.05);">

        <!-- ── HEADER ── -->
        <tr>
          <td style="padding:32px 36px 24px;border-bottom:1px solid rgba(245,158,11,0.18);">
            <div style="font-size:10px;color:rgba(245,158,11,0.45);letter-spacing:4px;margin-bottom:10px;">
              LIBRA&nbsp;/&nbsp;SYSTEM&nbsp;TRANSMISSION
            </div>
            <div style="font-size:28px;font-weight:700;color:#f59e0b;letter-spacing:6px;
                        text-shadow:0 0 24px rgba(245,158,11,0.65);line-height:1.2;">
              [ THANK&nbsp;YOU ]
            </div>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:28px 36px 0;">

            <div style="font-size:10px;color:rgba(245,158,11,0.35);letter-spacing:2px;margin-bottom:22px;">
              &gt;&nbsp;INCOMING&nbsp;MESSAGE&nbsp;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;
            </div>

            <div style="font-size:15px;color:#e2e8f0;line-height:1.85;margin-bottom:20px;">
              <span style="color:#f59e0b;">${greeting}</span> &mdash;
            </div>

            <div style="font-size:14px;color:#cbd5e1;line-height:1.9;margin-bottom:18px;">
              Your support just hit the archive. Libra is free, open-source, and runs purely on coffee and the goodwill of readers like you.
            </div>

            <div style="font-size:14px;color:#cbd5e1;line-height:1.9;margin-bottom:28px;">
              Every contribution goes directly toward keeping the lights on and shipping new features &mdash; AI recommendations, reading streaks, cloud sync, and more.
            </div>

            <!-- glitch divider -->
            <div style="font-size:10px;color:rgba(245,158,11,0.3);letter-spacing:2px;margin-bottom:28px;">
              &#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;&#x2500;
            </div>

            <!-- stat boxes -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td width="48%" style="padding:14px 16px;background:#0d1117;border:1px solid rgba(245,158,11,0.2);border-radius:6px;text-align:center;">
                  <div style="font-size:9px;color:rgba(245,158,11,0.5);letter-spacing:2px;margin-bottom:6px;">STATUS</div>
                  <div style="font-size:13px;color:#00ff88;letter-spacing:1px;">&gt; SUPPORTER</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="padding:14px 16px;background:#0d1117;border:1px solid rgba(245,158,11,0.2);border-radius:6px;text-align:center;">
                  <div style="font-size:9px;color:rgba(245,158,11,0.5);letter-spacing:2px;margin-bottom:6px;">PROJECT</div>
                  <div style="font-size:13px;color:#f59e0b;letter-spacing:1px;">LIBRA&nbsp;v1</div>
                </td>
              </tr>
            </table>

            <div style="font-size:10px;color:rgba(245,158,11,0.35);letter-spacing:2px;margin-bottom:20px;">
              &gt;&nbsp;TRANSMISSION&nbsp;END&nbsp;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;&#x25A0;
            </div>

          </td>
        </tr>

        <!-- ── LINK ── -->
        <tr>
          <td style="padding:0 36px 28px;">
            <a href="https://libra.laddtnov.xyz"
               style="display:inline-block;padding:12px 24px;background:transparent;
                      border:1px solid rgba(245,158,11,0.5);border-radius:5px;
                      color:#f59e0b;font-family:'Courier New',monospace;font-size:11px;
                      font-weight:700;letter-spacing:2px;text-decoration:none;">
              &#x2197;&nbsp;OPEN&nbsp;LIBRA
            </a>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:18px 36px 24px;border-top:1px solid rgba(245,158,11,0.1);">
            <div style="font-size:9px;color:rgba(255,255,255,0.18);letter-spacing:1px;line-height:1.7;">
              You received this because you donated to Libra. No marketing, no further emails.<br>
              &copy; Libra &mdash; <a href="https://libra.laddtnov.xyz" style="color:rgba(245,158,11,0.35);text-decoration:none;">libra.laddtnov.xyz</a>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body ?? {};

  if (!email || !email.includes('@') || email.length > 320) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Libra <onboarding@resend.dev>',
        to: email,
        subject: '[ LIBRA ] — Thank you for your support',
        html: buildEmail(typeof name === 'string' ? name.slice(0, 80) : ''),
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error('Resend error:', body);
      return res.status(502).json({ error: 'Email delivery failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('thank-you handler:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
