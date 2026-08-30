'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceHeaderProps {
  fullName?: string;
  teamName?: string;
  onRefresh: () => void;
}

export function AttendanceHeader({ fullName, teamName, onRefresh }: AttendanceHeaderProps) {
  const todayFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            GPS Attendance Terminal
          </h1>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Live IST
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          {todayFormatted} • Geofence verified shift tracker
        </p>
      </div>

      {/* User Info & Refresh */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        {fullName && (
          <div className="hidden rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-right sm:block dark:border-slate-800 dark:bg-slate-900">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              {fullName}
            </span>
            <span className="block text-[10px] text-slate-400">Team: {teamName || 'TEAM SVI'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onRefresh}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>
    </div>
  );
}
