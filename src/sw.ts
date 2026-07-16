import { defaultCache } from '@serwist/next/worker';
import { type PrecacheEntry, Serwist, NetworkOnly } from 'serwist';

declare const self: any;

// ── Background Sync ─────────────────────────────────────
const syncSubmissions = async () => {
  try {
    const syncCache = await caches.open('svi-sync-v1');
    const requests = await syncCache.keys();

    for (const request of requests) {
      try {
        const cachedResponse = await syncCache.match(request);
        if (!cachedResponse) continue;

        const body = await cachedResponse.text();
        const response = await fetch(request.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });

        if (response.ok) {
          await syncCache.delete(request);
        }
      } catch {
        // Will retry on next sync
      }
    }
  } catch {
    // Cache not available
  }
};

// Initialize Serwist
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST as PrecacheEntry[] | undefined,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  runtimeCaching: [
    {
      matcher: ({ url }: any) => url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

// Custom push notification handler
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/favicons/favicon_48x48.png',
      vibrate: data.vibrate || [200, 100, 200],
      data: {
        url: data.url || '/',
        date: Date.now(),
        ...(data.data || {}),
      },
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || 'default',
      renotify: data.renotify || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SVI Infra Solutions', options)
    );
  } catch {
    // Non-JSON push — ignore
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: any[]) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.focus();
            if ('navigate' in client) {
              (client as any).navigate(url);
            }
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Background Sync handler
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncSubmissions());
  }
});

serwist.addEventListeners();
