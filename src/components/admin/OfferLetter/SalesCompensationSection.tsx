'use client';

import { CircleDollarSign, RefreshCw, Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';

interface SalesCompensationSectionProps {
  department: string;
  salesCompensationType: string;
  probationPeriod: string;
  noSaleMonths: string;
  subsistenceAllowance: string;
  customSalaryPercent: string;
  salaryCtc: string;
  onValueChange: (name: string, value: string) => void;
  onToggleType: (type: 'no_sale_no_salary' | 'custom_percent') => void;
}

export function SalesCompensationSection({
  department,
  salesCompensationType,
  probationPeriod,
  noSaleMonths,
  subsistenceAllowance,
  customSalaryPercent,
  salaryCtc,
  onValueChange,
  onToggleType,
}: SalesCompensationSectionProps) {
  if (department !== 'Sales') return null;

  return (
    <div className="mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white shadow-sm dark:border-white/10 dark:from-white/5 dark:to-transparent">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-3.5 dark:border-white/10">
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
      </div>

      <div className="p-5">
        {/* Compensation Type — radio cards */}
        <div className="mb-5">
          <label className="mb-2 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Compensation Type
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
      </div>
    </div>
  );
}
