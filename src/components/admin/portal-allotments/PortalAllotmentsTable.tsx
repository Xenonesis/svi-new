'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Eye, FileText, Building2, Mail, Trash2, Copy, Check, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import type { SavedAllotment } from '@/src/components/admin/allotment-records/types';
import { calculateTotalCost } from '@/src/components/admin/allotment-records/types';

interface PortalAllotmentsTableProps {
  loading: boolean;
  records: SavedAllotment[];
  searchQuery: string;
  onSelectRecord: (record: SavedAllotment) => void;
  onDeleteRecord: (record: SavedAllotment) => void;
}

export function PortalAllotmentsTable({
  loading,
  records,
  searchQuery,
  onSelectRecord,
  onDeleteRecord,
}: PortalAllotmentsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTicket = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    toast.success(`Copied ${ticketId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDateTimeParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: '—', time: '' };
      const date = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { date, time };
    } catch {
      return { date: '—', time: '' };
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/80 relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl backdrop-blur-xl transition-colors duration-300 dark:border-white/10">
      {/* Top Gold Accent Glow */}
      <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      <div className="overflow-x-auto">
        {loading ? (
          <div className="divide-y divide-gray-100 p-4 dark:divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <SkeletonBlock className="h-4 w-24 rounded-lg" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-4 w-12 rounded-md" />
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-20 rounded-full" />
                <div className="ml-auto flex gap-1.5">
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-24 text-center font-sans">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No matches found.' : 'No allotment records generated yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[980px] font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {[
                  { label: 'TICKET ID', align: 'text-left' },
                  { label: 'CLIENT NAME', align: 'text-left' },
                  { label: 'PROJECT', align: 'text-left' },
                  { label: 'UNIT / PLOT', align: 'text-center' },
                  { label: 'AREA', align: 'text-left' },
                  { label: 'TOTAL COST', align: 'text-right' },
                  { label: 'PLAN', align: 'text-center' },
                  { label: 'DATE & TIME', align: 'text-left' },
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
              {records.map((record, i) => {
                const cost = record.form_data ? calculateTotalCost(record.form_data) : 0;
                const formattedCost = cost.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                });
                const ticketId = record.form_data?.ticketId;
                const isCopied = ticketId && copiedId === ticketId;
                const { date, time } = record.created_at
                  ? formatDateTimeParts(record.created_at)
                  : { date: '—', time: '' };

                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                    className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]"
                  >
                    {/* Ticket ID */}
                    <td className="px-5 py-3.5 align-middle">
                      {ticketId ? (
                        <button
                          type="button"
                          onClick={(e) => handleCopyTicket(ticketId, e)}
                          className="group/copy border-brand-gold/30 bg-brand-gold/10 hover:bg-brand-gold/20 hover:border-brand-gold/50 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold text-amber-600 transition-all dark:text-amber-400"
                          title="Click to copy ticket ID"
                        >
                          <span>{ticketId}</span>
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
                          {record.form_data?.clientName || 'N/A'}
                        </div>
                        {record.form_data?.advisorName && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">
                            Adv: {record.form_data.advisorName}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-5 py-3.5 align-middle font-medium whitespace-nowrap text-gray-700 capitalize dark:text-gray-300">
                      {record.form_data?.projectName || 'N/A'}
                    </td>

                    {/* Unit / Plot */}
                    <td className="px-5 py-3.5 text-center align-middle">
                      {record.form_data?.unitNumber ? (
                        <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                          {record.form_data.unitNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Area */}
                    <td className="px-5 py-3.5 align-middle font-medium whitespace-nowrap text-gray-600 tabular-nums dark:text-gray-400">
                      {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : '—'}
                    </td>

                    {/* Total Cost */}
                    <td className="px-5 py-3.5 text-right align-middle font-mono text-xs font-bold text-gray-900 tabular-nums dark:text-white">
                      {formattedCost}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5 text-center align-middle">
                      <span className="inline-block rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                        {record.form_data?.paymentPlan || '12'} Months
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                            {date}
                          </span>
                          {time && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {time}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="hover:border-brand-gold/30 hover:bg-brand-gold/10 hover:text-brand-gold flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 active:scale-95"
                          title="View & Print"
                          aria-label="View & Print"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/allotment-letter?templateId=${record.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95"
                          title="Use as Template"
                          aria-label="Use as Template"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/bba?allotmentId=${record.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500 active:scale-95"
                          title="Create BBA"
                          aria-label="Create BBA"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                            window.location.href = '/admin/email?tab=compose&prefillAllotment=true';
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 active:scale-95"
                          title="Email Client"
                          aria-label="Email Client"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(record)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-gray-400 transition-all hover:scale-105 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
                          title="Delete"
                          aria-label="Delete Record"
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
