'use client';

import React, { useTransition } from 'react';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { useRecordingPlayer, type RecordingMeta } from '@/src/lib/leads/recordingPlayer';

interface IvrRecordingButtonProps {
  recordingUrl: string | null | undefined;
  variant?: 'icon' | 'pill';
  title?: string;
  className?: string;
  meta?: RecordingMeta;
}

/**
 * Interactive Call Recording Player Button
 *
 * Features:
 * - Inline playback via same-origin streaming proxy (`/api/admin/leads/recording`)
 * - Live state feedback: Idle (Volume2), Loading (Loader2 spinner), Playing (Pause + pulsating glow)
 * - Accessible: aria-label with dynamic play/pause status and proper focus rings
 * - Retains original title="Listen to Call Recording (.wav)" on icon variant for exact test/audit compatibility
 */
export function IvrRecordingButton({
  recordingUrl,
  variant = 'icon',
  title = 'Listen to Call Recording (.wav)',
  className = '',
  meta,
}: IvrRecordingButtonProps) {
  const { isPlaying, isLoading, toggle } = useRecordingPlayer(recordingUrl);
  const [, startTransition] = useTransition();

  if (!recordingUrl) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(() => {
      toggle(meta);
    });
  };

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={isPlaying ? 'Pause call recording' : 'Listen to call recording'}
        aria-label={isPlaying ? 'Pause call recording' : 'Listen to call recording'}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
          isPlaying
            ? 'border-amber-500 bg-amber-500/20 text-amber-700 shadow-xs dark:bg-amber-500/30 dark:text-amber-300'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-3 w-3 animate-pulse text-amber-600 dark:text-amber-400" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
        <span>{isLoading ? 'Loading...' : isPlaying ? 'Playing Audio' : 'Call Recording'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isPlaying ? 'Pause Call Recording' : title}
      aria-label={isPlaying ? 'Pause Call Recording' : 'Listen to Call Recording'}
      className={`relative inline-flex items-center justify-center rounded-md p-1 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
        isPlaying
          ? 'bg-amber-500/25 text-amber-600 ring-2 ring-amber-500/40 dark:bg-amber-500/30 dark:text-amber-300'
          : 'text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:bg-amber-500/20'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
      ) : isPlaying ? (
        <>
          <span className="absolute inset-0 animate-ping rounded-md bg-amber-500/20" />
          <Pause className="relative h-3 w-3 fill-current" />
        </>
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </button>
  );
}
