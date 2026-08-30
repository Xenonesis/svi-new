'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { LeaveItem } from '@/src/lib/attendance/leaveStore';

interface LeaveApprovalTableProps {
  leaves: LeaveItem[];
  loading: boolean;
  onReview: (leave: LeaveItem, action: 'approved' | 'rejected') => void;
}

export function LeaveApprovalTable({ leaves, loading, onReview }: LeaveApprovalTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates &amp; Duration</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2.5 w-36 rounded-md bg-slate-100 dark:bg-slate-800/60" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2.5 w-16 rounded-md bg-slate-100 dark:bg-slate-800/60" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-18 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="ml-auto flex items-center justify-end gap-1.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <Calendar className="h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          No leave requests found
        </p>
        <p className="text-xs text-slate-400">
          No leave applications match the selected status or query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates &amp; Duration</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {leave.full_name || 'Staff Member'}
                  </div>
                  <div className="text-[11px] text-slate-400">{leave.email || 'employee'}</div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={clsx(
                      'inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                      leave.leave_type === 'casual' &&
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                      leave.leave_type === 'sick' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                      leave.leave_type === 'half_day' &&
                        'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                      leave.leave_type === 'earned' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      leave.leave_type === 'unpaid' &&
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {leave.leave_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {format(new Date(leave.start_date), 'dd MMM yyyy')}
                    {leave.start_date !== leave.end_date && (
                      <> → {format(new Date(leave.end_date), 'dd MMM yyyy')}</>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                  </div>
                </td>
                <td className="max-w-[260px] px-4 py-3.5">
                  <p
                    className="line-clamp-2 text-slate-600 dark:text-slate-300"
                    title={leave.reason}
                  >
                    {leave.reason}
                  </p>
                  {leave.admin_notes && (
                    <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      Note: {leave.admin_notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                      leave.status === 'pending' &&
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      leave.status === 'approved' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      leave.status === 'rejected' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                      leave.status === 'cancelled' && 'bg-slate-500/10 text-slate-500'
                    )}
                  >
                    {leave.status === 'pending' && <Clock className="h-3 w-3" />}
                    {leave.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                    {leave.status === 'rejected' && <XCircle className="h-3 w-3" />}
                    {leave.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {leave.status === 'pending' ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onReview(leave, 'approved')}
                        className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReview(leave, 'rejected')}
                        className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
