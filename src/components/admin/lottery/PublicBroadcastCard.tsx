'use client';

import { Globe } from 'lucide-react';

interface PublicBroadcastCardProps {
  lotteryVisible: boolean;
  visibilityLoading: boolean;
  visibilityPending: boolean;
  onToggleVisibility: (visible: boolean) => void;
}

export function PublicBroadcastCard({
  lotteryVisible,
  visibilityLoading,
  visibilityPending,
  onToggleVisibility,
}: PublicBroadcastCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 ${
        lotteryVisible
          ? 'border-brand-gold/40 to-brand-gold/5 shadow-[0_0_30px_rgba(212, 175, 55,0.1)] dark:from-brand-dark-surface bg-gradient-to-br from-white'
          : 'dark:bg-brand-dark-surface/50 border-slate-200 bg-white dark:border-white/10'
      }`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${
              lotteryVisible
                ? 'bg-brand-gold/20 text-brand-gold'
                : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-gray-500'
            }`}
          >
            <Globe className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Public Live Broadcast
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              {lotteryVisible
                ? 'The Lottery Arena is LIVE and broadcasting to all public visitors.'
                : 'The Arena is offline. Public visitors cannot see the drawing.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:shrink-0">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${
              lotteryVisible
                ? 'border border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400'
                : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-gray-500'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                lotteryVisible
                  ? 'animate-pulse bg-green-500 shadow-[0_0_10px_#4ade80] dark:bg-green-400'
                  : 'bg-slate-400 dark:bg-gray-500'
              }`}
            />
            {visibilityLoading ? 'Checking...' : lotteryVisible ? 'Broadcasting Live' : 'Offline'}
          </span>
          <button
            onClick={() => onToggleVisibility(!lotteryVisible)}
            disabled={visibilityLoading || visibilityPending}
            className={`focus-visible:ring-brand-gold relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${
              lotteryVisible
                ? 'border-brand-gold bg-brand-gold shadow-[0_0_15px_rgba(212, 175, 55,0.5)]'
                : 'border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-white/5'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 rounded-full shadow-md transition-all duration-300 ${
                lotteryVisible
                  ? 'translate-x-8 bg-white dark:bg-[#0a0a0f]'
                  : 'translate-x-1 bg-white dark:bg-gray-500'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
