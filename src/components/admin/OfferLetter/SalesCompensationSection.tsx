'use client';

import { CircleDollarSign, RefreshCw, Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';

interface SalesCompensationSectionProps {
  department: string;
  designation: string;
  salesCompensationType: string;
  probationPeriod: string;
  noSaleMonths: string;
  subsistenceAllowance: string;
  customSalaryPercent: string;
  meetingsPerMonth: string;
  salaryCtc: string;
  target?: string;
  gracePeriodMonths?: string;
  reducedSalaryPercent?: string;
  enablePartialTargetRule?: boolean | string;
  partialTargetSalaryPercent?: string;
  includeSalesPolicyBox?: boolean;
  onValueChange: (name: string, value: string | boolean) => void;
  onToggleType: (
    type: 'no_sale_no_salary' | 'custom_percent' | 'grace_period_reduced_percent'
  ) => void;
}
export function SalesCompensationSection({
  department,
  designation,
  salesCompensationType,
  probationPeriod,
  noSaleMonths,
  subsistenceAllowance,
  customSalaryPercent,
  meetingsPerMonth,
  salaryCtc,
  target,
  gracePeriodMonths,
  reducedSalaryPercent,
  enablePartialTargetRule,
  partialTargetSalaryPercent,
  includeSalesPolicyBox = true,
  onValueChange,
  onToggleType,
}: SalesCompensationSectionProps) {
  if (department !== 'Sales') return null;

  return (
    <div className="mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white shadow-sm dark:border-white/10 dark:from-white/5 dark:to-transparent">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-gold/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <CircleDollarSign className="text-brand-gold h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              Sales Compensation Policy
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Configure earnings structure for this role
            </p>
          </div>
        </div>

        {/* Manual Show/Hide Box Toggle */}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-xs transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20">
          <input
            type="checkbox"
            checked={includeSalesPolicyBox}
            onChange={(e) => onValueChange('includeSalesPolicyBox', e.target.checked)}
            className="text-brand-gold focus:ring-brand-gold h-3.5 w-3.5 rounded border-gray-300"
          />
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
            {includeSalesPolicyBox ? 'Include Box in Letter' : 'Box Hidden from Letter'}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
              includeSalesPolicyBox
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            {includeSalesPolicyBox ? 'VISIBLE' : 'HIDDEN'}
          </span>
        </label>
      </div>

      {!includeSalesPolicyBox && (
        <div className="border-b border-amber-500/20 bg-amber-500/5 px-5 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-300">
          ⚠️ <strong>Box Hidden:</strong> This entire sales compensation box, borders, and its
          clauses will be omitted from the offer letter preview and generated PDF.
        </div>
      )}
      <div className="p-5">
        {/* Compensation Type — radio cards */}
        <div className="mb-5">
          <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Compensation Type
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* No Sale No Salary card */}
            <button
              type="button"
              onClick={() => onToggleType('no_sale_no_salary')}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                salesCompensationType === 'no_sale_no_salary'
                  ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    salesCompensationType === 'no_sale_no_salary'
                      ? 'border-brand-gold bg-brand-gold'
                      : 'border-gray-300 dark:border-white/20'
                  }`}
                >
                  {salesCompensationType === 'no_sale_no_salary' && (
                    <svg
                      className="text-brand-navy h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${salesCompensationType === 'no_sale_no_salary' ? 'text-brand-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    No Sale No Salary
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                    Allowance-based pay during sales period
                  </p>
                </div>
              </div>
            </button>

            {/* Custom % card */}
            <button
              type="button"
              onClick={() => onToggleType('custom_percent')}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                salesCompensationType === 'custom_percent'
                  ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    salesCompensationType === 'custom_percent'
                      ? 'border-brand-gold bg-brand-gold'
                      : 'border-gray-300 dark:border-white/20'
                  }`}
                >
                  {salesCompensationType === 'custom_percent' && (
                    <svg
                      className="text-brand-navy h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${salesCompensationType === 'custom_percent' ? 'text-brand-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    Custom % of Salary
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                    Fixed percentage guaranteed during probation
                  </p>
                </div>
              </div>
            </button>

            {/* Gestation Window + Adjusted Retainer card */}
            <button
              type="button"
              onClick={() => onToggleType('grace_period_reduced_percent')}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                salesCompensationType === 'grace_period_reduced_percent'
                  ? 'border-brand-gold bg-brand-gold/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#111118] dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    salesCompensationType === 'grace_period_reduced_percent'
                      ? 'border-brand-gold bg-brand-gold'
                      : 'border-gray-300 dark:border-white/20'
                  }`}
                >
                  {salesCompensationType === 'grace_period_reduced_percent' && (
                    <svg
                      className="text-brand-navy h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${salesCompensationType === 'grace_period_reduced_percent' ? 'text-brand-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    Gestation Window + Adjusted Retainer
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                    Baseline retainership during gestation; indexed revision post-tenure
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── No Sale No Salary: Duration + Allowance ── */}
        {salesCompensationType === 'no_sale_no_salary' && (
          <div className="grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 md:grid-cols-2 dark:border-white/10">
            {/* Duration */}
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                Duration
              </label>
              <div className="flex flex-col gap-2.5">
                <select
                  name="noSaleMonths"
                  value={noSaleMonths || ''}
                  onChange={(e) => onValueChange('noSaleMonths', e.target.value)}
                  className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                >
                  <option value="">Select months…</option>
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m.toString()}>
                      {m} {m === 1 ? 'month' : 'months'}
                    </option>
                  ))}
                </select>
                {noSaleMonths && probationPeriod && (
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    until{' '}
                    {(() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + parseInt(noSaleMonths));
                      return d.toISOString().split('T')[0].split('-').reverse().join('-');
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Subsistence Allowance */}
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                Subsistence Allowance
              </label>
              {subsistenceAllowance ? (
                <div className="space-y-2.5">
                  <div className="relative">
                    <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="subsistenceAllowance"
                      value={subsistenceAllowance}
                      onChange={(e) => onValueChange('subsistenceAllowance', e.target.value)}
                      placeholder="10000"
                      min="0"
                      className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-7 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onValueChange('subsistenceAllowance', '10000')}
                      className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 transition-all dark:border-white/10 dark:bg-[#111118] dark:text-gray-400"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reset to ₹10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => onValueChange('subsistenceAllowance', '')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 transition-all hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:bg-[#111118] dark:text-gray-400 dark:hover:border-red-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onValueChange('subsistenceAllowance', '10000')}
                  className="text-brand-gold hover:border-brand-gold hover:bg-brand-gold/5 dark:hover:border-brand-gold dark:hover:bg-brand-gold/10 inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-2.5 text-[11px] font-medium transition-all dark:border-white/20 dark:bg-transparent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add subsistence allowance
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Custom % of Salary ── */}
        {salesCompensationType === 'custom_percent' && (
          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Guaranteed Salary (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="customSalaryPercent"
                    value={customSalaryPercent || ''}
                    onChange={(e) => onValueChange('customSalaryPercent', e.target.value)}
                    placeholder="e.g. 50"
                    min="0"
                    max="100"
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-gray-400">
                    %
                  </span>
                </div>
              </div>
              <div className="flex items-end">
                {customSalaryPercent && salaryCtc && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Guaranteed / month
                      </p>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        ₹
                        {Math.round(
                          (parseFloat(customSalaryPercent) / 100) * parseFloat(salaryCtc)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Grace Period + Reduced %: Duration + Reduced Percent ── */}
        {salesCompensationType === 'grace_period_reduced_percent' && (
          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Grace Duration */}
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Initial Gestation Window (Months)
                </label>
                <div className="flex flex-col gap-2.5">
                  <select
                    name="gracePeriodMonths"
                    value={gracePeriodMonths || ''}
                    onChange={(e) => onValueChange('gracePeriodMonths', e.target.value)}
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                  >
                    <option value="">Select gestation months…</option>
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m.toString()}>
                        {m} {m === 1 ? 'month' : 'months'}
                      </option>
                    ))}
                  </select>
                  {gracePeriodMonths && (
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      Gestation active until{' '}
                      {(() => {
                        const d = new Date();
                        d.setMonth(d.getMonth() + parseInt(gracePeriodMonths));
                        return d.toISOString().split('T')[0].split('-').reverse().join('-');
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Reduced Salary Percentage */}
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Post-Gestation Retainer (% on Sub-Quota Yield)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="reducedSalaryPercent"
                    value={reducedSalaryPercent || ''}
                    onChange={(e) => onValueChange('reducedSalaryPercent', e.target.value)}
                    placeholder="e.g. 50"
                    min="0"
                    max="100"
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-gray-400">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Summary / Calculation Breakdown */}
            {salaryCtc && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase dark:text-blue-400">
                    Phase 1: Initial{' '}
                    {gracePeriodMonths
                      ? `${gracePeriodMonths} Month${parseInt(gracePeriodMonths) > 1 ? 's' : ''} Gestation Window`
                      : 'Gestation Window'}
                  </p>
                  <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    Unabated Baseline Pay:{' '}
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      ₹{parseFloat(salaryCtc || '0').toLocaleString('en-IN')}/month
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase dark:text-amber-400">
                    Phase 2: Month {gracePeriodMonths ? parseInt(gracePeriodMonths) + 1 : 'X'}+
                    (Sub-Quota Yield)
                  </p>
                  <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    {reducedSalaryPercent || '0'}% Adjusted Retainer:{' '}
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      ₹
                      {reducedSalaryPercent && salaryCtc
                        ? Math.round(
                            (parseFloat(reducedSalaryPercent) / 100) * parseFloat(salaryCtc)
                          ).toLocaleString('en-IN')
                        : '0'}
                      /month
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Under-Target & Zero-Sale Condition ── */}
        <div className="border-t border-gray-100 pt-5 dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="enablePartialTargetRule"
                  checked={Boolean(enablePartialTargetRule)}
                  onChange={(e) => onValueChange('enablePartialTargetRule', e.target.checked)}
                  className="text-brand-gold focus:ring-brand-gold/50 h-4 w-4 rounded border-gray-300 dark:border-white/20 dark:bg-[#111118]"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Quota-Indexed Tiered Remuneration &amp; Performance Contingency Matrix
                </span>
              </label>
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                Sub-benchmark realization yields 50% prorated baseline retainership; null-closure
                cycles enforce complete remuneration abeyance ab initio from Month 1.
              </p>
            </div>
          </div>

          {Boolean(enablePartialTargetRule) && (
            <div className="mt-3.5 space-y-3 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-white/10 dark:bg-[#111118]/80">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Tier 1: Target Met */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <span className="inline-block rounded bg-emerald-200/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase dark:bg-emerald-500/20 dark:text-emerald-300">
                    Tier 1 &middot; Benchmark Realization
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                    Full Benchmark Realized
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                    Unabated Baseline:{' '}
                    <span className="font-bold">
                      ₹{parseFloat(salaryCtc || '0').toLocaleString('en-IN')}
                    </span>{' '}
                    + Variable Incentives
                  </p>
                </div>

                {/* Tier 2: Partial Target */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <span className="inline-block rounded bg-amber-200/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase dark:bg-amber-500/20 dark:text-amber-300">
                    Tier 2 &middot; Sub-Benchmark Yield
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                    Sub-Quota Production Yield
                  </p>
                  <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                    50% Baseline Apportionment:{' '}
                    <span className="font-bold">
                      ₹{Math.round(parseFloat(salaryCtc || '0') * 0.5).toLocaleString('en-IN')}
                    </span>
                  </p>
                </div>

                {/* Tier 3: Zero Sales */}
                <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 dark:border-red-500/20 dark:bg-red-500/10">
                  <span className="inline-block rounded bg-red-200/60 px-1.5 py-0.5 text-[9px] font-bold text-red-800 uppercase dark:bg-red-500/20 dark:text-red-300">
                    Tier 3 &middot; Null Production Yield
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-red-900 dark:text-red-200">
                    Zero Transaction Closure
                  </p>
                  <p className="mt-0.5 text-[10px] text-red-700 dark:text-red-300">
                    <span className="font-bold">Remuneration Abeyance</span> (Enforced from Month 1)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Telecaller Monthly Meetings Target ── */}
        {designation === 'Telecaller' && (
          <div className="border-t border-gray-100 pt-5 dark:border-white/10">
            <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Monthly Meetings Target
            </label>
            <p className="mb-2 text-[10px] text-gray-500 dark:text-gray-400">
              Minimum number of meetings the telecaller must complete per month.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="number"
                name="meetingsPerMonth"
                value={meetingsPerMonth || ''}
                onChange={(e) => onValueChange('meetingsPerMonth', e.target.value)}
                placeholder="15"
                min="1"
                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none sm:w-28 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => onValueChange('meetingsPerMonth', '15')}
                className="hover:border-brand-gold hover:text-brand-gold dark:hover:border-brand-gold dark:hover:text-brand-gold inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 transition-all dark:border-white/10 dark:bg-[#111118] dark:text-gray-400"
              >
                <RefreshCw className="h-3 w-3" />
                Reset to 15
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
