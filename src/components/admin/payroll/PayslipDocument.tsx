'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { PayrollItem } from '@/src/lib/payroll/types';
import { formatINR } from '@/src/lib/quotation/format';
import { integerToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import { exportToPDF } from '@/src/lib/utils/documentExporter';

interface PayslipDocumentProps {
  item: PayrollItem;
  onClose?: () => void;
}

export function PayslipDocument({ item, onClose }: PayslipDocumentProps) {
  const [downloading, setDownloading] = useState(false);
  const elementId = `payslip-doc-${item.id}`;

  const [year, monthNum] = item.month_year.split('-');
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
  const payPeriodText = `${monthName} ${year}`;

  const netWords = integerToIndianWords(Math.round(item.net_salary || 0));

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const sanitizedName = (item.employee_name || 'Employee').replace(/\s+/g, '_');
      const filename = `Payslip_${sanitizedName}_${item.month_year}.pdf`;

      await exportToPDF({
        elementId,
        filename,
        padding: '24px',
        scale: 2,
        width: '1000px',
      });

      toast.success('Payslip PDF downloaded successfully');
    } catch (err: unknown) {
      console.error('Payslip download error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 print:hidden">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Official Payslip &mdash; {payPeriodText}
          </h3>
          <p className="text-xs text-slate-500">
            {item.employee_name} ({item.employee_email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-white/10 dark:bg-[#181822] dark:text-gray-300"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? 'Exporting PDF...' : 'Download PDF'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable / Exportable Document Body */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div
          id={elementId}
          className="mx-auto w-full max-w-[900px] bg-white p-8 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 dark:border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-32">
                <Image
                  src="/logo.png"
                  alt="SVI Infra Solutions"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  SVI INFRA SOLUTIONS
                </h1>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Real Estate & Infrastructure Development
                </p>
                <p className="text-[10px] text-slate-500">
                  Corporate Office: Sector 62, Noida, UP &bull; Reg. Office: Mathura, Uttar Pradesh
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block rounded-md bg-amber-500/10 px-3 py-1 text-xs font-black tracking-wider text-amber-700 uppercase dark:text-amber-400">
                PAYSLIP
              </div>
              <div className="mt-1 font-serif text-sm font-bold text-slate-900 dark:text-white">
                {payPeriodText}
              </div>
              <div className="text-[10px] text-slate-500">
                Generated on:{' '}
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Employee & Attendance Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800">
            {/* Left Col: Employee Details */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Employee Information
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Name:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-white">
                  {item.employee_name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Email:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300">
                  {item.employee_email}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Department:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300">
                  {item.employee_department || 'General Operations'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Bank Name:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300">
                  {item.bank_name || 'Designated Corporate Bank'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Bank A/C No:</span>
                <span className="col-span-2 font-mono text-slate-700 dark:text-slate-300">
                  {item.account_number ? `•••• •••• ${item.account_number.slice(-4)}` : 'On File'}
                </span>
              </div>
            </div>

            {/* Right Col: Attendance & Period */}
            <div className="space-y-1.5 border-l border-slate-200 pl-4 dark:border-slate-800">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Attendance & Pay Summary
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Total Month Days:</span>
                <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                  {item.total_month_days} Days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Working Days:</span>
                <span className="col-span-2 font-semibold text-slate-900 dark:text-white">
                  {item.working_days} Days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Days Present:</span>
                <span className="col-span-2 font-bold text-emerald-600">
                  {item.present_days} Days {item.half_days > 0 ? `(${item.half_days} Half)` : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Paid Leaves:</span>
                <span className="col-span-2 text-slate-700 dark:text-slate-300">
                  {item.paid_leaves} Days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="font-medium text-slate-500">Loss of Pay (LOP):</span>
                <span className="col-span-2 font-bold text-red-600">{item.lop_days} Days</span>
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 text-xs dark:border-slate-800 dark:bg-slate-800">
            {/* Earnings Column */}
            <div className="bg-white p-4 dark:bg-slate-900">
              <div className="border-b border-slate-100 pb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                Earnings (A)
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Pay</span>
                  <span className="font-mono font-medium">{formatINR(item.basic_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    House Rent Allowance (HRA)
                  </span>
                  <span className="font-mono font-medium">{formatINR(item.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-mono font-medium">{formatINR(item.special_allowance)}</span>
                </div>
                {item.conveyance_allowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Conveyance Allowance</span>
                    <span className="font-mono font-medium">
                      {formatINR(item.conveyance_allowance)}
                    </span>
                  </div>
                )}
                {item.medical_allowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Medical Allowance</span>
                    <span className="font-mono font-medium">
                      {formatINR(item.medical_allowance)}
                    </span>
                  </div>
                )}
                {item.incentive_bonus > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Performance Incentive</span>
                    <span className="font-mono">+{formatINR(item.incentive_bonus)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total Gross Earnings</span>
                <span className="font-mono text-sm">
                  {formatINR(item.gross_earnings + item.incentive_bonus)}
                </span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="bg-white p-4 dark:bg-slate-900">
              <div className="border-b border-slate-100 pb-2 text-xs font-bold tracking-wider text-red-700 uppercase dark:text-red-400">
                Deductions (B)
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Loss of Pay (LOP)</span>
                  <span className="font-mono font-medium text-red-600">
                    {item.lop_deduction > 0 ? `-${formatINR(item.lop_deduction)}` : '₹0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                  <span className="font-mono font-medium">{formatINR(item.professional_tax)}</span>
                </div>
                {item.pf_deduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF)</span>
                    <span className="font-mono font-medium">{formatINR(item.pf_deduction)}</span>
                  </div>
                )}
                {item.esi_deduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">ESI</span>
                    <span className="font-mono font-medium">{formatINR(item.esi_deduction)}</span>
                  </div>
                )}
                {item.tds > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">TDS / Income Tax</span>
                    <span className="font-mono font-medium">{formatINR(item.tds)}</span>
                  </div>
                )}
                {item.advance_deduction > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Advance Salary Adjustment</span>
                    <span className="font-mono">-{formatINR(item.advance_deduction)}</span>
                  </div>
                )}
                {item.other_deductions > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Other Deductions</span>
                    <span className="font-mono">-{formatINR(item.other_deductions)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total Deductions</span>
                <span className="font-mono text-sm text-red-600">
                  -{formatINR(item.total_deductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Big Net Salary Banner */}
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                  Net Salary Payable (Gross &minus; Deductions)
                </span>
                <div className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                  {formatINR(item.net_salary)}
                </div>
              </div>
              <div className="text-right sm:max-w-xs">
                <div className="text-[10px] tracking-wider text-slate-500 uppercase">
                  Amount in Words
                </div>
                <div className="text-xs font-semibold text-slate-700 capitalize dark:text-slate-300">
                  Rupees {netWords} Only
                </div>
              </div>
            </div>
          </div>

          {/* Remarks note if any */}
          {item.remarks && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <span className="font-bold">Remarks:</span> {item.remarks}
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="mt-12 grid grid-cols-2 items-end border-t border-slate-200 pt-6 text-xs dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Digitally Verified & Generated
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                This is a computer-generated payslip and requires no physical signature.
              </p>
            </div>

            <div className="text-right">
              <div className="font-serif font-bold text-slate-900 dark:text-white">
                For SVI Infra Solutions
              </div>
              <div className="mt-8 border-t border-dashed border-slate-300 pt-1 text-[11px] text-slate-500 dark:border-slate-700">
                Authorized HR / Accounts Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
