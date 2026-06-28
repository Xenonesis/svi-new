/**
 * Push notification utilities for PWA
 * Uses VAPID (Voluntary Application Server Identification)
 *
 * Setup:
 *   Generate VAPID keys:    npx web-push generate-vapid-keys
 *   Set env vars:            NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && PUBLIC_KEY != null;
}

export function getPermissionState(): Promise<NotificationPermission> {
  return navigator.permissions?.query
    ? navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((p) => p.state as NotificationPermission)
    : Promise.resolve(Notification.permission);
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const reg = await navigator.serviceWorker.ready;

    // Request permission if needed
    if (Notification.permission === 'denied') return null;
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
    }

    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY!) as BufferSource,
    });

    await saveSubscription(sub);
    return sub;
  } catch {
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;

    await removeSubscription(sub.endpoint);
    await sub.unsubscribe();
    return true;
  } catch {
    return false;
  }
}

async function saveSubscription(sub: PushSubscription): Promise<void> {
  const subJSON = sub.toJSON();
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: subJSON.keys,
      auth: (subJSON.keys as Record<string, string> | undefined)?.auth,
      p256dh: (subJSON.keys as Record<string, string> | undefined)?.p256dh,
    }),
  });
}

async function removeSubscription(endpoint: string): Promise<void> {
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
}

// Convert VAPID public key (base64url) to Uint8Array for subscribe()
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
