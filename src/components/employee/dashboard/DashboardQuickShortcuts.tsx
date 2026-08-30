'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, Plus, Zap, ArrowUpRight } from 'lucide-react';

interface DashboardQuickShortcutsProps {
  onOpenLeaveModal?: () => void;
  onOpenLogModal?: () => void;
  onOpenTaskModal?: () => void;
}

export function DashboardQuickShortcuts({
  onOpenLeaveModal,
  onOpenLogModal,
  onOpenTaskModal,
}: DashboardQuickShortcutsProps) {
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
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Quick Action Center
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-semibold">
        {/* Apply Leave Shortcut */}
        {onOpenLeaveModal ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenLeaveModal();
            }}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-blue-500/40 hover:bg-blue-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">Apply Leave</span>
          </button>
        ) : (
          <Link
            href="/employee/attendance/history"
            onClick={triggerHaptic}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-blue-500/40 hover:bg-blue-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">Apply Leave</span>
          </Link>
        )}

        {/* Daily Shift Log Shortcut */}
        {onOpenLogModal ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenLogModal();
            }}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">Daily Log</span>
          </button>
        ) : (
          <Link
            href="/employee/work?tab=logs"
            onClick={triggerHaptic}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">Daily Log</span>
          </Link>
        )}

        {/* New Task Shortcut */}
        {onOpenTaskModal ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onOpenTaskModal();
            }}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-purple-500/40 hover:bg-purple-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-purple-500/40 dark:hover:bg-purple-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">New Task</span>
          </button>
        ) : (
          <Link
            href="/employee/work?tab=tasks"
            onClick={triggerHaptic}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-slate-700 transition-all hover:border-purple-500/40 hover:bg-purple-50/40 active:scale-95 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-purple-500/40 dark:hover:bg-purple-950/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">New Task</span>
          </Link>
        )}
      </div>
    </div>
  );
}
