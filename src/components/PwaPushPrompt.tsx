'use client';

import { useEffect, useState } from 'react';
import {
  isPushSupported,
  subscribeToPush,
  getPermissionState,
} from '@/src/lib/pwa/pushNotifications';

type PushState = 'loading' | 'unsupported' | 'denied' | 'granted' | 'prompt';

export default function PwaPushPrompt() {
  const [state, setState] = useState<PushState>('loading');
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPushSupported()) {
      setState('unsupported');
      return;
    }

    getPermissionState().then((perm) => {
      if (perm === 'granted') {
        setState('granted');
        navigator.serviceWorker.ready.then((reg) =>
          reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
        );
      } else if (perm === 'denied') {
        setState('denied');
      } else {
        setState('prompt');
      }
    });
  }, []);

  if (state !== 'prompt' || dismissed || subscribed || !show) return null;

  const handleSubscribe = async () => {
    setSubscribing(true);
    setError('');

    const sub = await subscribeToPush();
    if (sub) {
      setSubscribed(true);
    } else if (Notification.permission === 'denied') {
      setError('Notifications blocked. Update browser settings to enable.');
    } else if (!isPushSupported()) {
      setError('Push notifications not supported on this device.');
    } else {
      setError('Could not subscribe. Service worker may not be ready.');
    }
    setSubscribing(false);
  };

  return (
    <div
      className="animate-in slide-in-from-bottom-2 fixed right-4 bottom-4 z-50 max-w-sm"
      role="alert"
    >
      <div className="dark:border-brand-dark-border dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="flex items-start gap-4">
          {/* Bell icon */}
          <div className="border-brand-gold/30 bg-brand-gold/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
            <svg
              className="text-brand-gold h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-brand-navy font-serif text-base font-semibold dark:text-gray-100">
              Stay Updated
            </p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {error || 'Get notified about new properties, special offers, and project updates.'}
            </p>

            {/* Error state */}
            {error && (
              <p className="mt-2 font-sans text-xs font-medium text-red-500 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-3 flex gap-3">
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-light rounded px-4 py-2 font-sans text-xs font-bold tracking-wider text-white uppercase transition-colors disabled:opacity-50 dark:disabled:opacity-50"
              >
                {subscribing ? 'Subscribing…' : 'Enable'}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="hover:text-brand-navy font-sans text-xs font-medium tracking-wide text-gray-400 underline-offset-2 hover:underline dark:hover:text-gray-300"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
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
    </div>
  );
}
