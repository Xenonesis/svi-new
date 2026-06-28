/**
 * Server-side push notification sender.
 * Called when a new notification is created (lead, registration, etc.).
 *
 * Usage:
 *   import { sendPushToAll } from '@/src/lib/pwa/sendPush';
 *   await sendPushToAll({ title: 'New Lead', body: '...', url: '/admin/...' });
 *
 * Setup:
 *   1. Generate VAPID keys:    npx web-push generate-vapid-keys
 *   2. Set env vars:           VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 */

import { supabaseAdmin } from '@/src/lib/supabase/admin';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:info@sviinfrasolutions.com';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  requireInteraction?: boolean;
}

export async function sendPushToAll(payload: PushPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured — push notifications disabled');
    return;
  }

  // Dynamic import — web-push is Node-only
  const webpush = await import('web-push');

  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { data: subscriptions, error } = await supabaseAdmin.from('push_subscriptions').select('*');

  if (error || !subscriptions?.length) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(payload)
        )
        .catch(async (err: any) => {
          // Remove invalid subscriptions (expired/unsubscribed)
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`Push: ${sent} sent, ${failed} failed (invalid subs removed)`);
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const webpush = await import('web-push');
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { data: subscriptions } = await supabaseAdmin.from('push_subscriptions').select('*');

  if (!subscriptions?.length) return;

  // Send to all (filtering by user would need user_id in push_subscriptions)
  for (const sub of subscriptions) {
    webpush
      .sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify(payload))
      .catch(async (err: any) => {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      });
  }
}
