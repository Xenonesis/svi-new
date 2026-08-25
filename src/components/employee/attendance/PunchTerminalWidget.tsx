'use client';

import React from 'react';
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface StatusState {
  status: 'not_punched' | 'punched_in' | 'punched_out';
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
}

interface PunchTerminalWidgetProps {
  statusData: StatusState;
  elapsedTime: string;
  punching: boolean;
  onPunchIn: () => void;
  onPunchOutClick: () => void;
}

export function PunchTerminalWidget({
  statusData,
  elapsedTime,
  punching,
  onPunchIn,
  onPunchOutClick,
}: PunchTerminalWidgetProps) {
  const isPunchedIn = statusData.status === 'punched_in';
  const isPunchedOut = statusData.status === 'punched_out';

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-3xl border p-6 text-center shadow-lg transition-all',
        isPunchedIn
          ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-white dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900'
          : isPunchedOut
            ? 'border-blue-500/30 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-white dark:from-blue-950/30 dark:via-slate-900/60 dark:to-slate-900'
            : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/70'
      )}
    >
      {/* Live Status Badge */}
      <div className="mb-6 flex items-center justify-between">
        <span
          className={clsx(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase',
            isPunchedIn
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : isPunchedOut
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          <div
            className={clsx(
              'h-2 w-2 rounded-full',
              isPunchedIn
                ? 'animate-pulse bg-emerald-500'
                : isPunchedOut
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
            )}
          />
          {isPunchedIn ? 'Shift Active' : isPunchedOut ? 'Shift Ended' : 'Not Punched'}
        </span>

        {statusData.is_late && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            Late Arrival
          </span>
        )}
      </div>

      {/* Shift Timer Radial */}
      <div className="relative mx-auto my-6 flex h-48 w-48 items-center justify-center rounded-full border-8 border-slate-100 bg-slate-50/80 shadow-inner dark:border-slate-800 dark:bg-slate-950/80">
        {isPunchedIn && (
          <div className="absolute inset-0 animate-spin rounded-full border-8 border-emerald-500 border-t-transparent" />
        )}
        <div className="flex flex-col items-center">
          <Clock
            className={clsx(
              'h-8 w-8',
              isPunchedIn ? 'text-emerald-500' : isPunchedOut ? 'text-blue-500' : 'text-slate-400'
            )}
          />
          <span className="mt-2 font-mono text-2xl font-black text-slate-900 dark:text-white">
            {isPunchedIn
              ? elapsedTime
              : isPunchedOut
                ? `${(statusData.total_hours || 0).toFixed(1)} hrs`
                : '00:00:00'}
          </span>
          <span className="mt-0.5 text-xs text-slate-500">
            {isPunchedIn
              ? 'Live Shift Elapsed'
              : isPunchedOut
                ? 'Total Shift Time'
                : 'Ready to Punch'}
          </span>
        </div>
      </div>

      {/* Time Stamp Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left dark:border-slate-800 dark:bg-slate-950/40">
        <div>
          <span className="text-[10px] text-slate-400">Punch In Time</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {statusData.punch_in_time
              ? format(new Date(statusData.punch_in_time), 'hh:mm:ss a')
              : '--:--'}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">Punch Out Time</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {statusData.punch_out_time
              ? format(new Date(statusData.punch_out_time), 'hh:mm:ss a')
              : '--:--'}
          </p>
        </div>
      </div>

      {/* Punch Action Button */}
      {!isPunchedIn ? (
        <button
          onClick={onPunchIn}
          disabled={punching}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 disabled:opacity-50"
        >
          {punching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>{isPunchedOut ? 'Punch In Again' : 'Punch In (Start Shift)'}</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onPunchOutClick}
          disabled={punching}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Punch Out (End Shift)</span>
        </button>
      )}
    </div>
  );
}
