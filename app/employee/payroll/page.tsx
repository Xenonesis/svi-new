'use client';

import React, { useState, useEffect } from 'react';
import { Banknote, Lock, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase/client';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { PayslipDocument } from '@/src/components/admin/payroll/PayslipDocument';
import { BrandedLoadingState } from '@/src/components/employee/BrandedLoadingState';

interface EmployeePayrollOverviewData {
  salaryStructure: SalaryStructure | null;
  payrolls: Array<PayrollItem & { is_downloadable: boolean; status_message: string }>;
}

export default function EmployeePayrollPage() {
  const [data, setData] = useState<EmployeePayrollOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingPayslipItem, setViewingPayslipItem] = useState<PayrollItem | null>(null);
  const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error('Session expired. Please log in.');
        return;
      }

      const res = await fetch('/api/employee/payroll', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to fetch payroll records');
      }

      setData(resData);
    } catch (err: unknown) {
      console.error(err);
      toast.error(extractApiErrorMessage(err, 'Error loading payroll details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenPayslip = async (item: PayrollItem & { is_downloadable: boolean }) => {
    if (!item.is_downloadable) {
      toast.error('Payslip download is strictly locked until allowed by Admin.');
      return;
    }

    setFetchingDetailId(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`/api/employee/payroll/${item.id}/payslip`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const detailData = await res.json();
      if (!res.ok || detailData.locked) {
        throw new Error(detailData.message || 'Download not allowed yet by Admin');
      }

      setViewingPayslipItem(detailData.item);
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Failed to load payslip'));
    } finally {
      setFetchingDetailId(null);
    }
  };

  const struct = data?.salaryStructure;
  const payrolls = data?.payrolls || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <div className="text-brand-gold text-[11px] font-bold tracking-wider uppercase">
          SVI Infra Employee Workspace
        </div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          <Banknote className="text-brand-gold h-7 w-7" />
          My Compensation{' '}
          <span className="text-gradient-gold inline-block pr-2.5 italic">& Payslips</span>
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Transparent monthly compensation structure, attendance LOP metrics, and official payslips.
        </p>
      </div>

      {loading ? (
        <BrandedLoadingState
          message="Loading Payroll Details..."
          subMessage="Retrieving salary structure and approved payslips"
        />
      ) : (
        <>
          {/* Salary Structure Card */}
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

          {/* Monthly Payslips Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Monthly Payslip Records
              </h3>
              <p className="text-xs text-slate-500">
                Official salary slips are generated monthly and released upon Admin / Accounts
                approval.
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
                  const monthNames = [
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
                  const monthName = monthNames[parseInt(monthNum, 10) - 1] || 'Month';

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
                              <span className="font-bold">Payslip Download Locked:</span> Admin has
                              not released the download for this month yet. It will become
                              downloadable once final accounts review is completed.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {p.is_downloadable ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPayslip(p)}
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
        </>
      )}

      {/* Payslip Modal when unlocked */}
      {viewingPayslipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <PayslipDocument
              item={viewingPayslipItem}
              onClose={() => setViewingPayslipItem(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
