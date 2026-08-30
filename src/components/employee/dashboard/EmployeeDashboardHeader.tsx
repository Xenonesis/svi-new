'use client';

import React from 'react';
import { RefreshCw, Plus, CalendarDays, FileText, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface EmployeeDashboardHeaderProps {
  greeting: string;
  firstName: string;
  currentTime: Date;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenSubmitLog: () => void;
  onOpenApplyLeave: () => void;
  onOpenAddTask: () => void;
}

export function EmployeeDashboardHeader({
  greeting,
  firstName,
  currentTime,
  refreshing,
  onRefresh,
  onOpenSubmitLog,
  onOpenApplyLeave,
  onOpenAddTask,
}: EmployeeDashboardHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 uppercase dark:text-amber-400">
            <ShieldCheck size={13} />
            Verified Workspace
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {format(currentTime, 'EEEE, dd MMMM yyyy')}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          {greeting}, <span className="text-amber-600 italic dark:text-amber-400">{firstName}</span>
        </h1>
      </div>

      {/* Global Quick Action Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        <button
          type="button"
          onClick={onOpenSubmitLog}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <FileText size={14} className="text-blue-500" />
          <span>Log Shift</span>
        </button>

        <button
          type="button"
          onClick={onOpenApplyLeave}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <CalendarDays size={14} className="text-emerald-500" />
          <span>Request Leave</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddTask}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-amber-400 active:scale-95 dark:bg-amber-400 dark:hover:bg-amber-300"
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}
