'use client';

import React from 'react';
import { Palmtree, Plus, History } from 'lucide-react';
import type { LeaveQuota } from './types';

interface LeaveBalancesCardProps {
  quota: LeaveQuota | null;
  onOpenLeaveModal: () => void;
  onOpenRegularizeModal: () => void;
}

export function LeaveBalancesCard({
  quota,
  onOpenLeaveModal,
  onOpenRegularizeModal,
}: LeaveBalancesCardProps) {
  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenLeaveModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" /> Apply For Leave
        </button>

        <button
          onClick={onOpenRegularizeModal}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <History className="h-4 w-4 text-amber-500" /> Regularize Punch
        </button>
      </div>

      {/* Leave Quota Breakdown */}
      {quota && (
        <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Palmtree className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Annual Leave Balance
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Casual Leave */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Casual Leave (CL)</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {quota.casual_total - quota.casual_taken} / {quota.casual_total} left
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${Math.min(100, (quota.casual_taken / quota.casual_total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Sick Leave */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Sick Leave (SL)</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {quota.sick_total - quota.sick_taken} / {quota.sick_total} left
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${Math.min(100, (quota.sick_taken / quota.sick_total) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Earned Leave */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Earned / Privilege Leave</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {quota.earned_total - quota.earned_taken} / {quota.earned_total} left
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${Math.min(100, (quota.earned_taken / quota.earned_total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
