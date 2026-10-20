'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Award,
  RefreshCw,
  Mail,
  FileText,
  FileSpreadsheet,
  FileDown,
  Loader2,
} from 'lucide-react';
import type { Lottery, DbParticipant } from '../types';
import {
  fetchLotteryExportData,
  exportSingleLotteryToCSV,
  exportSingleLotteryToExcel,
  exportSingleLotteryToPDF,
} from '@/src/lib/lottery/exportSingleLottery';

interface ViewParticipantsModalProps {
  open: boolean;
  lottery: Lottery | null;
  onClose: () => void;
  onOpenEmail: (lottery: Lottery) => void;
}

export function ViewParticipantsModal({
  open,
  lottery,
  onClose,
  onOpenEmail,
}: ViewParticipantsModalProps) {
  const [participants, setParticipants] = useState<DbParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [exportingType, setExportingType] = useState<'csv' | 'excel' | 'pdf' | null>(null);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!lottery || participants.length === 0) return;
    try {
      setExportingType(format);
      const data = await fetchLotteryExportData(lottery);
      if (format === 'csv') {
        exportSingleLotteryToCSV(data);
      } else if (format === 'excel') {
        await exportSingleLotteryToExcel(data);
      } else if (format === 'pdf') {
        await exportSingleLotteryToPDF(data);
      }
    } finally {
      setExportingType(null);
    }
  };

  useEffect(() => {
    if (open && lottery) {
      setSearch('');
      setParticipants([]);
      loadParticipants(lottery.id);
    }
  }, [open, lottery?.id]);

  const loadParticipants = async (lotteryId: string) => {
    setLoading(true);
    try {
      // PII (email/phone) is only readable through the verifyAdmin-gated route;
      // the browser client no longer has SELECT on those columns.
      const res = await fetch(
        `/api/admin/lottery/participants?lotteryId=${encodeURIComponent(lotteryId)}`
      );
      if (!res.ok) throw new Error('Failed to fetch participants');
      const json = (await res.json()) as { participants?: DbParticipant[] };
      setParticipants(json.participants || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.phone && p.phone.includes(search))
  );

  return (
    <AnimatePresence>
      {open && lottery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-brand-dark-bg flex w-full max-w-3xl flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h3 className="text-brand-navy font-serif text-xl font-bold dark:text-gray-100">
                  {lottery.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {participants.length} Participant{participants.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Export Controls for Selected Draw */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
                  <span className="px-2 text-[9.5px] font-bold tracking-wider text-slate-400 uppercase dark:text-gray-500">
                    Export:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    disabled={exportingType !== null || loading || participants.length === 0}
                    title="Export all candidates to CSV"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
                  >
                    {exportingType === 'csv' ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                    ) : (
                      <FileText className="h-3 w-3 text-blue-500" />
                    )}
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('excel')}
                    disabled={exportingType !== null || loading || participants.length === 0}
                    title="Export formatted Excel (.xlsx) report"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-emerald-500/10"
                  >
                    {exportingType === 'excel' ? (
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                    ) : (
                      <FileSpreadsheet className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    disabled={exportingType !== null || loading || participants.length === 0}
                    title="Export Executive PDF Dossier"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-rose-500/10"
                  >
                    {exportingType === 'pdf' ? (
                      <Loader2 className="h-3 w-3 animate-spin text-rose-500" />
                    ) : (
                      <FileDown className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => onOpenEmail(lottery)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-600 transition-all hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                >
                  <Mail className="h-3.5 w-3.5" /> Email All
                </button>
                <button
                  onClick={onClose}
                  className="hover:text-brand-navy cursor-pointer rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors dark:border-gray-700 dark:hover:text-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ticket, email, phone..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 focus:border-violet-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Participant List */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Loading participants…
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400 italic dark:text-gray-500">
                  {search ? 'No participants match your search.' : 'No participants found.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:border-white/5 dark:text-gray-500">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Ticket #</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-3 font-mono text-xs text-slate-600 dark:text-gray-300">
                            {p.ticket_number}
                          </td>
                          <td className="py-3 text-xs text-slate-500 dark:text-gray-400">
                            {p.phone || '—'}
                          </td>
                          <td className="py-3 text-xs text-slate-500 dark:text-gray-400">
                            {p.email || '—'}
                          </td>
                          <td className="py-3">
                            {p.is_winner ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <Award className="h-3 w-3" /> Allotted
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9.5px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                                Not alloted — Better luck next time
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
