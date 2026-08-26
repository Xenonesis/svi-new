'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  MapPin,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface FeedbackNotice {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  reason?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

interface PunchFeedbackBannerProps {
  notice: FeedbackNotice | null;
  onDismiss: () => void;
}

export function PunchFeedbackBanner({ notice, onDismiss }: PunchFeedbackBannerProps) {
  if (!notice) return null;

  const isError = notice.type === 'error';
  const isWarning = notice.type === 'warning';
  const isSuccess = notice.type === 'success';

  return (
    <div
      role="alert"
      className={clsx(
        'animate-in fade-in slide-in-from-top-2 relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-200 sm:p-5',
        isError &&
          'border-rose-300 bg-rose-50/90 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100',
        isWarning &&
          'border-amber-300 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100',
        isSuccess &&
          'border-emerald-300 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100',
        !isError &&
          !isWarning &&
          !isSuccess &&
          'border-blue-300 bg-blue-50/90 text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100'
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Status Icon */}
        <div
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm',
            isError && 'bg-rose-500 text-white',
            isWarning && 'bg-amber-500 text-white',
            isSuccess && 'bg-emerald-500 text-white',
            !isError && !isWarning && !isSuccess && 'bg-blue-500 text-white'
          )}
        >
          {isError && <AlertCircle className="h-5 w-5" />}
          {isWarning && <AlertTriangle className="h-5 w-5" />}
          {isSuccess && <CheckCircle2 className="h-5 w-5" />}
          {!isError && !isWarning && !isSuccess && <HelpCircle className="h-5 w-5" />}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold tracking-tight">{notice.title}</h4>
            <span
              className={clsx(
                'rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase',
                isError && 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
                isWarning &&
                  'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
                isSuccess &&
                  'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
                !isError &&
                  !isWarning &&
                  !isSuccess &&
                  'bg-blue-200/80 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
              )}
            >
              {isError ? 'Action Needed' : isWarning ? 'Notice' : 'Success'}
            </span>
          </div>

          <p className="mt-1 text-xs leading-relaxed font-medium opacity-95 sm:text-sm">
            {notice.message}
          </p>

          {/* Detailed Reason or Diagnosis if provided */}
          {notice.reason && (
            <div
              className={clsx(
                'mt-2.5 rounded-xl border p-2.5 font-mono text-xs',
                isError &&
                  'border-rose-200 bg-white/70 text-rose-900 dark:border-rose-900/40 dark:bg-slate-900/70 dark:text-rose-200',
                isWarning &&
                  'border-amber-200 bg-white/70 text-amber-900 dark:border-amber-900/40 dark:bg-slate-900/70 dark:text-amber-200',
                !isError &&
                  !isWarning &&
                  'border-slate-200 bg-white/70 text-slate-800 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200'
              )}
            >
              <span className="mb-0.5 block font-sans text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Technical Diagnosis:
              </span>
              {notice.reason}
            </div>
          )}

          {/* Action Buttons */}
          {(notice.onAction || notice.onSecondaryAction) && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {notice.onAction && (
                <button
                  type="button"
                  onClick={notice.onAction}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95',
                    isError && 'bg-rose-600 hover:bg-rose-700',
                    isWarning && 'bg-amber-600 hover:bg-amber-700',
                    isSuccess && 'bg-emerald-600 hover:bg-emerald-700',
                    !isError && !isWarning && !isSuccess && 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{notice.actionLabel || 'Try Again'}</span>
                </button>
              )}

              {notice.onSecondaryAction && (
                <button
                  type="button"
                  onClick={notice.onSecondaryAction}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{notice.secondaryActionLabel || 'Refresh GPS'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
