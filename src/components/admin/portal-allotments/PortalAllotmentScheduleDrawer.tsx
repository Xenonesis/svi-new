'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { AllotmentRecord, PaymentScheduleItem } from './types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';

export interface PortalAllotmentScheduleDrawerProps {
  isExpanded: boolean;
  allotment?: AllotmentRecord;
  paymentSchedules?: PaymentScheduleItem[];
  receipts?: SavedReceipt[];
  onToggleStatus?: (paymentId: string, currentStatus: string) => Promise<void> | void;
  onTogglePaymentStatus?: (paymentId: string, currentStatus: string) => Promise<void> | void;
  onSelectReceipt?: (receipt: SavedReceipt) => void;
  onShareWhatsApp?: (receipt: SavedReceipt) => void;
}

export function PortalAllotmentScheduleDrawer({
  isExpanded,
  allotment,
  paymentSchedules = [],
  receipts = [],
  onToggleStatus,
  onTogglePaymentStatus,
  onSelectReceipt,
  onShareWhatsApp,
}: PortalAllotmentScheduleDrawerProps) {
  const t = useTranslations('pages.adminPortalAllotments');
  const handleToggle = onToggleStatus || onTogglePaymentStatus;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodBadgeStyle = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('upi')) {
      return 'border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400';
    }
    if (m.includes('cash')) {
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
    if (m.includes('cheque') || m.includes('dd') || m.includes('check')) {
      return 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }
    if (
      m.includes('bank') ||
      m.includes('neft') ||
      m.includes('rtgs') ||
      m.includes('imps') ||
      m.includes('online')
    ) {
      return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
    return 'border-gray-300 bg-gray-100 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300';
  };

  const formatDateDisplay = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Combine or select display rows:
  // If we have actual SavedReceipts, use them.
  // Also include any payment_schedules that are not covered by receipts.
  const hasReceipts = receipts && receipts.length > 0;
  const hasSchedules = paymentSchedules && paymentSchedules.length > 0;

  const totalPaidCount = hasReceipts
    ? receipts.length
    : paymentSchedules.filter((p) => p.status === 'paid').length;
  const totalItemsCount = hasReceipts ? receipts.length : paymentSchedules.length;

  const fallbackRefId =
    allotment?.metadata?.ticket_id ||
    allotment?.metadata?.ticketId ||
    'SVI' + (allotment?.id?.slice(0, 4) || '');

  const fallbackClientName =
    allotment?.profiles?.full_name || (allotment?.metadata?.client_name as string) || 'Client';

  const fallbackPlotNo =
    allotment?.unit_no ||
    allotment?.unit_number ||
    (allotment?.metadata?.plot_no as string) ||
    'NA';

  const fallbackPlotSize = allotment?.metadata?.area || allotment?.area || 'NA';

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-6 rounded-2xl border border-gray-200/80 bg-slate-900 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1626]">
            {/* Header with Title and Counts */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="text-brand-gold h-4 w-4" />
                <h4 className="font-serif text-base font-bold tracking-tight text-white">
                  {t('paymentSchedule')}
                </h4>
              </div>
              <span className="bg-brand-gold/10 border-brand-gold/25 text-brand-gold rounded-full border px-3 py-1 font-mono text-xs font-semibold">
                {totalPaidCount} {t('ofLabel')} {totalItemsCount} {t('paidLabel')}
              </span>
            </div>

            {/* If no receipts and no schedules */}
            {!hasReceipts && !hasSchedules ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('noPaymentSchedules')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] font-sans text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      {[
                        { label: 'RECEIPT NO', align: 'text-left' },
                        { label: 'REF ID', align: 'text-left' },
                        { label: 'CLIENT NAME', align: 'text-left' },
                        { label: 'DATE', align: 'text-left' },
                        { label: 'AMOUNT', align: 'text-right' },
                        { label: 'METHOD', align: 'text-center' },
                        { label: 'PLOT INFO', align: 'text-left' },
                        { label: 'ACTIONS', align: 'text-right' },
                      ].map((h) => (
                        <th
                          key={h.label}
                          className={`px-4 py-3 text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase ${h.align}`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Render matching official SavedReceipts if available */}
                    {hasReceipts &&
                      receipts.map((receipt) => {
                        const receiptNo = receipt.form_data?.receiptNo;
                        const refId = receipt.form_data?.refId || fallbackRefId;
                        const clientName = receipt.form_data?.name || fallbackClientName;
                        const amountVal = parseFloat(receipt.form_data?.amount || '0');
                        const formattedAmount = !isNaN(amountVal)
                          ? amountVal.toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
                            })
                          : `₹${receipt.form_data?.amount || 0}`;

                        const dateStr = receipt.form_data?.date || receipt.created_at;
                        const paymentMethod = receipt.form_data?.paymentMethod || 'UPI';
                        const plotNo = receipt.form_data?.plotNo || fallbackPlotNo;
                        const plotSize = receipt.form_data?.plotSize || fallbackPlotSize;
                        const bank = receipt.form_data?.drawnOn || receipt.form_data?.account;

                        const isCopiedReceipt = receiptNo && copiedKey === `rec-${receipt.id}`;
                        const isCopiedRef = refId && copiedKey === `ref-${receipt.id}`;

                        return (
                          <tr
                            key={receipt.id}
                            className="group transition-colors hover:bg-white/[0.03]"
                          >
                            {/* Receipt No */}
                            <td className="px-4 py-3 align-middle">
                              {receiptNo ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(receiptNo, `rec-${receipt.id}`, e)}
                                  className="group/copy border-brand-gold/30 bg-brand-gold/10 hover:bg-brand-gold/20 hover:border-brand-gold/50 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold text-amber-400 transition-all"
                                  title="Click to copy receipt number"
                                >
                                  <span>{receiptNo}</span>
                                  {isCopiedReceipt ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3 opacity-40 transition-opacity group-hover/copy:opacity-100" />
                                  )}
                                </button>
                              ) : (
                                <span className="font-mono text-gray-500">—</span>
                              )}
                            </td>

                            {/* Ref ID */}
                            <td className="px-4 py-3 align-middle">
                              <div className="inline-flex items-center gap-1">
                                <span className="inline-flex items-center rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 font-mono text-[11px] font-bold text-sky-400">
                                  {refId}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(refId, `ref-${receipt.id}`, e)}
                                  className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-sky-400"
                                  title="Click to copy Ref ID"
                                >
                                  {isCopiedRef ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3 opacity-40 transition-opacity hover:opacity-100" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Client Name */}
                            <td className="px-4 py-3 align-middle">
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-white capitalize">
                                  {clientName}
                                </div>
                                {bank && (
                                  <div className="truncate text-[10px] text-gray-400">
                                    Bank: {bank}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-mono text-[11px] font-medium text-gray-200 tabular-nums">
                                  {formatDateDisplay(dateStr)}
                                </span>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3 text-right align-middle font-mono text-xs font-bold text-white tabular-nums">
                              {formattedAmount}
                            </td>

                            {/* Method */}
                            <td className="px-4 py-3 text-center align-middle">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap uppercase ${getMethodBadgeStyle(
                                  paymentMethod
                                )}`}
                              >
                                <CreditCard className="h-2.5 w-2.5 opacity-70" />
                                {paymentMethod}
                              </span>
                            </td>

                            {/* Plot Info */}
                            <td className="px-4 py-3 align-middle">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-200">
                                  Plot {plotNo}
                                </span>
                                {plotSize && (
                                  <span className="text-[11px] whitespace-nowrap text-gray-400">
                                    ({plotSize} Sq. Yds.)
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right align-middle">
                              <div className="flex items-center justify-end gap-1">
                                {onSelectReceipt && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectReceipt(receipt)}
                                    className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                                    title="View & Print Payment Receipt"
                                    aria-label="View & Print"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <Link
                                  href={`/admin/payment-receipt?templateId=${receipt.id}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400 active:scale-95"
                                  title="Use as Template"
                                  aria-label="Use as Template"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      'emailPrefillRecord',
                                      JSON.stringify(receipt)
                                    );
                                    window.location.href =
                                      '/admin/email?tab=compose&prefillReceipt=true';
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 active:scale-95"
                                  title="Email Receipt to Client"
                                  aria-label="Email Receipt"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </button>
                                {onShareWhatsApp && (
                                  <button
                                    type="button"
                                    onClick={() => onShareWhatsApp(receipt)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95"
                                    title="Share via WhatsApp"
                                    aria-label="Share via WhatsApp"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {/* If no official receipts exist yet, or to show payment schedules in the exact same format */}
                    {!hasReceipts &&
                      paymentSchedules.map((payment, idx) => {
                        const milestoneTitle =
                          payment.milestone_name || payment.title || `Installment #${idx + 1}`;
                        const amountVal = Number(payment.amount) || 0;
                        const formattedAmount = !isNaN(amountVal)
                          ? amountVal.toLocaleString('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
                            })
                          : `₹${payment.amount}`;

                        const dateStr = payment.paid_date || payment.due_date;
                        const isPaid = payment.status === 'paid';

                        return (
                          <tr
                            key={payment.id}
                            className="group transition-colors hover:bg-white/[0.03]"
                          >
                            {/* Receipt / Schedule No */}
                            <td className="px-4 py-3 align-middle">
                              <span className="border-brand-gold/30 bg-brand-gold/10 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold text-amber-400">
                                #{idx + 1}
                              </span>
                            </td>

                            {/* Ref ID */}
                            <td className="px-4 py-3 align-middle">
                              <span className="inline-flex items-center rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 font-mono text-[11px] font-bold text-sky-400">
                                {fallbackRefId}
                              </span>
                            </td>

                            {/* Client Name & Milestone */}
                            <td className="px-4 py-3 align-middle">
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-white capitalize">
                                  {fallbackClientName}
                                </div>
                                <div className="truncate text-[10px] text-gray-400">
                                  {milestoneTitle}
                                </div>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-mono text-[11px] font-medium text-gray-200 tabular-nums">
                                  {formatDateDisplay(dateStr)}
                                </span>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3 text-right align-middle font-mono text-xs font-bold text-white tabular-nums">
                              {formattedAmount}
                            </td>

                            {/* Method / Schedule Type */}
                            <td className="px-4 py-3 text-center align-middle">
                              <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                                <CreditCard className="h-2.5 w-2.5 opacity-70" />
                                Milestone
                              </span>
                            </td>

                            {/* Plot Info */}
                            <td className="px-4 py-3 align-middle">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-200">
                                  Plot {fallbackPlotNo}
                                </span>
                                {fallbackPlotSize && (
                                  <span className="text-[11px] whitespace-nowrap text-gray-400">
                                    ({fallbackPlotSize} Sq. Yds.)
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions: Toggle Status */}
                            <td className="px-4 py-3 text-right align-middle">
                              <div className="flex items-center justify-end gap-1.5">
                                {handleToggle && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(payment.id, payment.status)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                                      isPaid
                                        ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                        : 'border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    }`}
                                  >
                                    {isPaid ? (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5" /> {t('paid')}
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3.5 w-3.5" /> {t('pending')}
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
