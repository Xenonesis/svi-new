import webpush from 'web-push';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:info@sviinfrasolutions.com';

let vapidConfigured = false;
if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(vapidEmail, publicKey, privateKey);
    vapidConfigured = true;
  } catch (err) {
    console.error('Failed to configure VAPID details:', err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

export interface PushDispatchResult {
  total: number;
  sent: number;
  failed: number;
  cleaned: number;
}

interface StoredSubscription {
  endpoint: string;
  keys: {
    auth?: string;
    p256dh?: string;
  };
}

export async function broadcastPushNotification(
  payload: PushPayload,
  specificEndpoint?: string
): Promise<PushDispatchResult> {
  if (!vapidConfigured) {
    throw new Error('VAPID keys not configured in environment variables');
  }

  let query = supabaseAdmin.from('push_subscriptions').select('endpoint, keys');
  if (specificEndpoint) {
    query = query.eq('endpoint', specificEndpoint);
  }

  const { data: subscriptions, error } = await query;
  if (error || !subscriptions) {
    throw new Error(`Failed to fetch subscriptions: ${error?.message || 'Empty response'}`);
  }

  if (subscriptions.length === 0) {
    return { total: 0, sent: 0, failed: 0, cleaned: 0 };
  }

  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: '/favicons/favicon_48x48.png',
    url: payload.url || '/',
    tag: payload.tag || 'svi-broadcast',
  });

  const staleEndpoints: string[] = [];
  let sentCount = 0;
  let failedCount = 0;

  // Process in chunks of 25 for Vercel Free tier execution safety
  const CHUNK_SIZE = 25;
  for (let i = 0; i < subscriptions.length; i += CHUNK_SIZE) {
    const chunk = subscriptions.slice(i, i + CHUNK_SIZE) as StoredSubscription[];
    const promises = chunk.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.keys?.auth || '',
              p256dh: sub.keys?.p256dh || '',
            },
          },
          pushPayload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          }
        );
        sentCount++;
      } catch (err: unknown) {
        failedCount++;
        // Stale or corrupt subscription (uninstalled, revoked, or malformed)
        const isStale =
          (err &&
            typeof err === 'object' &&
            'statusCode' in err &&
            (err.statusCode === 404 || err.statusCode === 410)) ||
          (err instanceof Error && err.message.includes('65 bytes long'));
        if (isStale) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // Prune stale endpoints from database
  let cleanedCount = 0;
  if (staleEndpoints.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);

    if (!deleteError) {
      cleanedCount = staleEndpoints.length;
    }
  }

  return {
    total: subscriptions.length,
    sent: sentCount,
    failed: failedCount,
    cleaned: cleanedCount,
  };
}
