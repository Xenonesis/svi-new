'use client';

import React from 'react';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  PhoneCall,
  Navigation,
  FileText,
  Edit2,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { TimesheetRecord } from './types';

interface TimesheetTableProps {
  records: TimesheetRecord[];
  loading: boolean;
  dateFilter: string;
  todayStr: string;
  isCurrentDateToday: boolean;
  hasActiveFilters: boolean;
  onToday: () => void;
  onResetFilters: () => void;
  onViewWorkLog: (rec: TimesheetRecord) => void;
  onEditRecord: (rec: TimesheetRecord) => void;
}

function getInitials(name: string) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TimesheetTable({
  records,
  loading,
  dateFilter,
  todayStr,
  isCurrentDateToday,
  hasActiveFilters,
  onToday,
  onResetFilters,
  onViewWorkLog,
  onEditRecord,
}: TimesheetTableProps) {
  if (loading) {
    return (
      <div className="dark:bg-brand-dark-surface/80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3.5">Staff &amp; Team</th>
                <th className="px-4 py-3.5">Shift Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Punch-In Details</th>
                <th className="px-4 py-3.5">Punch-Out Details</th>
                <th className="px-4 py-3.5">Work Duration</th>
                <th className="px-4 py-3.5">Work Log &amp; Field Activity</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-white/10" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
                        <div className="h-2.5 w-36 rounded-md bg-gray-100 dark:bg-white/5" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-white/10" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                      <div className="h-3 w-24 rounded-md bg-gray-100 dark:bg-white/5" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
                      <div className="h-3 w-20 rounded-md bg-gray-100 dark:bg-white/5" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                      <div className="h-2.5 w-14 rounded-md bg-gray-100 dark:bg-white/5" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                      <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-white/5" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="ml-auto h-7 w-7 rounded-lg bg-gray-200 dark:bg-white/10" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="dark:bg-brand-dark-surface/60 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-white/10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
          <Clock className="text-brand-gold h-7 w-7" />
        </div>
        <h4 className="text-brand-navy mt-4 font-serif text-base font-bold dark:text-white">
          No Attendance Logs Found
        </h4>
        <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
          No employee check-ins or timesheet entries match the selected date (
          {format(new Date(dateFilter || todayStr), 'dd MMM yyyy')}) and active filters.
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          {!isCurrentDateToday && (
            <button
              type="button"
              onClick={onToday}
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy cursor-pointer rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all"
            >
              View Today&apos;s Timesheet
            </button>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="dark:bg-brand-dark-surface cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-brand-dark-surface/80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3.5">Staff &amp; Team</th>
              <th className="px-4 py-3.5">Shift Date</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Punch-In Details</th>
              <th className="px-4 py-3.5">Punch-Out Details</th>
              <th className="px-4 py-3.5">Work Duration</th>
              <th className="px-4 py-3.5">Work Log &amp; Field Activity</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {records.map((rec) => (
              <tr
                key={rec.id}
                className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/2"
              >
                {/* Employee & Team */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="from-brand-gold/30 to-brand-gold/10 text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-serif text-xs font-bold dark:text-white">
                      {getInitials(rec.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-gray-900 dark:text-white">
                        {rec.full_name || 'Staff Member'}
                      </div>
                      <div className="truncate text-[11px] text-gray-400">
                        {rec.email || 'employee'}
                      </div>
                      <span className="mt-0.5 inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {rec.team_name}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                  <div>{format(new Date(rec.date), 'dd MMM yyyy')}</div>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(rec.date), 'EEEE')}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize',
                      rec.status === 'present' &&
                        (rec.is_late
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'),
                      rec.status === 'half_day' &&
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                      rec.status === 'leave' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                      rec.status === 'absent' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                      rec.status === 'pending' && 'bg-gray-500/10 text-gray-500'
                    )}
                  >
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        rec.status === 'present' &&
                          (rec.is_late ? 'bg-amber-500' : 'bg-emerald-500'),
                        rec.status === 'half_day' && 'bg-purple-500',
                        rec.status === 'leave' && 'bg-blue-500',
                        rec.status === 'absent' && 'bg-rose-500',
                        rec.status === 'pending' && 'bg-gray-400'
                      )}
                    />
                    {rec.status === 'present' && (rec.is_late ? 'Late Present' : 'Present')}
                    {rec.status !== 'present' && rec.status.replace('_', ' ')}
                  </span>
                </td>

                {/* Punch In */}
                <td className="px-4 py-3.5">
                  {rec.punch_in_time ? (
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {format(new Date(rec.punch_in_time), 'hh:mm:ss a')}
                      </div>
                      <span
                        className={clsx(
                          'mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                          rec.is_geofence_verified
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {rec.is_geofence_verified ? (
                          <ShieldCheck className="h-2.5 w-2.5" />
                        ) : (
                          <ShieldAlert className="h-2.5 w-2.5" />
                        )}
                        {rec.is_geofence_verified
                          ? `Verified (${rec.geofence_distance_meters ?? 0}m)`
                          : 'Out of Range'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Punch Out */}
                <td className="px-4 py-3.5">
                  {rec.punch_out_time ? (
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {format(new Date(rec.punch_out_time), 'hh:mm:ss a')}
                      </div>
                      <span
                        className={clsx(
                          'mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                          rec.punch_out_geofence_verified
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                        )}
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {rec.punch_out_geofence_verified ? 'Verified' : 'Standard'}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      Shift Active
                    </span>
                  )}
                </td>

                {/* Hours & Punctuality */}
                <td className="px-4 py-3.5">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {rec.total_hours !== null && rec.total_hours !== undefined
                      ? `${rec.total_hours} hrs`
                      : '—'}
                  </div>
                  {rec.is_late ? (
                    <span className="mt-0.5 inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Late Arrival
                    </span>
                  ) : rec.punch_in_time ? (
                    <span className="mt-0.5 inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      On Time ✓
                    </span>
                  ) : null}
                </td>

                {/* Work Log & Field Activity */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rec.work_log.client_calls > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                        <PhoneCall className="h-2.5 w-2.5" />
                        {rec.work_log.client_calls} calls
                      </span>
                    )}
                    {rec.work_log.site_visits > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <Navigation className="h-2.5 w-2.5" />
                        {rec.work_log.site_visits} visits
                      </span>
                    )}
                    {rec.work_log.summary && (
                      <button
                        type="button"
                        onClick={() => onViewWorkLog(rec)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                        title="Read work summary"
                      >
                        <FileText className="h-2.5 w-2.5" />
                        Summary
                      </button>
                    )}
                    {!rec.work_log.summary &&
                      rec.work_log.client_calls === 0 &&
                      rec.work_log.site_visits === 0 && (
                        <span className="text-[11px] text-gray-400">No shift log</span>
                      )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onEditRecord(rec)}
                    className="cursor-pointer rounded-xl border border-gray-200 bg-white p-1.5 text-gray-600 shadow-xs transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-[#161622] dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    title="Edit attendance record"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
