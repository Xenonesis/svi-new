'use client';

import React from 'react';
import type { PayrollItem } from '@/src/lib/payroll/types';
import { PayslipDocument } from '@/src/components/admin/payroll/PayslipDocument';

export interface PayslipViewModalProps {
  item?: PayrollItem | null;
  viewingPayslipItem?: PayrollItem | null;
  payrollItem?: PayrollItem | null;
  onClose: () => void;
}

export function PayslipViewModal({
  item,
  viewingPayslipItem,
  payrollItem,
  onClose,
}: PayslipViewModalProps) {
  const currentItem = item ?? viewingPayslipItem ?? payrollItem;
  if (!currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <PayslipDocument item={currentItem} onClose={onClose} />
      </div>
    </div>
  );
}
