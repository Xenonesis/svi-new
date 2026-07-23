import React from 'react';
import { motion } from 'motion/react';
import { Eye, FileText, Mail, Trash2, WifiOff, RefreshCw, Receipt, Plus } from 'lucide-react';
import Link from 'next/link';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import { SavedReceipt } from './ReceiptTypes';

export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/5"
        >
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-36" />
          <div className="ml-auto flex gap-1.5">
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
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
  return (
    <div className="dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <>
            <div className="animate-pulse border-b border-gray-200 bg-gray-50/80 px-6 py-5 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-4">
                {[
                  'Receipt No',
                  'Client Name',
                  'Date',
                  'Amount',
                  'Method',
                  'Plot Info',
                  'Actions',
                ].map((h, idx) => (
                  <SkeletonBlock key={h} className={`h-3 ${idx === 6 ? 'ml-auto w-16' : 'w-24'}`} />
                ))}
              </div>
            </div>
            <TableSkeleton />
          </>
        ) : error ? (
          <div className="py-24 text-center font-sans">
            <WifiOff className="mx-auto mb-4 h-12 w-12 text-red-400 dark:text-red-600" />
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
            <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
              {searchQuery
                ? 'No matches found for your search.'
                : 'No receipt records generated yet.'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/payment-receipt"
                className="bg-brand-gold mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white uppercase shadow-md transition-all hover:bg-yellow-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Receipt
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                {[
                  'Receipt No',
                  'Client Name',
                  'Date',
                  'Amount',
                  'Method',
                  'Plot Info',
                  'Actions',
                ].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 6 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
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
                });

                return (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                    className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <span className="text-brand-gold border-brand-gold/20 bg-brand-gold/10 rounded-full border px-2 py-1 text-xs font-bold">
                        {receipt.form_data?.receiptNo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {receipt.form_data?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {receipt.form_data?.date
                        ? new Date(receipt.form_data.date).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {formattedAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold rounded border px-2 py-0.5 text-[10px] font-bold">
                        {receipt.form_data?.paymentMethod || 'UPI'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {receipt.form_data?.plotNo
                        ? `Plot ${receipt.form_data.plotNo} (${receipt.form_data.plotSize} Sq. Yds.)`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="hover:text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors"
                          title="View & Print"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/payment-receipt?templateId=${receipt.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                          title="Use as Template"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(receipt));
                            window.location.href = '/admin/email?tab=compose&prefillReceipt=true';
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-400"
                          title="Email Client"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(receipt)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete"
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
