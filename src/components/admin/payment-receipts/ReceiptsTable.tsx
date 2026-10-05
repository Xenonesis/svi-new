'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  Trash2,
  WifiOff,
  RefreshCw,
  Receipt,
  Plus,
  Copy,
  Check,
  Calendar,
  CreditCard,
  MessageSquare,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { SavedReceipt } from './ReceiptTypes';
import { ReceiptRowActionMenu } from './ReceiptRowActionMenu';

export function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-white/5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-6 w-16 rounded-full" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ReceiptsTableProps {
  loading: boolean;
  error: string | null;
  filteredReceipts: SavedReceipt[];
  searchQuery: string;
  fetchReceipts: () => void;
  setSelectedReceipt: (receipt: SavedReceipt) => void;
  setDeleteTarget: (receipt: SavedReceipt) => void;
  onShareWhatsApp?: (receipt: SavedReceipt) => void;
  onOpenLedger?: (refId: string) => void;
  activeTab?: 'active' | 'trash';
  onRestore?: (receipt: SavedReceipt) => void;
  setIsPermanentDelete?: (val: boolean) => void;
  onEmptyTrash?: () => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  pageSize?: number;
  totalPages?: number;
  paginatedReceipts?: SavedReceipt[];
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }
  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function ReceiptsTable({
  loading,
  error,
  filteredReceipts,
  searchQuery,
  fetchReceipts,
  setSelectedReceipt,
  setDeleteTarget,
  onShareWhatsApp,
  onOpenLedger,
  activeTab = 'active',
  onRestore,
  setIsPermanentDelete,
  onEmptyTrash,
  currentPage = 1,
  setCurrentPage,
  pageSize = 25,
  totalPages,
  paginatedReceipts,
}: ReceiptsTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const displayReceipts = paginatedReceipts ?? filteredReceipts;
  const totalItems = filteredReceipts.length;
  const page = currentPage || 1;
  const size = pageSize || 25;
  const pagesCount = totalPages ?? Math.max(1, Math.ceil(totalItems / size));

  const startItem = totalItems === 0 ? 0 : (page - 1) * size + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * size, totalItems);
  const pageNumbers = getPageNumbers(page, pagesCount);

  const handleCopyReceiptNo = (receiptNo: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(receiptNo);
    setCopiedKey(`${id}-receipt`);
    toast.success(`Copied ${receiptNo}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyRefId = (refId: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(refId);
    setCopiedKey(`${id}-ref`);
    toast.success(`Copied Ref ID: ${refId}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodBadgeStyle = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('upi')) {
      return 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400';
    }
    if (m.includes('cash')) {
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    }
    if (m.includes('cheque') || m.includes('dd') || m.includes('check')) {
      return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }
    if (m.includes('bank') || m.includes('neft') || m.includes('rtgs') || m.includes('imps')) {
      return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
    return 'border-gray-200 bg-gray-100/80 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300';
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
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
            {activeTab === 'trash' ? (
              <>
                <Trash2 className="mx-auto mb-4 h-12 w-12 text-gray-400 opacity-60 dark:text-gray-500" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No deleted receipts matched your search.' : 'Trash bin is empty.'}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Deleted receipts will appear here so you can recover them if deleted by mistake.
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'trash' && (
              <div className="flex items-center justify-between border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-xs text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <span>
                    <strong>Trash Bin ({filteredReceipts.length})</strong> — Receipts deleted by
                    mistake can be restored to active list with one click.
                  </span>
                </div>
                {onEmptyTrash && (
                  <button
                    type="button"
                    onClick={onEmptyTrash}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition-all hover:bg-rose-500/25 active:scale-95 dark:text-rose-300"
                  >
                    <Trash2 className="h-3 w-3" />
                    Empty Trash
                  </button>
                )}
              </div>
            )}
            <table className="w-full min-w-[1040px] font-sans text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
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
                      className={`px-5 py-4 text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-400 ${h.align}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayReceipts.map((receipt, i) => {
                  const amountVal = parseFloat(receipt.form_data?.amount || '0');
                  const formattedAmount = amountVal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
                  });
                  const receiptNo = receipt.form_data?.receiptNo;
                  const refId = receipt.form_data?.refId;
                  const isCopiedReceipt = receiptNo && copiedKey === `${receipt.id}-receipt`;
                  const isCopiedRef = refId && copiedKey === `${receipt.id}-ref`;

                  const isRefund =
                    receipt.form_data?.refundStatus === 'Refund Done' ||
                    receipt.form_data?.notes?.toLowerCase().includes('refund') ||
                    receipt.form_data?.remarks?.toLowerCase().includes('refund');

                  return (
                    <motion.tr
                      key={receipt.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                      className="group h-[52px] transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]"
                    >
                      {/* Receipt No */}
                      <td className="px-5 py-2.5 align-middle">
                        {receiptNo ? (
                          <button
                            type="button"
                            onClick={(e) => handleCopyReceiptNo(receiptNo, receipt.id, e)}
                            className="group/copy border-brand-gold/30 bg-brand-gold/10 hover:border-brand-gold/50 hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold text-amber-600 transition-all dark:text-amber-400"
                            title="Click to copy receipt number"
                          >
                            <span>{receiptNo}</span>
                            {isCopiedReceipt ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-40 transition-opacity group-hover/copy:opacity-100" />
                            )}
                          </button>
                        ) : (
                          <span className="font-mono text-gray-400">—</span>
                        )}
                      </td>

                      {/* Ref ID */}
                      <td className="px-5 py-2.5 align-middle">
                        {refId ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenLedger?.(refId)}
                              className="inline-flex items-center rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1 font-mono text-[11px] font-bold text-sky-600 transition-all hover:border-sky-500/50 hover:bg-sky-500/20 hover:underline dark:text-sky-400"
                              title="Open Customer Ledger"
                            >
                              <span>{refId}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleCopyRefId(refId, receipt.id, e)}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-sky-500 dark:hover:bg-white/5"
                              title="Click to copy Ref ID"
                            >
                              {isCopiedRef ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-40 transition-opacity hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-gray-400">—</span>
                        )}
                      </td>

                      {/* Client Name */}
                      <td className="px-5 py-2.5 align-middle">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate font-semibold text-gray-900 capitalize dark:text-white">
                            <span>{receipt.form_data?.name || 'N/A'}</span>
                            {isRefund && (
                              <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                                Refund Done
                              </span>
                            )}
                          </div>
                          {receipt.form_data?.drawnOn && (
                            <div className="text-[10px] text-gray-400 capitalize dark:text-gray-500">
                              Bank: {receipt.form_data.drawnOn}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-2.5 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                            {formatDateDisplay(receipt.form_data?.date || receipt.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-2.5 text-right align-middle font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
                        {formattedAmount}
                      </td>

                      {/* Method */}
                      <td className="px-5 py-2.5 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap uppercase backdrop-blur-xs ${getMethodBadgeStyle(
                            receipt.form_data?.paymentMethod
                          )}`}
                        >
                          <CreditCard className="h-2.5 w-2.5 opacity-70" />
                          {receipt.form_data?.paymentMethod || 'UPI'}
                        </span>
                      </td>

                      {/* Plot Info */}
                      <td className="px-5 py-2.5 align-middle">
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
                      <td className="px-5 py-2.5 text-right align-middle">
                        {activeTab === 'trash' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {onRestore && (
                              <button
                                type="button"
                                onClick={() => onRestore(receipt)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-all hover:scale-105 hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400"
                                title="Restore Receipt to Active List"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restore</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsPermanentDelete?.(true);
                                setDeleteTarget(receipt);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
                              title="Delete Permanently"
                              aria-label="Delete Permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Eye button (View & Print) */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(receipt)}
                              className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                              title="View & Print Payment Receipt"
                              aria-label="View & Print"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick MessageSquare button (WhatsApp) */}
                            {onShareWhatsApp && (
                              <button
                                type="button"
                                onClick={() => onShareWhatsApp(receipt)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 active:scale-95"
                                title="Share via WhatsApp"
                                aria-label="Share via WhatsApp"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* ReceiptRowActionMenu (•••) */}
                            <ReceiptRowActionMenu
                              receipt={receipt}
                              onOpenLedger={onOpenLedger}
                              onDelete={(r) => {
                                setIsPermanentDelete?.(false);
                                setDeleteTarget(r);
                              }}
                              onShareWhatsApp={onShareWhatsApp}
                            />
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Enterprise Bottom Pagination Bar */}
      {filteredReceipts.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200/80 bg-gray-50/50 px-6 py-3.5 sm:flex-row dark:border-white/10 dark:bg-white/[0.02]">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{startItem}</span> to{' '}
            <span className="font-bold text-slate-900 dark:text-white">{endItem}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span> receipts
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setCurrentPage?.(Math.max(1, page - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pageNumbers.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                  >
                    …
                  </span>
                );
              }

              const isActive = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage?.(p)}
                  className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-gold text-brand-navy font-bold shadow-xs'
                      : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= pagesCount}
              onClick={() => setCurrentPage?.(Math.min(pagesCount, page + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
