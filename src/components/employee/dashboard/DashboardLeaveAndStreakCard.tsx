'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, Flame, ShieldCheck, ArrowRight, Plus } from 'lucide-react';
import type { DashboardData } from './types';

interface DashboardLeaveAndStreakCardProps {
  leaves: DashboardData['leaves'] | undefined;
  metrics: DashboardData['metrics'] | undefined;
  onOpenLeaveModal?: () => void;
}

export function DashboardLeaveAndStreakCard({
  leaves,
  metrics,
  onOpenLeaveModal,
}: DashboardLeaveAndStreakCardProps) {
  const casual = leaves?.casual_remaining ?? 6;
  const sick = leaves?.sick_remaining ?? 6;
  const earned = leaves?.earned_remaining ?? 12;
  const total = leaves?.total_remaining ?? casual + sick + earned;
  const streak = metrics?.on_time_streak ?? 0;
  const daysPresent = metrics?.days_present_this_week ?? 0;

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Leave Quota & Attendance
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Annual balance & punctuality streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLeaveModal && (
            <button
              onClick={() => {
                triggerHaptic();
                onOpenLeaveModal();
              }}
              className="flex items-center gap-1 rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 transition-all hover:bg-blue-500/20 active:scale-95 dark:text-blue-300"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Apply</span>
            </button>
          )}
          <Link
            href="/employee/attendance/history"
            className="flex items-center gap-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <span>History</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Streak & Attendance Highlights Banner */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 dark:border-amber-500/20 dark:bg-amber-950/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-base font-black text-slate-900 tabular-nums dark:text-white">
              {streak} <span className="text-xs font-medium text-slate-500">days</span>
            </p>
            <p className="truncate text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              On-time Streak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-base font-black text-slate-900 tabular-nums dark:text-white">
              {daysPresent} <span className="text-xs font-medium text-slate-500">/ 6 d</span>
            </p>
            <p className="truncate text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
              Present This Week
            </p>
          </div>
        </div>
      </div>

      {/* Leave Balance Breakdown Pills */}
      <div className="mt-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-slate-950/40">
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Available Leave Quota
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {total} Days Total
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-slate-200/80 bg-white p-2 dark:border-white/5 dark:bg-slate-900">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Casual (CL)
            </p>
            <p className="font-mono text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {casual} <span className="text-[9px] font-normal text-slate-400">/ 6</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 dark:border-white/5 dark:bg-slate-900">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Sick (SL)</p>
            <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {sick} <span className="text-[9px] font-normal text-slate-400">/ 6</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2 dark:border-white/5 dark:bg-slate-900">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Earned (EL)
            </p>
            <p className="font-mono text-sm font-extrabold text-purple-600 dark:text-purple-400">
              {earned} <span className="text-[9px] font-normal text-slate-400">/ 12</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
