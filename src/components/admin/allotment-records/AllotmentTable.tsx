'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Eye,
  FileText,
  Building2,
  Mail,
  Phone,
  Trash2,
  WifiOff,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';
import type { SavedAllotment } from './types';
import { calculateTotalCost } from './types';
import { CLIENT_CONTACT_MAP } from '@/src/components/admin/payment-receipts/clientContactMap';
interface AllotmentTableProps {
  loading: boolean;
  error: string | null;
  records: SavedAllotment[];
  searchQuery: string;
  onRefresh: () => void;
  onSelectRecord: (record: SavedAllotment) => void;
  onDeleteRecord: (record: SavedAllotment) => void;
  highlightedId?: string | null;
}

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-white/5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
          <SkeletonBlock className="h-4 w-24 rounded-lg" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-12 rounded-md" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16 rounded-full" />
          <SkeletonBlock className="h-4 w-24" />
          <div className="ml-auto flex gap-1">
            <SkeletonBlock className="h-8 w-8 rounded-lg" />
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
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AllotmentTable({
  loading,
  error,
  records,
  searchQuery,
  onRefresh,
  onSelectRecord,
  onDeleteRecord,
  highlightedId,
}: AllotmentTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTicket = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ticketId);
    setCopiedId(ticketId);
    toast.success(`Copied ${ticketId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const ticketIdCounts: Record<string, number> = {};
  records.forEach((r) => {
    const tId = r.form_data?.ticketId;
    if (tId) {
      ticketIdCounts[tId] = (ticketIdCounts[tId] || 0) + 1;
    }
  });
  const duplicateTicketIds = new Set(
    Object.keys(ticketIdCounts).filter((tId) => ticketIdCounts[tId] > 1)
  );

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
          <>
            <div className="border-b border-gray-200/80 bg-gray-50/80 px-6 py-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
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
              onClick={onRefresh}
              className="text-brand-gold hover:text-brand-gold-light mx-auto mt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="py-24 text-center font-sans">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No matches found for your search.'
                : 'No allotment records generated yet.'}
            </p>
            <Link
              href="/admin/allotment-letter"
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase shadow-md transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              Create New Allotment
            </Link>
          </div>
        ) : (
          <table className="w-full min-w-[940px] font-sans text-xs">
            <thead>
              <tr className="border-b border-gray-200/80 bg-gray-50/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                {[
                  { label: 'TICKET ID', align: 'text-left', width: 'w-28' },
                  { label: 'CLIENT NAME', align: 'text-left', width: 'w-[240px]' },
                  { label: 'PROJECT', align: 'text-left', width: 'w-28' },
                  { label: 'UNIT / PLOT', align: 'text-center', width: 'w-24' },
                  { label: 'AREA', align: 'text-left', width: 'w-24' },
                  { label: 'TOTAL COST', align: 'text-right', width: 'w-28' },
                  { label: 'PLAN', align: 'text-center', width: 'w-20' },
                  { label: 'DATE & TIME', align: 'text-left', width: 'w-28' },
                  { label: 'ACTIONS', align: 'text-right', width: 'w-44' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-3.5 py-3 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-gray-500 uppercase dark:text-gray-400 ${h.align} ${h.width}`}
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
                const isDuplicate = ticketId && duplicateTicketIds.has(ticketId);
                const isCopied = ticketId && copiedId === ticketId;
                const { date, time } = record.created_at
                  ? formatDateTimeParts(record.created_at)
                  : { date: '—', time: '' };
                const isHighlighted = highlightedId === record.id;
                const isRefundDone =
                  (record.form_data as Record<string, any>)?.refundStatus === 'Refund Done' ||
                  (record.form_data as Record<string, any>)?.notes
                    ?.toLowerCase()
                    .includes('refund') ||
                  (record.form_data as Record<string, any>)?.remarks
                    ?.toLowerCase()
                    .includes('refund');

                const displayName =
                  record.form_data?.applicantName || record.form_data?.clientName || 'N/A';
                const rawTicketId = record.form_data?.ticketId
                  ? record.form_data.ticketId.trim().toLowerCase()
                  : '';
                const contactFromMap = rawTicketId ? CLIENT_CONTACT_MAP[rawTicketId] : undefined;
                const formDataAny = (record.form_data || {}) as Record<string, string | undefined>;
                const clientPhone =
                  formDataAny.phone ||
                  formDataAny.mobile ||
                  formDataAny.contactNumber ||
                  formDataAny.clientPhone ||
                  contactFromMap?.phone;
                const clientEmail =
                  formDataAny.email || formDataAny.clientEmail || contactFromMap?.email;

                return (
                  <motion.tr
                    key={record.id}
                    id={`allotment-row-${record.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.25 }}
                    className={`group transition-all duration-200 ${
                      isHighlighted
                        ? 'bg-brand-gold/[0.06] shadow-[inset_3px_0_0_0_#d4af37] dark:bg-amber-400/[0.05] dark:shadow-[inset_3px_0_0_0_#d4af37]'
                        : 'hover:bg-gray-50/70 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Ticket ID */}
                    <td className="px-3.5 py-3 align-middle whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        {ticketId ? (
                          <button
                            type="button"
                            onClick={(e) => handleCopyTicket(ticketId, e)}
                            className="group/copy border-brand-gold/30 bg-brand-gold/10 hover:border-brand-gold/50 hover:bg-brand-gold/20 inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold text-amber-600 transition-all dark:text-amber-400"
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

                        {isDuplicate && (
                          <span
                            className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"
                            title="Duplicate Ticket ID detected in database"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                            Duplicate
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client Name (2-Line Luxury Hierarchy) */}
                    <td className="px-3.5 py-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="border-brand-gold/25 bg-brand-gold/10 text-brand-gold flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold shadow-2xs"
                          aria-hidden="true"
                        >
                          {getInitials(displayName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-semibold text-gray-900 capitalize dark:text-white">
                              {displayName}
                            </span>
                            {isRefundDone && (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                                Refund Done
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            {clientPhone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" />
                                <span>{clientPhone}</span>
                              </span>
                            )}
                            {clientPhone && clientEmail && (
                              <span className="text-gray-300 dark:text-gray-600">&bull;</span>
                            )}
                            {clientEmail && (
                              <span
                                className="inline-flex max-w-[130px] items-center gap-1 truncate"
                                title={clientEmail}
                              >
                                <Mail className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" />
                                <span className="truncate">{clientEmail}</span>
                              </span>
                            )}
                            {!clientPhone && !clientEmail && record.form_data?.advisorName && (
                              <span className="font-sans text-[10px] text-gray-400 dark:text-gray-500">
                                Adv: {record.form_data.advisorName}
                              </span>
                            )}
                            {!clientPhone && !clientEmail && !record.form_data?.advisorName && (
                              <span className="font-sans text-[10px] text-gray-400 dark:text-gray-500">
                                {record.form_data?.address
                                  ? record.form_data.address.split(',')[0]
                                  : '—'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-3.5 py-3 align-middle font-medium whitespace-nowrap text-gray-700 capitalize dark:text-gray-300">
                      {record.form_data?.projectName || 'N/A'}
                    </td>

                    {/* Unit / Plot */}
                    <td className="px-3.5 py-3 text-center align-middle whitespace-nowrap">
                      {record.form_data?.unitNumber ? (
                        <span className="inline-block rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-bold text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
                          {record.form_data.unitNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Area */}
                    <td className="px-3.5 py-3 align-middle font-medium whitespace-nowrap text-gray-600 tabular-nums dark:text-gray-400">
                      {record.form_data?.area ? `${record.form_data.area} Sq. Yds.` : '—'}
                    </td>

                    {/* Total Cost */}
                    <td className="px-3.5 py-3 text-right align-middle font-mono text-xs font-bold whitespace-nowrap text-gray-900 tabular-nums dark:text-white">
                      {formattedCost}
                    </td>

                    {/* Plan */}
                    <td className="px-3.5 py-3 text-center align-middle whitespace-nowrap">
                      <span className="inline-block rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                        {record.form_data?.paymentPlan || '12'} Months
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-3.5 py-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] font-medium text-gray-800 tabular-nums dark:text-gray-200">
                            {date}
                          </span>
                          {time && (
                            <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                              {time}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3 text-right align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold dark:hover:border-brand-gold/50 dark:hover:bg-brand-gold/15 dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-2xs transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                          title="View & Print Allotment Letter"
                          aria-label="View & Print"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/admin/allotment-letter?templateId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-2xs transition-all hover:scale-105 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-blue-400/50 dark:hover:bg-blue-400/15 dark:hover:text-blue-400"
                          title="Use as Template"
                          aria-label="Use as Template"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/bba?allotmentId=${record.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-2xs transition-all hover:scale-105 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-amber-400/50 dark:hover:bg-amber-400/15 dark:hover:text-amber-400"
                          title="Create BBA from Allotment"
                          aria-label="Create BBA"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            sessionStorage.setItem('emailPrefillRecord', JSON.stringify(record));
                            window.location.href = '/admin/email?tab=compose&prefillAllotment=true';
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-2xs transition-all hover:scale-105 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-purple-400/50 dark:hover:bg-purple-400/15 dark:hover:text-purple-400"
                          title="Email Document to Client"
                          aria-label="Email Client"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500 shadow-2xs transition-all hover:scale-105 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-rose-400/50 dark:hover:bg-rose-400/15 dark:hover:text-rose-400"
                          title="Delete Allotment Record"
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
