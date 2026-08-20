'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Eye, FileText, Trash2, WifiOff } from 'lucide-react';
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
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <div className="animate-pulse">
            <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-5 dark:border-white/5 dark:bg-white/5">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <SkeletonBlock key={i} className="h-3 w-20" />
                ))}
              </div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/5"
              >
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-16" />
                <div className="ml-auto flex gap-1.5">
                  <SkeletonBlock className="h-8 w-8 rounded-md" />
                  <SkeletonBlock className="h-8 w-8 rounded-md" />
                  <SkeletonBlock className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <p className="mb-2 text-sm text-red-500">{error}</p>
            <button onClick={onRetry} className="text-brand-gold text-xs font-bold uppercase">
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="py-24 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No matches found.' : 'No quotations generated yet.'}
            </p>
            <Link
              href="/admin/quotation"
              className="bg-brand-gold mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md"
            >
              Create First Quotation
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-white/5 dark:bg-white/5">
                {[
                  'Quotation No.',
                  'Customer',
                  'Project',
                  'Plot / Unit',
                  'Area',
                  'Grand Total',
                  'Date',
                  'Status',
                  'Actions',
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400 ${
                      i === 8 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {records.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                >
                  <td className="px-6 py-4">
                    <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                      {record.form_data?.quotationNo || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {record.form_data?.customerName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {record.form_data?.projectName || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {record.form_data?.plotNo || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {record.form_data?.area
                      ? `${Number(record.form_data.area).toLocaleString('en-IN')} Sq. Yds.`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                    {record.form_data?.calculation?.grandTotal
                      ? formatINR(record.form_data.calculation.grandTotal)
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {record.form_data?.quotationDate
                      ? formatDateDisplay(record.form_data.quotationDate)
                      : formatDateTime(record.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        record.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <button
                        onClick={() => onSelect(record)}
                        className="hover:text-brand-gold hover:bg-brand-gold/10 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                        title="View"
                        aria-label="View quotation"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Use as Template */}
                      <Link
                        href={`/admin/quotation?templateId=${record.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        title="Use as Template"
                        aria-label="Use as template"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      {/* Delete */}
                      <button
                        onClick={() => onDeleteTarget(record)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        title="Delete"
                        aria-label="Delete quotation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
