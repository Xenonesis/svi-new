'use client';

import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { AttendanceRecord } from './types';

interface DayDetailCardProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export function DayDetailCard({ record, onClose }: DayDetailCardProps) {
  if (!record) return null;

  return (
    <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-5 dark:border-blue-500/20 dark:bg-blue-950/20">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Record for {format(new Date(record.date), 'EEEE, d MMMM yyyy')}
        </h4>
        <button
          onClick={onClose}
          aria-label="Close record details"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-2xl border border-blue-200/60 bg-white p-3 dark:border-blue-900/40 dark:bg-slate-900/80">
          <span className="text-[10px] text-slate-400">Punch In</span>
          <p className="font-bold text-slate-900 dark:text-white">
            {record.punch_in_time ? format(new Date(record.punch_in_time), 'hh:mm a') : '--:--'}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-white p-3 dark:border-blue-900/40 dark:bg-slate-900/80">
          <span className="text-[10px] text-slate-400">Punch Out</span>
          <p className="font-bold text-slate-900 dark:text-white">
            {record.punch_out_time ? format(new Date(record.punch_out_time), 'hh:mm a') : '--:--'}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-white p-3 dark:border-blue-900/40 dark:bg-slate-900/80">
          <span className="text-[10px] text-slate-400">Total Hours</span>
          <p className="font-bold text-slate-900 dark:text-white">
            {record.total_hours ? `${record.total_hours} hrs` : '--'}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-white p-3 dark:border-blue-900/40 dark:bg-slate-900/80">
          <span className="text-[10px] text-slate-400">Geofence</span>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">
            {record.is_geofence_verified ? 'Verified' : 'Unverified'}
          </p>
        </div>
      </div>
    </div>
  );
}
