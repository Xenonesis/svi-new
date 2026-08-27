'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { PayrollItem } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

interface PayrollAdjustmentsModalProps {
  item: PayrollItem | null;
  payrollId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  token: string;
}

export function PayrollAdjustmentsModal({
  item,
  payrollId,
  isOpen,
  onClose,
  onSaved,
  token,
}: PayrollAdjustmentsModalProps) {
  const [incentiveBonus, setIncentiveBonus] = useState('');
  const [advanceDeduction, setAdvanceDeduction] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid' | 'hold'>(
    'pending'
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setIncentiveBonus(item.incentive_bonus ? String(item.incentive_bonus) : '');
      setAdvanceDeduction(item.advance_deduction ? String(item.advance_deduction) : '');
      setOtherDeductions(item.other_deductions ? String(item.other_deductions) : '');
      setRemarks(item.remarks || '');
      setPaymentStatus(item.payment_status || 'pending');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const numIncentive = parseFloat(incentiveBonus) || 0;
  const numAdvance = parseFloat(advanceDeduction) || 0;
  const numOther = parseFloat(otherDeductions) || 0;

  // Base gross - standard deductions
  const standardDeductions =
    item.lop_deduction + item.pf_deduction + item.esi_deduction + item.professional_tax + item.tds;

  const updatedTotalDeductions = standardDeductions + numAdvance + numOther;
  const updatedNetSalary = Math.max(
    0,
    Math.round(item.gross_earnings - updatedTotalDeductions + numIncentive)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/payroll/monthly/${payrollId}/item/${item.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          incentive_bonus: numIncentive,
          advance_deduction: numAdvance,
          other_deductions: numOther,
          remarks: remarks.trim() || null,
          payment_status: paymentStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update adjustments');
      }

      toast.success(`Adjustments saved for ${item.employee_name}`);
      onSaved();
      onClose();
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Error updating adjustments'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111118]"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                Adjust Payroll & Incentives
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.employee_name} ({item.employee_email}) &bull; {item.month_year}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Incentive Bonus */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" /> Performance / Sales Incentive (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={incentiveBonus}
                onChange={(e) => setIncentiveBonus(e.target.value)}
                className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-900 shadow-2xs focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Added directly to gross take-home pay.
              </p>
            </div>

            {/* Advance Salary Deduction */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  Advance Salary Deduction (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={advanceDeduction}
                  onChange={(e) => setAdvanceDeduction(e.target.value)}
                  className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  Other Deductions (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
                />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as 'pending' | 'processing' | 'paid' | 'hold')
                }
                className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="hold">On Hold</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Admin Notes / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sales quota overachieved, festival bonus included"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="focus:border-brand-gold mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 focus:outline-none dark:border-white/10 dark:bg-[#181822] dark:text-white"
              />
            </div>

            {/* Updated Net Pay Card */}
            <div className="border-brand-gold/30 bg-brand-gold/5 rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-brand-gold text-[11px] font-bold tracking-wider uppercase">
                    Revised Net Salary
                  </span>
                  <div className="font-serif text-xl font-black text-gray-900 dark:text-white">
                    {formatINR(updatedNetSalary)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  <div>Previous: {formatINR(item.net_salary)}</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Incentive: +{formatINR(numIncentive)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Apply Adjustments'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
