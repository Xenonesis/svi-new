'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface StatusState {
  status: 'not_punched' | 'punched_in' | 'punched_out';
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  summary_text?: string | null;
}

interface AttendanceSettingsProps {
  punch_in_start?: string;
  punch_in_cutoff?: string;
  punch_out_start?: string;
  punch_out_end?: string;
  geofence_radius_meters?: number;
}

interface PunchTerminalWidgetProps {
  statusData: StatusState;
  elapsedTime: string;
  punching: boolean;
  settings?: AttendanceSettingsProps;
  onPunchIn: () => void;
  onPunchOutClick: () => void;
}

function formatTime12(timeStr?: string): string {
  if (!timeStr) return '--:--';
  const clean = timeStr.replace(/"/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${min} ${ampm}`;
}

export function PunchTerminalWidget({
  statusData,
  elapsedTime,
  punching,
  settings,
  onPunchIn,
  onPunchOutClick,
}: PunchTerminalWidgetProps) {
  const isPunchedIn = statusData.status === 'punched_in';
  const isPunchedOut = statusData.status === 'punched_out';

  // Live real-time clock for the terminal
  const [currentLiveTime, setCurrentLiveTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentLiveTime(format(now, 'hh:mm:ss a'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminShiftStart = formatTime12(settings?.punch_in_start || '09:00');
  const adminShiftEnd = formatTime12(settings?.punch_out_start || '17:00');

  // Estimate expected punch-out time (8 hours from punch in)
  let expectedPunchOut: string | null = null;
  let shiftProgressPercent = 0;

  if (statusData.punch_in_time) {
    const punchInDate = new Date(statusData.punch_in_time);
    const expectedOutDate = new Date(punchInDate.getTime() + 8 * 60 * 60 * 1000);
    expectedPunchOut = format(expectedOutDate, 'hh:mm a');

    if (isPunchedIn) {
      const now = new Date().getTime();
      const elapsedMs = Math.max(0, now - punchInDate.getTime());
      const totalMs = 8 * 60 * 60 * 1000;
      shiftProgressPercent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
    } else if (isPunchedOut && statusData.total_hours) {
      shiftProgressPercent = Math.min(100, Math.round((statusData.total_hours / 8) * 100));
    }
  }

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
      <div className="mb-4 flex items-center justify-between">
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
          {isPunchedIn
            ? 'Shift Active • On Duty'
            : isPunchedOut
              ? 'Shift Completed'
              : 'Ready to Punch'}
        </span>

        <div className="flex items-center gap-1.5">
          {statusData.is_late && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Late Arrival
            </span>
          )}
          {statusData.is_geofence_verified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Geofence Verified
            </span>
          )}
        </div>
      </div>

      {/* Shift Timer Radial */}
      <div className="relative mx-auto my-5 flex h-48 w-48 items-center justify-center rounded-full border-8 border-slate-100 bg-slate-50/80 shadow-inner dark:border-slate-800 dark:bg-slate-950/80">
        {isPunchedIn && (
          <div className="absolute inset-0 animate-spin rounded-full border-8 border-emerald-500 border-t-transparent" />
        )}
        <div className="flex flex-col items-center">
          <Clock
            className={clsx(
              'h-7 w-7',
              isPunchedIn ? 'text-emerald-500' : isPunchedOut ? 'text-blue-500' : 'text-slate-400'
            )}
          />
          <span className="mt-2 font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {isPunchedIn
              ? elapsedTime
              : isPunchedOut
                ? `${(statusData.total_hours || 0).toFixed(1)} hrs`
                : currentLiveTime || '00:00:00'}
          </span>
          <span className="mt-1 text-[11px] font-medium text-slate-500">
            {isPunchedIn
              ? 'Working Time Today'
              : isPunchedOut
                ? 'Total Shift Duration'
                : 'Current Real-Time Clock'}
          </span>
        </div>
      </div>

      {/* Progress towards 8h shift goal (if punched in or completed) */}
      {(isPunchedIn || isPunchedOut) && (
        <div className="mb-4 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Shift Target (8 Hours)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {shiftProgressPercent}% completed
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                isPunchedIn ? 'bg-emerald-500' : 'bg-blue-500'
              )}
              style={{ width: `${shiftProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Admin Shift Timings & Today's Attendance Metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left dark:border-slate-800 dark:bg-slate-950/40">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Punch In Time</span>
          <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            {statusData.punch_in_time
              ? format(new Date(statusData.punch_in_time), 'hh:mm a')
              : `--:-- (Starts ${adminShiftStart})`}
          </p>
          <p className="text-[10px] text-slate-400">Official Start: {adminShiftStart}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Punch Out Time</span>
          <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            {statusData.punch_out_time
              ? format(new Date(statusData.punch_out_time), 'hh:mm a')
              : expectedPunchOut
                ? `Est. ${expectedPunchOut}`
                : `--:-- (Starts ${adminShiftEnd})`}
          </p>
          <p className="text-[10px] text-slate-400">Official End: {adminShiftEnd}</p>
        </div>
      </div>

      {/* Primary Punch Action Button */}
      {!isPunchedIn ? (
        <button
          onClick={onPunchIn}
          disabled={punching}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 disabled:opacity-50"
        >
          {punching ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying GPS & Punching In...</span>
            </div>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>{isPunchedOut ? 'Punch In Again (New Shift)' : 'Punch In (Start Shift)'}</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onPunchOutClick}
          disabled={punching}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-500 disabled:opacity-50"
        >
          {punching ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Recording Punch Out...</span>
            </div>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span>Punch Out (End Shift & Submit Log)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
