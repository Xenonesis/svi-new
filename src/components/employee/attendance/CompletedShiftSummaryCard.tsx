'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AttendanceStatusResponse } from './types';

interface CompletedShiftSummaryCardProps {
  statusData: AttendanceStatusResponse;
}

export function CompletedShiftSummaryCard({ statusData }: CompletedShiftSummaryCardProps) {
  if (
    statusData.status !== 'punched_out' ||
    (!statusData.summary_text && !statusData.total_hours)
  ) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-blue-200/80 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
          Today&apos;s Shift Completed
        </h3>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Duty Hours</span>
          <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
            {statusData.total_hours ? `${statusData.total_hours.toFixed(2)} hrs` : 'Completed'}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Client Meetings</span>
          <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
            {statusData.client_interactions_count || 0} interactions
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-3 dark:border-blue-900/30 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Site Visits Done</span>
          <p className="mt-1 font-mono text-sm font-black text-slate-900 dark:text-white">
            {statusData.site_visits_conducted_count || 0} visits
          </p>
        </div>
      </div>
      {statusData.summary_text && (
        <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-3.5 dark:border-blue-900/30 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Work Log / Summary</span>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
            {statusData.summary_text}
          </p>
        </div>
      )}
    </div>
  );
}
