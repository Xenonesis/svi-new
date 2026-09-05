'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Wallet,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { SavedReceipt } from './ReceiptTypes';
import { groupReceiptsByRefId } from '@/src/lib/receipt/receiptLedger';

interface ReceiptLedgersModalProps {
  receipts: SavedReceipt[];
  dealValuesMap: Record<string, number>;
  onSelectLedger: (refId: string) => void;
  onClose: () => void;
}

export function ReceiptLedgersModal({
  receipts,
  dealValuesMap,
  onSelectLedger,
  onClose,
}: ReceiptLedgersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const summaries = useMemo(() => {
    return groupReceiptsByRefId(receipts, dealValuesMap).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [receipts, dealValuesMap]);

  const filteredSummaries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return summaries;
    return summaries.filter(
      (s) =>
        s.displayRefId.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.plotNo.toLowerCase().includes(q)
    );
  }, [summaries, searchQuery]);

  const totals = useMemo(() => {
    const totalCollected = summaries.reduce((sum, s) => sum + s.totalPaid, 0);
    const totalAgreed = summaries.reduce((sum, s) => sum + s.agreedDealValue, 0);
    const totalBalance = summaries.reduce((sum, s) => sum + s.balanceDue, 0);
    return {
      totalCollected,
      totalAgreed,
      totalBalance,
      accountsCount: summaries.length,
    };
  }, [summaries]);

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="dark:bg-brand-dark-surface relative z-10 flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
        >
          {/* Top Gold Accent */}
          <div className="via-brand-gold absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-transparent to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold flex h-10 w-10 items-center justify-center rounded-xl border">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Customer Ledgers Master Overview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Aggregated milestone payments & balances grouped by Ref ID / Plot
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 gap-3 border-b border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-4 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="rounded-xl border border-gray-200/60 bg-white p-3 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase dark:text-gray-400">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Accounts
              </div>
              <div className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-white">
                {totals.accountsCount} Ref IDs
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/60 bg-white p-3 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 uppercase dark:text-emerald-400">
                <Wallet className="h-3.5 w-3.5" />
                Total Collected
              </div>
              <div className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals.totalCollected)}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/60 bg-white p-3 dark:border-white/5 dark:bg-white/5">
              <div className="text-brand-gold flex items-center gap-1.5 text-[11px] font-semibold uppercase">
                <TrendingUp className="h-3.5 w-3.5" />
                Agreed Deals
              </div>
              <div className="text-brand-gold mt-1 font-mono text-base font-bold">
                {totals.totalAgreed > 0 ? formatCurrency(totals.totalAgreed) : '—'}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/60 bg-white p-3 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 uppercase dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Balance Due
              </div>
              <div className="mt-1 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                {totals.totalBalance > 0 ? formatCurrency(totals.totalBalance) : '—'}
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="border-b border-gray-100 p-4 dark:border-white/10">
            <div className="relative max-w-sm">
              <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Ref ID, Client or Plot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-9 text-xs text-gray-900 transition-colors focus:outline-none dark:border-white/10 dark:text-white"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="flex-1 overflow-y-auto">
            {filteredSummaries.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400">
                No customer ledger accounts match your search.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50/90 text-[10px] font-bold tracking-wider text-gray-500 uppercase backdrop-blur-sm dark:bg-white/5 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Ref ID</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Plot Info</th>
                    <th className="px-4 py-3 text-center">Receipts</th>
                    <th className="px-4 py-3 text-right">Total Received</th>
                    <th className="px-4 py-3 text-right">Agreed Value</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredSummaries.map((s) => (
                    <tr
                      key={s.normalizedRefId}
                      onClick={() => onSelectLedger(s.displayRefId)}
                      className="group cursor-pointer transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 align-middle font-mono font-bold text-sky-600 dark:text-sky-400">
                        <span className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-0.5">
                          {s.displayRefId}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle font-semibold text-gray-900 capitalize dark:text-white">
                        {s.clientName}
                      </td>
                      <td className="px-4 py-3 align-middle text-gray-600 dark:text-gray-300">
                        {s.plotNo ? (
                          <span>
                            Plot {s.plotNo}
                            {s.plotSize ? ` (${s.plotSize} sq.yds)` : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-bold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                          {s.receiptsCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right align-middle font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.totalPaid)}
                      </td>
                      <td className="px-4 py-3 text-right align-middle font-mono text-gray-700 dark:text-gray-300">
                        {s.agreedDealValue > 0 ? (
                          formatCurrency(s.agreedDealValue)
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right align-middle font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {s.agreedDealValue > 0 ? (
                          formatCurrency(s.balanceDue)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLedger(s.displayRefId);
                          }}
                          className="text-brand-gold inline-flex items-center gap-1 font-semibold group-hover:underline"
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredSummaries.length} of {summaries.length} Customer Ledger Accounts
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
