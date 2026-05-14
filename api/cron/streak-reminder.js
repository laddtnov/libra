import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // Vercel cron sends GET; protect with CRON_SECRET
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Fetch all push subscriptions
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  const today     = new Date().toISOString().split('T')[0];
  let sent = 0, skipped = 0;

  for (const sub of subs ?? []) {
    // Check if user already logged a session today
    const { data: userData } = await supabase
      .from('user_books')
      .select('data')
      .eq('user_id', sub.user_id)
      .single();

    const books    = userData?.data ?? {};
    const loggedToday = Object.values(books).some(book =>
      (book.sessions ?? []).some(s => s.date === today)
    );

    if (loggedToday) { skipped++; continue; }

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: '📖 Libra — Keep your streak alive!',
          body:  "You haven't logged a reading session today. Don't break the chain!",
          icon:  '/assets/icons/icon.svg',
          url:   '/',
        })
      );
      sent++;
    } catch (e) {
      // Remove invalid subscriptions (410 Gone)
      if (e.statusCode === 410) {
        await supabase.from('push_subscriptions')
          .delete().eq('endpoint', sub.endpoint);
      }
    }
  }

  return res.status(200).json({ sent, skipped });
}
