'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, AlertCircle, Building, Info } from 'lucide-react';

export function ShiftGuidelinesCard() {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
        Shift Guidelines & Timing Rules
      </h3>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Official Shift Window</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">09:00 AM – 06:00 PM</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Late Arrival Threshold</span>
          </div>
          <span className="font-semibold text-amber-600 dark:text-amber-400">After 09:30 AM</span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Building className="h-4 w-4 text-emerald-500" />
            <span>Geofenced Base Locations</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            SVI Head Office & Sites
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Info className="h-4 w-4 text-purple-500" />
            <span>Missed a Punch?</span>
          </div>
          <Link
            href="/employee/attendance/history"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Apply for Regularization →
          </Link>
        </div>
      </div>
    </div>
  );
}
