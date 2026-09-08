'use client';

import React from 'react';
import type { SalaryStructure } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';

export interface SalaryStructureCardProps {
  struct: SalaryStructure | null;
}

export function SalaryStructureCard({ struct }: SalaryStructureCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <span className="text-brand-gold text-[11px] font-bold tracking-wider uppercase">
            Agreed Remuneration
          </span>
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Monthly Base Compensation
          </h2>
        </div>
        <div className="text-right">
          <span className="font-serif text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
            {struct ? formatINR(struct.base_salary) : '—'}
          </span>
          <div className="text-[11px] text-slate-400">Monthly Gross / CTC</div>
        </div>
      </div>

      {struct ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
            <span className="text-[11px] font-medium text-slate-500">Basic Pay</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
              {formatINR(struct.basic_pay)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
            <span className="text-[11px] font-medium text-slate-500">HRA (30%)</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
              {formatINR(struct.hra)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
            <span className="text-[11px] font-medium text-slate-500">Special Allowance</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
              {formatINR(struct.special_allowance)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
            <span className="text-[11px] font-medium text-slate-500">Bank Account</span>
            <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
              {struct.bank_name
                ? `${struct.bank_name} (••${struct.account_number?.slice(-4)})`
                : 'On File'}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-xs text-slate-500 dark:border-slate-800">
          Your salary structure is currently being updated by the Accounts department.
        </div>
      )}
    </div>
  );
}
