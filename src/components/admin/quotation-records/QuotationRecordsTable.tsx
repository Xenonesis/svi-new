'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Eye,
  Copy,
  Check,
  Trash2,
  WifiOff,
  FileText,
  Building2,
  Calendar,
  Plus,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import type { SavedQuotation } from '@/src/lib/quotation/types';
import { formatINR, formatDateDisplay } from '@/src/lib/quotation/format';

interface QuotationRecordsTableProps {
  loading: boolean;
  error: string | null;
  records: SavedQuotation[];
  searchQuery: string;
  onRetry: () => void;
  onSelect: (record: SavedQuotation) => void;
  onDeleteTarget: (record: SavedQuotation) => void;
}

export function QuotationRecordsTable({
  loading,
  error,
  records,
  searchQuery,
  onRetry,
  onSelect,
  onDeleteTarget,
}: QuotationRecordsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyNo = (quotationNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quotationNo || quotationNo === 'N/A') return;
    navigator.clipboard.writeText(quotationNo);
    setCopiedId(quotationNo);
    toast.success(`Copied ${quotationNo}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/80 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10">
      {/* Top Gold Accent Glow */}
      <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <div className="animate-pulse">
            <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <SkeletonBlock key={i} className="h-3.5 w-24" />
                ))}
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-6 border-b border-gray-100 px-6 py-4 dark:border-white/5"
              >
                <SkeletonBlock className="h-6 w-36 rounded-md" />
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-5 w-16" />
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
                <div className="ml-auto flex gap-2">
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <WifiOff className="h-6 w-6" />
            </div>
            <p className="mb-3 text-sm font-medium text-rose-500">{error}</p>
            <button
              onClick={onRetry}
              className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold uppercase transition-all"
            >
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500">
              <FileText className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {searchQuery ? 'No matching quotations' : 'No quotations created yet'}
            </h4>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `No quotation records matched your search "${searchQuery}". Try searching with a different term.`
                : 'Create and generate your first formal quotation with automated calculations.'}
            </p>
            <Link
              href="/admin/quotation"
              className="bg-brand-gold hover:bg-brand-gold/90 mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white uppercase shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create Quotation
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/75 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Quotation No.
                </th>
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Customer
                </th>
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Project
                </th>
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Plot / Unit
                </th>
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Area
                </th>
                <th className="px-5 py-4 text-right text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Grand Total
                </th>
                <th className="px-5 py-4 text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Date
                </th>
                <th className="px-5 py-4 text-center text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-[10.5px] font-bold tracking-[0.18em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {records.map((record, i) => {
                const quotationNo = record.form_data?.quotationNo || 'N/A';
                const isCopied = copiedId === quotationNo;
                const isCompleted = record.status === 'completed';
                const isDraft = record.status === 'draft';

                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.25), duration: 0.25 }}
                    className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.04]"
                  >
                    {/* Quotation No. */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyNo(quotationNo, e)}
                        className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:border-brand-gold/60 hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95"
                        title="Click to copy Quotation No."
                      >
                        <span>{quotationNo}</span>
                        {isCopied ? (
                          <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                        )}
                      </button>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 capitalize dark:text-white">
                        {record.form_data?.customerName || 'N/A'}
                      </div>
                      {record.form_data?.customerPhone && (
                        <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          {record.form_data.customerPhone}
                        </div>
                      )}
                    </td>

                    {/* Project */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-gray-800 capitalize dark:text-gray-200">
                        {record.form_data?.projectName || '—'}
                      </div>
                      {record.form_data?.propertyType && (
                        <div className="text-[11px] text-gray-500 capitalize dark:text-gray-400">
                          {record.form_data.propertyType}
                        </div>
                      )}
                    </td>

                    {/* Plot / Unit */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {record.form_data?.plotNo ? (
                        <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                          {record.form_data.plotNo}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    {/* Area */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {record.form_data?.area ? (
                        <span className="font-medium text-gray-800 tabular-nums dark:text-gray-200">
                          {Number(record.form_data.area).toLocaleString('en-IN')} Sq. Yds.
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    {/* Grand Total */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className="font-mono text-sm font-bold tracking-tight text-gray-900 tabular-nums dark:text-white">
                        {record.form_data?.calculation?.grandTotal != null
                          ? formatINR(record.form_data.calculation.grandTotal)
                          : '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-600 tabular-nums dark:text-gray-400">
                        {record.form_data?.quotationDate
                          ? formatDateDisplay(record.form_data.quotationDate)
                          : formatDateTime(record.created_at)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide uppercase ${
                          isCompleted
                            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isDraft
                              ? 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-gray-300 bg-gray-100 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                              : isDraft
                                ? 'bg-amber-500 shadow-xs shadow-amber-500/50'
                                : 'bg-gray-400'
                          }`}
                        />
                        {record.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => onSelect(record)}
                          className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95 dark:text-gray-500"
                          title="View Quotation Details"
                          aria-label="View quotation"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Use as Template */}
                        <Link
                          href={`/admin/quotation?templateId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95 dark:text-gray-500 dark:hover:text-blue-400"
                          title="Use as Template / Duplicate"
                          aria-label="Use as template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteTarget(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95 dark:text-gray-500 dark:hover:text-rose-400"
                          title="Delete Quotation"
                          aria-label="Delete quotation"
                        >
                          <Trash2 className="h-4 w-4" />
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
