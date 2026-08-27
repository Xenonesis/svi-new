'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Sparkles,
  Edit2,
  FileText,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { MonthlyPayroll, PayrollItem } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { PayrollAdjustmentsModal } from './PayrollAdjustmentsModal';

interface MonthlyPayrollRunViewProps {
  token: string;
  onViewPayslip: (item: PayrollItem) => void;
}

export function MonthlyPayrollRunView({ token, onViewPayslip }: MonthlyPayrollRunViewProps) {
  const currentMonthYear = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const [selectedMonthYear, setSelectedMonthYear] = useState(currentMonthYear);
  const [payroll, setPayroll] = useState<MonthlyPayroll | null>(null);
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<PayrollItem | null>(null);
  const [togglingDownload, setTogglingDownload] = useState(false);

  const fetchPayroll = async (monthYear: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const listRes = await fetch('/api/admin/payroll/monthly', { headers });
      const listData = await listRes.json();
      const matched = (listData.payrolls || []).find(
        (p: MonthlyPayroll) => p.month_year === monthYear
      );

      if (matched) {
        const detailRes = await fetch(`/api/admin/payroll/monthly/${matched.id}`, { headers });
        const detailData = await detailRes.json();
        setPayroll(detailData.payroll || null);
        setItems(detailData.items || []);
      } else {
        setPayroll(null);
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonthYear);
  }, [selectedMonthYear, token]);

  const handleCalculatePayroll = async () => {
    setCalculating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/payroll/monthly/calculate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ month_year: selectedMonthYear }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to calculate payroll');
      }

      toast.success(data.message || 'Payroll calculated from attendance successfully');
      setPayroll(data.payroll);
      setItems(data.items);
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Calculation error'));
      setCalculating(false);
    }
  };

  const handleToggleDownloadAll = async (allow: boolean) => {
    if (!payroll) return;
    const action = allow ? 'RELEASE / ALLOW' : 'LOCK';
    if (
      !confirm(
        `Are you sure you want to ${action} payslip downloads for ALL employees for ${payroll.month_year}?`
      )
    ) {
      return;
    }

    setTogglingDownload(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/payroll/monthly/${payroll.id}/toggle-download`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ allowAll: true, allow }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update download permissions');

      toast.success(data.message);
      setPayroll((prev) => (prev ? { ...prev, allow_payslip_download: allow } : prev));
      setItems((prev) => prev.map((item) => ({ ...item, is_download_allowed: allow })));
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Permission update error'));
    }
  };

  const handleToggleSingleDownload = async (item: PayrollItem, newAllow: boolean) => {
    if (!payroll) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/payroll/monthly/${payroll.id}/toggle-download`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ itemId: item.id, allow: newAllow }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update permission');

      toast.success(`${item.employee_name}: Payslip ${newAllow ? 'unlocked' : 'locked'}`);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_download_allowed: newAllow } : i))
      );
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Permission update error'));
    }
  };

  // Aggregations
  const totalNet = items.reduce((sum, i) => sum + (i.net_salary || 0), 0);
  const totalLop = items.reduce((sum, i) => sum + (i.lop_deduction || 0), 0);
  const totalIncentives = items.reduce((sum, i) => sum + (i.incentive_bonus || 0), 0);
  const unlockedCount = items.filter(
    (i) => i.is_download_allowed || payroll?.allow_payslip_download
  ).length;

  return (
    <div className="space-y-6">
      {/* Month Selection and Quick Action Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111118]">
        <div className="flex items-center gap-3">
          <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Select Payroll Cycle
            </label>
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="focus:border-brand-gold mt-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCalculatePayroll}
            disabled={calculating}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
            <span>{payroll ? 'Recalculate Attendance Payroll' : 'Run Monthly Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Net Payout */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Total Net Salary Payout
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {formatINR(totalNet)}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">For {items.length} active employees</p>
        </div>

        {/* Attendance LOP Deductions */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Attendance LOP Deducted
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-serif text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
            {formatINR(totalLop)}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">
            Automatically deducted from absent shifts
          </p>
        </div>

        {/* Incentives / Bonuses */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Incentives & Bonuses
            </span>
            <div className="bg-brand-gold/10 text-brand-gold flex h-8 w-8 items-center justify-center rounded-xl">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-brand-gold mt-3 font-serif text-2xl font-black tracking-tight">
            +{formatINR(totalIncentives)}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">Performance & sales rewards added</p>
        </div>

        {/* Master Payslip Download Access */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#111118]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Payslip Download Access
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                payroll?.allow_payslip_download
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'text-brand-gold bg-amber-500/10'
              }`}
            >
              {payroll?.allow_payslip_download ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-sm font-black ${
                payroll?.allow_payslip_download
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {payroll?.allow_payslip_download
                ? 'RELEASED (ALL EMPLOYEES)'
                : `${unlockedCount} of ${items.length} Unlocked`}
            </span>
          </div>

          {payroll && (
            <button
              type="button"
              disabled={togglingDownload}
              onClick={() => handleToggleDownloadAll(!payroll.allow_payslip_download)}
              className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                payroll.allow_payslip_download
                  ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-400'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400'
              }`}
            >
              {payroll.allow_payslip_download ? (
                <>
                  <Lock className="h-3.5 w-3.5" /> Lock All Downloads
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5" /> Allow All Downloads
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Itemized Employee Payroll Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-[#111118]">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <h3 className="font-serif text-sm font-bold text-gray-900 dark:text-white">
              Employee Salary Breakdown & Attendance Linkage
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Review present days, calculated LOP deductions, bonuses, and manage individual
              download gating.
            </p>
          </div>
          {payroll && (
            <span className="bg-brand-gold/10 text-brand-gold rounded-full px-3 py-1 text-[11px] font-semibold">
              Cycle: {payroll.month_year}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5 text-center">Attendance (Present/LOP)</th>
                <th className="px-4 py-3.5 text-right">Gross Salary</th>
                <th className="px-4 py-3.5 text-right">LOP Deduction</th>
                <th className="px-4 py-3.5 text-right">Incentive</th>
                <th className="px-4 py-3.5 text-right">Net Payable</th>
                <th className="px-4 py-3.5 text-center">Download Access</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                    Loading monthly payroll...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                    No payroll generated for {selectedMonthYear}. Click &quot;Run Monthly
                    Payroll&quot; above to auto-calculate from attendance.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDownloadAllowed =
                    item.is_download_allowed || payroll?.allow_payslip_download;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/3"
                    >
                      {/* Employee info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.employee_name}
                        </div>
                        <div className="text-[11px] text-gray-500">{item.employee_email}</div>
                        {item.employee_department && (
                          <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {item.employee_department}
                          </span>
                        )}
                      </td>

                      {/* Attendance metrics */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="font-medium text-gray-900 dark:text-white">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {item.present_days}
                            </span>{' '}
                            / {item.working_days} Days
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {item.half_days > 0 && `${item.half_days} Half • `}
                            {item.paid_leaves > 0 && `${item.paid_leaves} Leaves • `}
                            <span
                              className={
                                item.lop_days > 0 ? 'font-bold text-red-600 dark:text-red-400' : ''
                              }
                            >
                              {item.lop_days} LOP
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gross */}
                      <td className="px-4 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                        {formatINR(item.gross_earnings)}
                      </td>

                      {/* LOP Deduction */}
                      <td className="px-4 py-4 text-right font-mono">
                        {item.lop_deduction > 0 ? (
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            -{formatINR(item.lop_deduction)}
                          </span>
                        ) : (
                          <span className="text-gray-400">₹0</span>
                        )}
                      </td>

                      {/* Incentive */}
                      <td className="px-4 py-4 text-right font-mono">
                        {item.incentive_bonus > 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            +{formatINR(item.incentive_bonus)}
                          </span>
                        ) : (
                          <span className="text-gray-400">₹0</span>
                        )}
                      </td>

                      {/* Net Salary */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-mono text-sm font-black text-gray-900 dark:text-white">
                          {formatINR(item.net_salary)}
                        </span>
                      </td>

                      {/* Individual Download Permission Switch */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleSingleDownload(item, !item.is_download_allowed)
                          }
                          title={
                            isDownloadAllowed
                              ? 'Click to lock download for this employee'
                              : 'Click to allow download for this employee'
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                            isDownloadAllowed
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                              : 'text-brand-gold border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20'
                          }`}
                        >
                          {isDownloadAllowed ? (
                            <>
                              <Unlock className="h-3 w-3" />
                              <span>Allowed</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              <span>Locked</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedItemForAdjust(item)}
                            title="Adjust incentive bonus, advance salary, or notes"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewPayslip(item)}
                            title="View official SVI Infra Payslip"
                            className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 rounded-lg p-1.5"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustments Modal */}
      {selectedItemForAdjust && payroll && (
        <PayrollAdjustmentsModal
          item={selectedItemForAdjust}
          payrollId={payroll.id}
          isOpen={!!selectedItemForAdjust}
          onClose={() => setSelectedItemForAdjust(null)}
          onSaved={() => fetchPayroll(selectedMonthYear)}
          token={token}
        />
      )}
    </div>
  );
}
