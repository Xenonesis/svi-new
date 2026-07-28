'use client';

import { useEffect, useState } from 'react';
import { getPendingCount, replayQueue } from '@/src/lib/pwa/backgroundSync';

export default function PwaRegister() {
  const [synced, setSynced] = useState(0);

  // Register service worker and handle auto-update
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then(() => {});
          }
        });
      }
      return;
    }

    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // If there's already a waiting worker, trigger activation immediately
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            // Once installed, activate immediately
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              installing.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
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

  return (
    <>
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
