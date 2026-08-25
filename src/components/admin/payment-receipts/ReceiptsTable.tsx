import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  FileText,
  Mail,
  Trash2,
  WifiOff,
  RefreshCw,
  Receipt,
  Plus,
  Copy,
  Check,
  Calendar,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { SavedReceipt } from './ReceiptTypes';

export function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-white/5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <SkeletonBlock className="h-4 w-20 rounded-lg" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-16 rounded-full" />
          <SkeletonBlock className="h-4 w-36" />
          <div className="ml-auto flex gap-1.5">
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ReceiptsTableProps {
  loading: boolean;
  error: string | null;
  filteredReceipts: SavedReceipt[];
  searchQuery: string;
  fetchReceipts: () => void;
  setSelectedReceipt: (receipt: SavedReceipt) => void;
  setDeleteTarget: (receipt: SavedReceipt) => void;
}

export function ReceiptsTable({
  loading,
  error,
  filteredReceipts,
  searchQuery,
  fetchReceipts,
  setSelectedReceipt,
  setDeleteTarget,
}: ReceiptsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyReceiptNo = (receiptNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(receiptNo);
    setCopiedId(receiptNo);
    toast.success(`Copied ${receiptNo}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadgeStyle = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('upi')) {
      return 'border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400';
    }
    if (m.includes('cash')) {
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
    if (m.includes('cheque') || m.includes('dd') || m.includes('check')) {
      return 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }
    if (m.includes('bank') || m.includes('neft') || m.includes('rtgs') || m.includes('imps')) {
      return 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
    return 'border-gray-300 bg-gray-100 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300';
  };

  const formatDateDisplay = (dateStr?: string) => {
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

  return (
    <div className="dark:bg-brand-dark-surface/80 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl backdrop-blur-xl transition-colors duration-300 dark:border-white/10">
      {/* Top Gold Accent Glow */}
      <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <>
            <div className="border-b border-gray-200/80 bg-gray-50/80 px-6 py-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <SkeletonBlock key={i} className="h-3 w-20" />
                ))}
              </div>
            </div>
            <TableSkeleton />
          </>
        ) : error ? (
          <div className="py-24 text-center font-sans">
            <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400 dark:text-red-500" />
            <p className="mb-2 text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchReceipts}
              className="text-brand-gold hover:text-brand-gold-light mx-auto mt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="py-24 text-center font-sans">
            <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No matches found for your search.'
                : 'No receipt records generated yet.'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/payment-receipt"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase shadow-md transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Receipt
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[960px] font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {[
                  { label: 'RECEIPT NO', align: 'text-left' },
                  { label: 'CLIENT NAME', align: 'text-left' },
                  { label: 'DATE', align: 'text-left' },
                  { label: 'AMOUNT', align: 'text-right' },
                  { label: 'METHOD', align: 'text-center' },
                  { label: 'PLOT INFO', align: 'text-left' },
                  { label: 'ACTIONS', align: 'text-right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-5 py-4 text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-400 ${h.align}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredReceipts.map((receipt, i) => {
                const amountVal = parseFloat(receipt.form_data?.amount || '0');
                const formattedAmount = amountVal.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
                });
                const receiptNo = receipt.form_data?.receiptNo;
                const isCopied = receiptNo && copiedId === receiptNo;

                return (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                    className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                  >
                    {/* Receipt No */}
                    <td className="px-5 py-3.5 align-middle">
                      {receiptNo ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopyReceiptNo(receiptNo, e)}
                          className="group/copy border-brand-gold/30 bg-brand-gold/10 hover:bg-brand-gold/20 hover:border-brand-gold/50 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold text-amber-600 transition-all dark:text-amber-400"
                          title="Click to copy receipt number"
                        >
                          <span>{receiptNo}</span>
                          {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-40 transition-opacity group-hover/copy:opacity-100" />
                          )}
                        </button>
                      ) : (
                        <span className="font-mono text-gray-400">—</span>
                      )}
                    </td>

                    {/* Client Name */}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-gray-900 capitalize dark:text-white">
                          {receipt.form_data?.name || 'N/A'}
                        </div>
                        {receipt.form_data?.drawnOn && (
                          <div className="text-[10px] text-gray-400 capitalize dark:text-gray-500">
                            Bank: {receipt.form_data.drawnOn}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                          {formatDateDisplay(receipt.form_data?.date || receipt.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right align-middle font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
                      {formattedAmount}
                    </td>

                    {/* Method */}
                    <td className="px-5 py-3.5 text-center align-middle">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap uppercase ${getMethodBadgeStyle(
                          receipt.form_data?.paymentMethod
                        )}`}
                      >
                        <CreditCard className="h-2.5 w-2.5 opacity-70" />
                        {receipt.form_data?.paymentMethod || 'UPI'}
                      </span>
                    </td>

                    {/* Plot Info */}
                    <td className="px-5 py-3.5 align-middle">
                      {receipt.form_data?.plotNo ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-bold text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                            Plot {receipt.form_data.plotNo}
                          </span>
                          {receipt.form_data.plotSize && (
                            <span className="text-[11px] whitespace-nowrap text-gray-500 dark:text-gray-400">
                              ({receipt.form_data.plotSize} Sq. Yds.)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                          title="View & Print Payment Receipt"
                          aria-label="View & Print"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/payment-receipt?templateId=${receipt.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
                          title="Use as Template"
                          aria-label="Use as Template"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(receipt));
                            window.location.href = '/admin/email?tab=compose&prefillReceipt=true';
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 active:scale-95"
                          title="Email Receipt to Client"
                          aria-label="Email Receipt"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(receipt)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
                          title="Delete Receipt"
                          aria-label="Delete Receipt"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
