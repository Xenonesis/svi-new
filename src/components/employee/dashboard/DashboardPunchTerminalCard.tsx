'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Play,
  StopCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { DashboardData } from './types';

interface DashboardPunchTerminalCardProps {
  today: DashboardData['today'] | undefined;
  elapsedTime: string;
  onOpenLogModal?: () => void;
}

export function DashboardPunchTerminalCard({
  today,
  elapsedTime,
  onOpenLogModal,
}: DashboardPunchTerminalCardProps) {
  const punchStatus = today?.punch_status || 'not_punched';

  // Format punch in / punch out safely
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    try {
      // If already formatted like HH:mm
      if (isoString.length === 5 && isoString.includes(':')) return isoString;
      return format(new Date(isoString), 'hh:mm a');
    } catch {
      return isoString;
    }
  };

  // Calculate progress % for 8.5 hour standard shift
  let progressPercent = 0;
  if (punchStatus === 'punched_in' && elapsedTime) {
    const parts = elapsedTime.split(':').map(Number);
    const totalSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    progressPercent = Math.min(100, Math.round((totalSeconds / (8.5 * 3600)) * 100));
  } else if (punchStatus === 'punched_out' && today?.total_hours) {
    progressPercent = Math.min(100, Math.round((today.total_hours / 8.5) * 100));
  }

  // SVG Progress Ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all sm:p-6',
        punchStatus === 'punched_in'
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-950/80 backdrop-blur-xl dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-slate-950/80 dark:to-slate-950'
          : punchStatus === 'punched_out'
            ? 'border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-slate-900/60 to-slate-950/80 backdrop-blur-xl dark:border-blue-500/30 dark:from-blue-950/40 dark:via-slate-950/80 dark:to-slate-950'
            : 'border-slate-200/90 bg-white/95 shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-none'
      )}
    >
      {/* Top Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <div
              className={clsx(
                'h-2.5 w-2.5 rounded-full',
                punchStatus === 'punched_in'
                  ? 'bg-emerald-500'
                  : punchStatus === 'punched_out'
                    ? 'bg-blue-500'
                    : 'bg-slate-400 dark:bg-slate-500'
              )}
            />
            {punchStatus === 'punched_in' && (
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
          </div>
          <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
            {punchStatus === 'punched_in'
              ? 'Shift In Progress'
              : punchStatus === 'punched_out'
                ? 'Shift Completed'
                : 'Shift Not Started'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {today?.is_geofence_verified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Geofence Verified
            </span>
          )}
          {today?.is_late && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Late Arrival
            </span>
          )}
        </div>
      </div>

      {/* Precision Circular Radar Dial */}
      <div className="my-5 flex flex-col items-center justify-center text-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          {/* SVG Track & Progress */}
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800/80"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              className={clsx(
                'transition-all duration-1000 ease-out',
                punchStatus === 'punched_in'
                  ? 'stroke-emerald-500'
                  : punchStatus === 'punched_out'
                    ? 'stroke-blue-500'
                    : 'stroke-amber-500/40'
              )}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={punchStatus === 'not_punched' ? circumference : strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Dial Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock
              className={clsx(
                'h-5 w-5',
                punchStatus === 'punched_in'
                  ? 'text-emerald-500'
                  : punchStatus === 'punched_out'
                    ? 'text-blue-500'
                    : 'text-slate-400 dark:text-slate-500'
              )}
            />
            <span className="mt-1 font-mono text-base font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
              {punchStatus === 'punched_in'
                ? elapsedTime
                : punchStatus === 'punched_out'
                  ? `${(today?.total_hours || 0).toFixed(1)} hrs`
                  : '00:00:00'}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {punchStatus === 'punched_in'
                ? `${progressPercent}% of 8.5h`
                : punchStatus === 'punched_out'
                  ? 'Logged Today'
                  : 'Shift Duration'}
            </span>
          </div>
        </div>

        {/* Punch Time Splits */}
        <div className="mt-4 grid w-full grid-cols-2 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 py-2.5 text-center text-xs dark:divide-slate-800 dark:border-white/5 dark:bg-slate-950/40">
          <div className="px-2">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Punch In</p>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {formatTime(today?.punch_in_time)}
            </p>
          </div>
          <div className="px-2">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Punch Out</p>
            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {formatTime(today?.punch_out_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Action Button */}
      {punchStatus === 'punched_in' ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/employee/attendance"
            onClick={triggerHaptic}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95"
          >
            <StopCircle className="h-4 w-4" /> Punch Out & Submit Log
          </Link>
        </div>
      ) : punchStatus === 'punched_out' ? (
        <Link
          href="/employee/attendance/history"
          onClick={triggerHaptic}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 py-2.5 text-xs font-bold text-slate-800 transition-all hover:bg-slate-200 active:scale-95 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <CheckCircle2 className="h-4 w-4 text-blue-500" /> View Today&apos;s Timesheet
        </Link>
      ) : (
        <Link
          href="/employee/attendance"
          onClick={triggerHaptic}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#d98b40] via-[#db8d3d] to-[#c67c33] py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Open GPS Attendance Terminal{' '}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}
