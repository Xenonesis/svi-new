export interface QueuedPunch {
  id: string;
  type: 'in' | 'out';
  timestamp: string;
  coords: { lat: number; lon: number };
  workSummary?: string;
  clientCount?: number;
  visitCount?: number;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const STORAGE_KEY = 'svi_offline_punch_queue';

type QueueSubscriber = (queue: QueuedPunch[]) => void;
const subscribers = new Set<QueueSubscriber>();
let isSyncing = false;

function readFromStorage(): QueuedPunch[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse offline punch queue from storage:', err);
    return [];
  }
}

function writeToStorage(queue: QueuedPunch[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to write offline punch queue to storage:', err);
  }
}

function notifySubscribers(queue: QueuedPunch[]): void {
  subscribers.forEach((cb) => {
    try {
      cb(queue);
    } catch (err) {
      console.error('Error in offline punch queue subscriber:', err);
    }
  });
}

export const offlinePunchQueue = {
  enqueue(item: Omit<QueuedPunch, 'id' | 'status'>): QueuedPunch {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `punch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newPunch: QueuedPunch = {
      ...item,
      id,
      status: 'pending',
    };

    const currentQueue = readFromStorage();
    const updatedQueue = [...currentQueue, newPunch];
    writeToStorage(updatedQueue);
    notifySubscribers(updatedQueue);
    return newPunch;
  },

  getQueue(): QueuedPunch[] {
    return readFromStorage();
  },

  clear(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    notifySubscribers([]);
  },

  remove(id: string): void {
    const currentQueue = readFromStorage();
    const updatedQueue = currentQueue.filter((p) => p.id !== id);
    writeToStorage(updatedQueue);
    notifySubscribers(updatedQueue);
  },

  subscribe(callback: QueueSubscriber): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  },

  async syncPendingPunches(): Promise<{ synced: number; failed: number }> {
    if (isSyncing) {
      return { synced: 0, failed: 0 };
    }

    isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      const queue = readFromStorage();
      if (queue.length === 0) {
        return { synced: 0, failed: 0 };
      }

      // Process punches in FIFO order
      for (const item of queue) {
        const currentQueue = readFromStorage();
        const punch = currentQueue.find((p) => p.id === item.id);
        if (!punch || (punch.status !== 'pending' && punch.status !== 'failed')) {
          continue;
        }

        punch.status = 'syncing';
        writeToStorage(currentQueue);
        notifySubscribers(currentQueue);

        const endpoint =
          punch.type === 'in'
            ? '/api/employee/attendance/punch-in'
            : '/api/employee/attendance/punch-out';

        const payload: Record<string, unknown> = {
          lat: punch.coords.lat,
          lon: punch.coords.lon,
          latitude: punch.coords.lat,
          longitude: punch.coords.lon,
        };

        if (punch.type === 'out') {
          if (punch.workSummary !== undefined) payload.summary_text = punch.workSummary;
          if (punch.clientCount !== undefined)
            payload.client_interactions_count = punch.clientCount;
          if (punch.visitCount !== undefined)
            payload.site_visits_conducted_count = punch.visitCount;
        }

        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            syncedCount++;
            const latestQueue = readFromStorage().filter((p) => p.id !== punch.id);
            writeToStorage(latestQueue);
            notifySubscribers(latestQueue);
          } else {
            failedCount++;
            let errMsg = `Failed to sync punch: status ${res.status}`;
            try {
              const data = await res.json();
              if (data?.error?.message) {
                errMsg = data.error.message;
              } else if (typeof data?.error === 'string') {
                errMsg = data.error;
              } else if (data?.message) {
                errMsg = data.message;
              }
            } catch {
              // response was not json
            }
            const latestQueue = readFromStorage().map((p) =>
              p.id === punch.id ? { ...p, status: 'failed' as const, errorMessage: errMsg } : p
            );
            writeToStorage(latestQueue);
            notifySubscribers(latestQueue);
          }
        } catch (err: unknown) {
          failedCount++;
          const errMsg = err instanceof Error ? err.message : 'Network error during sync';
          const latestQueue = readFromStorage().map((p) =>
            p.id === punch.id ? { ...p, status: 'failed' as const, errorMessage: errMsg } : p
          );
          writeToStorage(latestQueue);
          notifySubscribers(latestQueue);
        }
      }
    } finally {
      isSyncing = false;
    }

    return { synced: syncedCount, failed: failedCount };
  },
};

// Auto-register online event in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlinePunchQueue.syncPendingPunches().catch((err) => {
      console.error('Auto-sync on online event failed:', err);
    });
  });
}
