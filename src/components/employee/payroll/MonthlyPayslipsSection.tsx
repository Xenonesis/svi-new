'use client';

import React from 'react';
import { Lock, Download, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/src/lib/quotation/format';
import type { EmployeePayrollItem } from './useEmployeePayroll';

export interface MonthlyPayslipsSectionProps {
  payrolls: EmployeePayrollItem[];
  fetchingDetailId: string | null;
  onOpenPayslip: (item: EmployeePayrollItem) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function MonthlyPayslipsSection({
  payrolls,
  fetchingDetailId,
  onOpenPayslip,
}: MonthlyPayslipsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
          Monthly Payslip Records
        </h3>
        <p className="text-xs text-slate-500">
          Official salary slips are generated monthly and released upon Admin / Accounts approval.
        </p>
      </div>

      {payrolls.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800">
          No payroll cycles generated for your profile yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {payrolls.map((p) => {
            const [year, monthNum] = p.month_year.split('-');
            const monthName = MONTH_NAMES[parseInt(monthNum, 10) - 1] || 'Month';

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div>
                  {/* Month Header & Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                        {monthName} {year}
                      </span>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Cycle: {p.total_month_days} Days ({p.working_days} Working)
                      </div>
                    </div>

                    {p.is_downloadable ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Released
                      </span>
                    ) : (
                      <span className="text-brand-gold inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold">
                        <Lock className="h-3.5 w-3.5" /> Pending Release
                      </span>
                    )}
                  </div>

                  {/* Net Salary & Attendance stats */}
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500">Net Take-Home</span>
                      <div className="font-serif text-xl font-black text-slate-900 dark:text-white">
                        {formatINR(p.net_salary)}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500">Attendance</span>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {p.present_days} Present &bull;{' '}
                        <span
                          className={
                            p.lop_days > 0 ? 'font-bold text-red-600 dark:text-red-400' : ''
                          }
                        >
                          {p.lop_days} LOP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions & Incentives Summary */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Deductions: -{formatINR(p.total_deductions)}</span>
                    {p.incentive_bonus > 0 && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Incentive: +{formatINR(p.incentive_bonus)}
                      </span>
                    )}
                  </div>

                  {/* Lock Notice if not released */}
                  {!p.is_downloadable && (
                    <div className="text-brand-gold mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px]">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <span className="font-bold">Payslip Download Locked:</span> Admin has not
                        released the download for this month yet. It will become downloadable once
                        final accounts review is completed.
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {p.is_downloadable ? (
                    <button
                      type="button"
                      onClick={() => onOpenPayslip(p)}
                      disabled={fetchingDetailId === p.id}
                      className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        {fetchingDetailId === p.id
                          ? 'Opening Payslip...'
                          : 'Download Payslip (PDF)'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-3 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Locked by Admin</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
