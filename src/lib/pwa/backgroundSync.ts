/**
 * Lightweight offline form queue for PWA background sync.
 * Saves failed submissions to localStorage, replays when online.
 */

interface QueuedSubmission {
  id: string;
  url: string;
  method: string;
  body: string;
  contentType: string;
  createdAt: number;
  retries: number;
}

const QUEUE_KEY = 'svi-pending-submissions';

export function getPendingCount(): number {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    return JSON.parse(raw).length;
  } catch {
    return 0;
  }
}

export function queueSubmission(url: string, body: string, contentType = 'application/json'): void {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: QueuedSubmission[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      method: 'POST',
      body,
      contentType,
      createdAt: Date.now(),
      retries: 0,
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        (reg as any).sync.register('sync-submissions').catch(() => {});
      });
    }
  } catch {
    // localStorage full or unavailable — silently drop
  }
}

export async function replayQueue(): Promise<{ replayed: number; failed: number }> {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return { replayed: 0, failed: 0 };

  const queue: QueuedSubmission[] = JSON.parse(raw);
  const remaining: QueuedSubmission[] = [];
  let replayed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': item.contentType },
        body: item.body,
      });
      if (res.ok) {
        replayed++;
      } else {
        item.retries++;
        if (item.retries < 5) remaining.push(item);
        else failed++;
      }
    } catch {
      item.retries++;
      if (item.retries < 5) remaining.push(item);
      else failed++;
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { replayed, failed };
}
