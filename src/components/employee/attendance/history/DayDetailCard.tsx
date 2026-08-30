'use client';

import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { AttendanceRecord } from './types';

interface DayDetailCardProps {
  dateStr: string | null;
  record: AttendanceRecord | null;
  onClose: () => void;
  onOpenRegularizeModal?: () => void;
  onOpenLeaveModal?: () => void;
}

export function DayDetailCard({
  dateStr,
  record,
  onClose,
  onOpenRegularizeModal,
  onOpenLeaveModal,
}: DayDetailCardProps) {
  if (!dateStr) return null;

  const formattedDate = format(new Date(dateStr), 'EEEE, d MMMM yyyy');

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all sm:p-6 dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{formattedDate}</h4>
          {record && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                record.status === 'present'
                  ? record.is_late
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : record.status === 'leave'
                    ? 'border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
            >
              {record.status === 'present' && record.is_late ? 'Late Arrival' : record.status}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close record details"
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {record ? (
        <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-slate-950/40">
            <span className="text-[10px] font-medium text-slate-400">Punch In</span>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
              {record.punch_in_time ? format(new Date(record.punch_in_time), 'hh:mm a') : '--:--'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-slate-950/40">
            <span className="text-[10px] font-medium text-slate-400">Punch Out</span>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
              {record.punch_out_time ? format(new Date(record.punch_out_time), 'hh:mm a') : '--:--'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-slate-950/40">
            <span className="text-[10px] font-medium text-slate-400">Total Duration</span>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
              {record.total_hours ? `${Number(record.total_hours).toFixed(1)} hrs` : '--'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-white/5 dark:bg-slate-950/40">
            <span className="text-[10px] font-medium text-slate-400">Geofence GPS</span>
            <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {record.is_geofence_verified ? 'Verified Zone' : 'Standard'}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs sm:flex-row dark:border-slate-800 dark:bg-slate-950/20">
          <p className="text-slate-500 dark:text-slate-400">
            No attendance shift record logged for this date.
          </p>
          <div className="flex items-center gap-2">
            {onOpenRegularizeModal && (
              <button
                onClick={onOpenRegularizeModal}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-300"
              >
                Regularize Punch
              </button>
            )}
            {onOpenLeaveModal && (
              <button
                onClick={onOpenLeaveModal}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all hover:bg-blue-500/20 active:scale-95 dark:text-blue-300"
              >
                Apply Leave
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
