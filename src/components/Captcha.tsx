'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  /** Called with the user's current answer ('' = unanswered). Server verifies it. */
  onValidate: (answer: string) => void;
  error?: string;
  placeholder?: string;
}

interface Challenge {
  a: number;
  b: number;
}

export default function Captcha({
  onValidate,
  error,
  placeholder = 'Enter sum (e.g. 12)',
}: CaptchaProps) {
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setInput('');
    onValidate('');
    try {
      const res = await fetch('/api/registration/captcha');
      if (!res.ok) throw new Error('captcha fetch failed');
      const data: Challenge = await res.json();
      setChallenge(data);
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [onValidate]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    onValidate(input);
  }, [input, onValidate]);

  // Before mount, render a static placeholder with <noscript> fallback.
  // The input+button are hidden from React's hydration reconciler to
  // avoid the disabled-attribute mismatch in React 19 SSR.
  if (!mounted) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
          Verification *
        </label>
        <div className="flex items-center gap-3">
          <div className="flex min-h-[46px] min-w-[90px] items-center justify-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold select-none dark:border-gray-700 dark:bg-gray-900">
            <span className="text-xs text-gray-400">...</span>
          </div>
          <div className="h-[46px] w-24 rounded border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900" />
          <div className="h-10 w-10 rounded border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
        Verification *
      </label>
      <div className="flex items-center gap-3">
        <div className="flex min-h-[46px] min-w-[90px] items-center justify-center gap-2 rounded border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold select-none dark:border-gray-700 dark:bg-gray-900">
          {loading || !challenge ? (
            <span className="text-xs text-gray-400">…</span>
          ) : (
            <>
              <span>{challenge.a}</span>
              <span className="text-gray-400">+</span>
              <span>{challenge.b}</span>
              <span className="text-gray-400">=</span>
              <span className="text-gray-400">?</span>
            </>
          )}
        </div>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-44 rounded-xl border bg-slate-50/50 px-4 py-3 text-sm font-medium outline-hidden transition-all sm:w-52 dark:bg-slate-900/90 dark:text-white ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'focus:border-brand-gold focus:ring-brand-gold/25 dark:focus:border-brand-gold border-slate-200 focus:ring-2 dark:border-slate-700'
          }`}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="hover:border-brand-gold hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors disabled:opacity-50 dark:border-gray-700"
          aria-label="Refresh captcha"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {!challenge && !loading && (
        <p className="text-xs text-red-500">
          Could not load verification.{' '}
          <button type="button" onClick={refresh} className="underline">
            Retry
          </button>
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
