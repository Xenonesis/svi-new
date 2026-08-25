'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, Plus } from 'lucide-react';

export function DashboardQuickShortcuts() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h3 className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
        Quick Shortcuts
      </h3>
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <Link
          href="/employee/attendance/history"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <CalendarDays className="h-4 w-4 text-blue-500" />
          <span className="text-[11px]">Apply Leave</span>
        </Link>
        <Link
          href="/employee/work?tab=logs"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <FileText className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px]">Daily Log</span>
        </Link>
        <Link
          href="/employee/work?tab=tasks"
          className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 text-purple-500" />
          <span className="text-[11px]">New Task</span>
        </Link>
      </div>
    </div>
  );
}
