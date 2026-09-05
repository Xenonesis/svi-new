'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Eye, Download, IndianRupee, Save, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { SavedReceipt } from './ReceiptTypes';
import { calculateLedgerStatement, normalizeRefId } from '@/src/lib/receipt/receiptLedger';
import { downloadReceiptsCsv } from '@/src/lib/receipt/receiptCsvExport';

interface ReceiptLedgerDrawerProps {
  refId: string | null;
  allReceipts: SavedReceipt[];
  dealValue: number;
  onSaveDealValue: (normalizedRefId: string, newDealValue: number) => Promise<void> | void;
  onClose: () => void;
  onSelectReceipt?: (receipt: SavedReceipt) => void;
}

export function ReceiptLedgerDrawer({
  refId,
  allReceipts,
  dealValue,
  onSaveDealValue,
  onClose,
  onSelectReceipt,
}: ReceiptLedgerDrawerProps) {
  const [agreedValueInput, setAgreedValueInput] = useState('');
  const [savingDealValue, setSavingDealValue] = useState(false);
  const [copiedReceiptNo, setCopiedReceiptNo] = useState<string | null>(null);

  useEffect(() => {
    setAgreedValueInput(dealValue > 0 ? String(dealValue) : '');
  }, [dealValue, refId]);

  if (!refId) return null;

  const ledger = calculateLedgerStatement(refId, allReceipts, dealValue);
  const normalizedKey = normalizeRefId(refId);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedReceiptNo(text);
    toast.success(`Copied #${text}`);
    setTimeout(() => setCopiedReceiptNo(null), 2000);
  };

  const handleSaveDealValue = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(agreedValueInput.replace(/,/g, ''));
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid deal amount');
      return;
    }
    try {
      setSavingDealValue(true);
      await onSaveDealValue(normalizedKey, num);
      toast.success('Agreed deal value saved successfully');
    } catch {
      toast.error('Failed to save agreed deal value');
    } finally {
      setSavingDealValue(false);
    }
  };

  const handleExportStatement = () => {
    if (ledger.receipts.length === 0) {
      toast.error('No receipts available to export');
      return;
    }
    const cleanRef = ledger.displayRefId.replace(/[^a-zA-Z0-9]/g, '_');
    downloadReceiptsCsv(ledger.receipts, `Ledger_Statement_${cleanRef}.csv`);
    toast.success(`Exported ledger statement for ${ledger.displayRefId}`);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="dark:bg-brand-dark-surface flex w-screen max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10"
          >
            {/* Top Accent Strip */}
            <div className="bg-brand-gold h-1 w-full" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 p-6 dark:border-white/10">
              <div className="flex items-start gap-3.5">
                <div className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      Ref ID: {ledger.displayRefId}
                    </span>
                    {ledger.plotNo && (
                      <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        Plot {ledger.plotNo}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 capitalize dark:text-white">
                    {ledger.clientName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ledger.receipts.length} milestone payment record
                    {ledger.receipts.length === 1 ? '' : 's'} recorded
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Total Received */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase dark:text-emerald-400">
                    Total Received
                  </span>
                  <div className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(ledger.totalPaid)}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    {ledger.receipts.length} transaction{ledger.receipts.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Agreed Plot Value */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 dark:bg-blue-500/10">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase dark:text-blue-400">
                    Agreed Plot Value
                  </span>
                  <div className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                    {ledger.agreedDealValue > 0
                      ? formatCurrency(ledger.agreedDealValue)
                      : 'Not Set'}
                  </div>
                  <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
                    {ledger.agreedDealValue > 0 ? 'Confirmed deal cost' : 'Set below to track'}
                  </span>
                </div>

                {/* Balance Due */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase dark:text-amber-400">
                    Balance Due
                  </span>
                  <div className="mt-1 font-mono text-lg font-bold text-amber-700 dark:text-amber-300">
                    {ledger.agreedDealValue > 0 ? formatCurrency(ledger.balanceDue) : '—'}
                  </div>
                  <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                    {ledger.agreedDealValue > 0
                      ? ledger.balanceDue === 0
                        ? 'Fully Paid'
                        : `${ledger.percentCompleted}% Paid`
                      : 'Requires Agreed Value'}
                  </span>
                </div>
              </div>

              {/* Progress Bar (if agreedDealValue set) */}
              {ledger.agreedDealValue > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Payment Milestone Progress
                    </span>
                    <span className="text-brand-gold font-mono font-bold">
                      {ledger.percentCompleted}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="bg-brand-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ledger.percentCompleted)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Edit Agreed Deal Value Form */}
              <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                  <IndianRupee className="text-brand-gold h-3.5 w-3.5" />
                  Set / Update Agreed Deal Value
                </h4>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Save total agreed cost for this plot/ref account to calculate outstanding balance.
                </p>
                <form onSubmit={handleSaveDealValue} className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 2500000"
                      value={agreedValueInput}
                      onChange={(e) => setAgreedValueInput(e.target.value)}
                      className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-7 font-mono text-xs font-semibold text-gray-900 transition-colors focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingDealValue}
                    className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingDealValue ? 'Saving...' : 'Save'}
                  </button>
                </form>
              </div>

              {/* Receipts Chronological Timeline */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                    Payment Statement ({ledger.receipts.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleExportStatement}
                    className="text-brand-gold flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    <Download className="h-3 w-3" />
                    Export Statement
                  </button>
                </div>

                {ledger.receipts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 dark:border-white/10">
                    No receipts recorded under this Ref ID yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                        <tr>
                          <th className="px-3.5 py-2.5">Date</th>
                          <th className="px-3.5 py-2.5">Receipt No</th>
                          <th className="px-3.5 py-2.5">Method</th>
                          <th className="px-3.5 py-2.5 text-right">Amount</th>
                          <th className="px-3.5 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans dark:divide-white/5">
                        {ledger.receipts.map((r) => {
                          const amt = parseFloat(r.form_data?.amount || '0') || 0;
                          const rNo = r.form_data?.receiptNo || 'N/A';
                          const isCopied = copiedReceiptNo === rNo;

                          return (
                            <tr
                              key={r.id}
                              className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                            >
                              <td className="px-3.5 py-2.5 font-mono text-[11px] whitespace-nowrap text-gray-600 dark:text-gray-300">
                                {r.form_data?.date || '—'}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleCopy(rNo, e)}
                                  className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400"
                                  title="Copy Receipt No"
                                >
                                  <span>#{rNo}</span>
                                  {isCopied ? (
                                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5 opacity-50" />
                                  )}
                                </button>
                              </td>
                              <td className="px-3.5 py-2.5 text-[11px] text-gray-600 dark:text-gray-300">
                                {r.form_data?.paymentMethod || 'UPI'}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                                {formatCurrency(amt)}
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                {onSelectReceipt && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectReceipt(r)}
                                    className="hover:text-brand-gold rounded p-1 text-gray-400"
                                    title="View Receipt"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                SVI Customer Ledger Statement
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
