'use client';

import { useEffect, useState } from 'react';
import { getPendingCount, replayQueue } from '@/src/lib/pwa/backgroundSync';

type SwState = 'idle' | 'installing' | 'update-ready';

export default function PwaRegister() {
  const [state, setState] = useState<SwState>('idle');
  const [swWaiting, setSwWaiting] = useState<ServiceWorker | null>(null);
  const [synced, setSynced] = useState(0);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.waiting) {
          setSwWaiting(reg.waiting);
          setState('update-ready');
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          setState('installing');

          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setSwWaiting(installing);
              setState('update-ready');
            }
          });
        });
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  }, []);

  // Background sync: replay queued submissions when coming online
  useEffect(() => {
    const handleOnline = async () => {
      const pending = getPendingCount();
      if (pending === 0) return;
      const result = await replayQueue();
      if (result.replayed > 0) setSynced(result.replayed);
    };

    window.addEventListener('online', handleOnline);
    handleOnline();

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleUpdate = () => {
    if (!swWaiting) return;
    swWaiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return (
    <>
      {/* ── Update banner ── */}
      {state === 'update-ready' && (
        <div className="animate-in slide-in-from-bottom-2 fixed right-4 bottom-4 z-50" role="alert">
          <div className="border-brand-navy-light/20 bg-brand-navy dark:border-brand-gold/10 flex max-w-sm items-center gap-3 rounded-lg border px-5 py-3.5 shadow-xl">
            <svg
              className="text-brand-gold h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <p className="font-sans text-sm font-medium tracking-wide text-white">
              Update available
            </p>
            <button
              onClick={handleUpdate}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light ml-auto shrink-0 rounded px-3.5 py-1.5 font-sans text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Update
            </button>
            <button
              onClick={() => setState('idle')}
              className="shrink-0 text-white/50 hover:text-white"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Background sync success toast ── */}
      {synced > 0 && (
        <div
          className="animate-in slide-in-from-bottom-2 fixed right-4 bottom-20 z-50"
          role="status"
        >
          <div className="border-brand-gold/20 bg-brand-navy flex max-w-sm items-center gap-3 rounded-lg border px-5 py-3.5 shadow-xl">
            <svg
              className="text-brand-gold h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-sans text-sm font-medium tracking-wide text-white">
              {synced} pending submission{synced > 1 ? 's' : ''} sent
            </p>
            <button
              onClick={() => setSynced(0)}
              className="shrink-0 text-white/50 hover:text-white"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
