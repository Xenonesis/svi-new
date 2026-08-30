'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface AttendanceOfflineBannerProps {
  queueCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export function AttendanceOfflineBanner({
  queueCount,
  isSyncing,
  onSync,
}: AttendanceOfflineBannerProps) {
  if (queueCount === 0) return null;

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs sm:flex-row sm:items-center dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-base font-bold text-amber-700 dark:text-amber-300">
          ⚡
        </span>
        <div>
          <p className="text-xs font-bold sm:text-sm">
            {queueCount} Offline Punch{queueCount > 1 ? 'es' : ''} Queued (Auto-sync active)
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            Punches recorded offline will automatically upload when network connection is restored.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSync}
        disabled={isSyncing}
        className="flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-500 disabled:opacity-50 sm:self-auto"
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Now</span>
          </>
        )}
      </button>
    </div>
  );
}
