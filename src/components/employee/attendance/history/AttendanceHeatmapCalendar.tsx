'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { clsx } from 'clsx';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';
import type { AttendanceRecord } from './types';

interface AttendanceHeatmapCalendarProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  records: AttendanceRecord[];
  loading: boolean;
  selectedDate?: string | null;
  onSelectDay: (dateStr: string, record: AttendanceRecord | null) => void;
}
export function AttendanceHeatmapCalendar({
  currentMonth,
  onMonthChange,
  records,
  loading,
  selectedDate,
  onSelectDay,
}: AttendanceHeatmapCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Month Navigator Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-[10px] text-slate-400">Daily Attendance Heatmap</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {loading ? (
        <BrandedLoadingState
          className="min-h-[220px] py-6"
          message="Loading Shift Calendar..."
          subMessage="Calculating monthly attendance records"
        />
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Blank prefix days */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="h-12 rounded-xl bg-transparent" />
          ))}

          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const rec = records.find((r) => r.date === dateStr) || null;
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate === dateStr;
            const isSunday = getDay(day) === 0;

            let statusColor =
              'border border-transparent bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-slate-800';

            if (rec) {
              if (rec.status === 'present') {
                statusColor = rec.is_late
                  ? 'border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
              } else if (rec.status === 'half_day') {
                statusColor =
                  'border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300';
              } else if (rec.status === 'leave') {
                statusColor =
                  'border border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300';
              }
            } else if (isSunday) {
              statusColor =
                'border border-transparent bg-slate-50/50 text-slate-400 dark:bg-slate-900/30 dark:text-slate-600';
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                    try {
                      navigator.vibrate(8);
                    } catch {
                      // ignore
                    }
                  }
                  onSelectDay(dateStr, rec);
                }}
                className={clsx(
                  'flex h-12 flex-col items-center justify-center rounded-2xl text-xs transition-all active:scale-95',
                  statusColor,
                  isSelected && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950',
                  isToday &&
                    !isSelected &&
                    'ring-2 ring-[#d98b40] ring-offset-1 dark:ring-offset-slate-950',
                  'cursor-pointer hover:scale-[1.03]'
                )}
              >
                <span
                  className={clsx(
                    'font-semibold',
                    isToday && 'font-black text-[#d98b40] dark:text-[#e5a962]'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {rec ? (
                  <span className="font-mono text-[9px] font-bold opacity-90">
                    {rec.total_hours
                      ? `${Number(rec.total_hours).toFixed(1)}h`
                      : rec.status === 'leave'
                        ? 'Leave'
                        : 'P'}
                  </span>
                ) : isSunday ? (
                  <span className="font-mono text-[8px] font-medium tracking-tight text-slate-400 dark:text-slate-600">
                    OFF
                  </span>
                ) : isToday ? (
                  <span className="font-mono text-[8px] font-bold text-[#d98b40] dark:text-[#e5a962]">
                    TODAY
                  </span>
                ) : (
                  <span className="text-[9px] opacity-0">-</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Late
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Half Day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Leave
        </span>
      </div>
    </div>
  );
}
