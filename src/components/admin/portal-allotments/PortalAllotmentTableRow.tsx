'use client';

import React from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Edit,
  Tag,
  Trash2,
  BookOpen,
  TrendingUp,
  Wallet,
  Clock,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Target,
  Shuffle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AllotmentRecord, AllotmentFinancials } from './types';

export interface PortalAllotmentTableRowProps {
  allotment: AllotmentRecord;
  financials?: AllotmentFinancials;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenLedger?: (allotment: AllotmentRecord) => void;
  onEdit: (allotment: AllotmentRecord) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
  variant?: 'card' | 'table-row';
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function PortalAllotmentTableRow({
  allotment,
  financials,
  isExpanded,
  onToggleExpand,
  onOpenLedger,
  onEdit,
  onDelete,
  children,
  variant = 'card',
  isSelected,
  onToggleSelect,
}: PortalAllotmentTableRowProps) {
  const t = useTranslations('pages.adminPortalAllotments');

  const unitNumber =
    allotment.unit_no ||
    allotment.unit_number ||
    (allotment.metadata?.unit_no as string) ||
    (allotment.metadata?.unitNumber as string) ||
    '—';

  const totalCost = Number(allotment.metadata?.total_cost ?? allotment.total_cost);
  const area = allotment.metadata?.area ?? allotment.area;
  const bookingDate = (allotment.metadata?.booking_date as string) || allotment.booking_date;
  const rawTicketId =
    (allotment.metadata?.ticket_id as string) ||
    (allotment.metadata?.ticketId as string) ||
    (allotment.metadata?.refId as string) ||
    (allotment.metadata?.ref_id as string);
  const ticketId =
    rawTicketId &&
    !rawTicketId.toLowerCase().startsWith('plot ') &&
    !/^svi-[0-9a-f]{4}/i.test(rawTicketId)
      ? rawTicketId
      : null;
  const advisorName =
    allotment.advisor_name ||
    (allotment.metadata?.advisor_name as string) ||
    (allotment.metadata?.advisorName as string);

  const clientPhone =
    (allotment.metadata?.client_phone as string) || allotment.profiles?.phone || '';
  const clientEmail =
    (allotment.metadata?.client_email as string) ||
    allotment.profiles?.real_email ||
    allotment.profiles?.email ||
    '';
  const clientAddress =
    (allotment.metadata?.client_address as string) || (allotment.metadata?.address as string) || '';

  const allotmentMode =
    (allotment.metadata?.allotment_mode as string) ||
    (allotment.metadata?.allotmentMode as string) ||
    '';
  const drawDate =
    (allotment.metadata?.draw_date as string) || (allotment.metadata?.drawDate as string) || '';
  const allotmentDate =
    (allotment.metadata?.allotment_date as string) ||
    (allotment.metadata?.allotmentDate as string) ||
    '';

  const dealValue = financials?.dealValue ?? (isNaN(totalCost) ? 0 : totalCost);
  const totalPaid = financials?.totalPaid ?? 0;
  const balanceDue =
    financials?.balanceDue ?? (dealValue > 0 ? Math.max(0, dealValue - totalPaid) : 0);
  const pct =
    financials?.collectionPercentage ??
    financials?.percentCompleted ??
    (dealValue > 0 ? (totalPaid / dealValue) * 100 : 0);
  const clampedPct = Math.min(Math.max(pct, 0), 100);
  const percentCompleted = clampedPct;

  const overdueSchedules = (allotment.payment_schedules || []).filter((s) => {
    if (!s.due_date) return false;
    const status = (s.status || '').toLowerCase().trim();
    if (status === 'paid') return false;
    const dueTime = new Date(s.due_date).getTime();
    return !isNaN(dueTime) && dueTime < Date.now();
  });

  const earliestOverdue =
    overdueSchedules.length > 0
      ? overdueSchedules.reduce((earliest, current) => {
          const earliestTime = new Date(earliest.due_date).getTime();
          const currentTime = new Date(current.due_date).getTime();
          return currentTime < earliestTime ? current : earliest;
        })
      : null;

  const isOverdue = earliestOverdue !== null;
  const overdueDateStr = earliestOverdue?.due_date
    ? String(earliestOverdue.due_date).split('T')[0]
    : '';

  const isRefundDone = Boolean(
    allotment.notes?.toLowerCase().includes('refund') ||
    (allotment.metadata?.status as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.refund_status as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.notes as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.remarks as string)?.toLowerCase().includes('refund')
  );

  // Table Row Presentation (Desktop & High-density ERP View)
  if (variant === 'table-row') {
    return (
      <React.Fragment>
        <tr
          className={`group border-b border-gray-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.02] ${
            isSelected ? 'bg-brand-gold/10 dark:bg-brand-gold/15' : ''
          }`}
        >
          {/* 0. Selection Checkbox */}
          <td className="w-[44px] px-3 py-3.5 text-center align-top">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect?.(allotment.id)}
              aria-label={`Select unit ${unitNumber}`}
              className="text-brand-gold focus:ring-brand-gold h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
          </td>

          {/* 1. Ref ID (Ticket / Booking Ref) */}
          <td className="w-[130px] px-4 py-3.5 align-top whitespace-nowrap">
            <div className="flex flex-col items-start gap-1">
              {ticketId ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#0f2942] px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-2xs dark:bg-gray-900">
                  <Tag className="text-brand-gold h-2.5 w-2.5" />
                  {ticketId}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-400">
                  <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                  Ref: Missing
                </span>
              )}
            </div>
          </td>

          {/* 2. Unit & Property */}
          <td className="px-4 py-3.5 align-top">
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <span className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                  Unit {unitNumber}
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                {allotment.properties?.name || 'Assigned Property'}
              </div>
              {area !== null && area !== undefined && area !== '' && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{area} Sq. Yds.</div>
              )}
            </div>
          </td>
          {/* 2. Sale Mode (Direct Sell / Draw) */}
          <td className="w-[140px] px-4 py-3.5 align-top whitespace-nowrap">
            <div className="flex flex-col items-start gap-1">
              {allotmentMode === 'Direct Sell' ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-sans text-[10.5px] font-bold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Target className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  Direct Sell
                </span>
              ) : allotmentMode === 'Draw' ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-sans text-[10.5px] font-bold text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
                  <Shuffle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  Draw
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
              {drawDate && drawDate !== 'Direct sell' ? (
                <span className="font-mono text-[10.5px] text-gray-500 dark:text-gray-400">
                  {drawDate}
                </span>
              ) : allotmentDate ? (
                <span className="font-mono text-[10.5px] text-gray-500 dark:text-gray-400">
                  {allotmentDate}
                </span>
              ) : null}
            </div>
          </td>

          {/* 2. Client & Contact */}
          <td className="px-4 py-3.5 align-top">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {allotment.profiles?.full_name || 'Client'}
              </div>
              {clientPhone && (
                <a
                  href={`tel:${clientPhone}`}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  <Phone className="h-2.5 w-2.5" />
                  {clientPhone}
                </a>
              )}
              {clientEmail && (
                <a
                  href={`mailto:${clientEmail}`}
                  title={clientEmail}
                  className="inline-flex max-w-[180px] items-center gap-1 truncate text-[11px] text-gray-500 hover:underline dark:text-gray-400"
                >
                  <Mail className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{clientEmail}</span>
                </a>
              )}
              {clientAddress && (
                <div
                  title={clientAddress}
                  className="flex max-w-[240px] items-start gap-1 text-[10px] leading-tight break-words text-amber-700 dark:text-amber-300"
                >
                  <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                  <span className="break-words">{clientAddress}</span>
                </div>
              )}
            </div>
          </td>

          {/* 3. Advisor */}
          <td className="px-4 py-3.5 align-top">
            {advisorName ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                <UserCheck className="h-3 w-3 shrink-0" />
                <span className="max-w-[120px] truncate">{advisorName}</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </td>

          {/* 4. Deal Value & Rate */}
          <td className="px-4 py-3.5 align-top">
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                {dealValue > 0
                  ? `₹${dealValue.toLocaleString('en-IN')}`
                  : !isNaN(totalCost) && totalCost > 0
                    ? `₹${totalCost.toLocaleString('en-IN')}`
                    : '—'}
              </span>
              {dealValue > 0 && Number(area) > 0 && (
                <span className="text-[10px] text-sky-600 dark:text-sky-400">
                  @ ₹{Math.round(dealValue / Number(area)).toLocaleString('en-IN')}/yd
                </span>
              )}
              {bookingDate && (
                <span className="text-[10px] text-gray-400">Booked: {bookingDate}</span>
              )}
            </div>
          </td>

          {/* 5. Received & Progress */}
          <td className="px-4 py-3.5 align-top">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  {Math.round(clampedPct)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full max-w-[120px] min-w-[70px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    clampedPct >= 100
                      ? 'bg-emerald-500'
                      : clampedPct >= 40
                        ? 'bg-indigo-600 dark:bg-indigo-400'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>
          </td>

          {/* 6. Balance Due */}
          <td className="px-4 py-3.5 align-top">
            <div className="flex flex-col items-start gap-1">
              {isRefundDone ? (
                <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                  Refund Done
                </span>
              ) : (
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {dealValue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : '—'}
                </span>
              )}
              {isOverdue && (
                <span className="mt-1 inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertTriangle className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                  Overdue: {overdueDateStr}
                </span>
              )}
            </div>
          </td>

          {/* 7. Actions */}
          <td className="px-4 py-3.5 text-right align-top">
            <div className="flex items-center justify-end gap-1.5">
              {onOpenLedger && (
                <button
                  type="button"
                  onClick={() => onOpenLedger(allotment)}
                  aria-label="View Client Ledger"
                  title="Open Customer Ledger Statement"
                  className="border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ledger</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleExpand}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                <span className="hidden sm:inline">
                  {isExpanded ? t('hidePayments') : t('viewPayments')}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onEdit(allotment)}
                aria-label={t('editAllotment')}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(allotment.id)}
                aria-label="Delete"
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
        </tr>

        {isExpanded && children && (
          <tr className="border-b border-gray-100 bg-slate-50/60 dark:border-white/5 dark:bg-black/20">
            <td colSpan={10} className="px-4 py-4">
              {children}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  // Card Presentation (Responsive Mobile / Tablet / Grid View)
  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md sm:p-5 ${
        isSelected
          ? 'border-brand-gold/60 ring-brand-gold/40 bg-brand-gold/5 dark:bg-brand-gold/10 ring-1'
          : 'hover:border-brand-gold/30 border-gray-200/80 bg-white dark:border-white/10 dark:bg-gray-800'
      }`}
    >
      {/* Top Header Row: Unit, Property & Direct Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {/* Card Checkbox */}
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect?.(allotment.id)}
              aria-label={`Select unit ${unitNumber}`}
              className="text-brand-gold focus:ring-brand-gold h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="bg-brand-gold/10 hidden rounded-xl p-2.5 sm:block">
            <Building2 className="text-brand-gold h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold">
                Unit {unitNumber}
              </span>
              {ticketId ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#0f2942] px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-2xs dark:bg-gray-900">
                  <Tag className="text-brand-gold h-2.5 w-2.5" />
                  Ref ID: {ticketId}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-600 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-400">
                  <AlertCircle className="h-3 w-3 text-rose-500" />
                  Ref ID: Missing
                </span>
              )}
              {allotmentMode === 'Direct Sell' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-sans text-xs font-bold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <Target className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  Direct Sell {allotmentDate ? `• ${allotmentDate}` : ''}
                </span>
              )}
              {allotmentMode === 'Draw' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-sans text-xs font-bold text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
                  <Shuffle className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Draw Allotment{' '}
                  {drawDate && drawDate !== 'Direct sell'
                    ? `• ${drawDate}`
                    : allotmentDate
                      ? `• ${allotmentDate}`
                      : ''}
                </span>
              )}
              {isRefundDone && (
                <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                  Refund Done
                </span>
              )}
            </div>

            <h3 className="mt-1.5 truncate text-sm font-bold text-gray-900 sm:text-base dark:text-white">
              {allotment.profiles?.full_name || 'Client'}
              {allotment.profiles?.email && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  ({allotment.profiles?.email})
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Quick Edit/Delete icon triggers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(allotment)}
            aria-label={t('editAllotment')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(allotment.id)}
            aria-label="Delete"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Property & Specs Meta Info */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        <p>
          <strong className="text-gray-900 dark:text-gray-300">{t('propertyLabel')}:</strong>{' '}
          {allotment.properties?.name || 'Assigned Property'}
        </p>
        <p>
          <strong className="text-gray-900 dark:text-gray-300">{t('unitLabel')}:</strong>{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{unitNumber}</span>
        </p>
        {area !== null && area !== undefined && area !== '' && (
          <p>
            <strong className="text-gray-900 dark:text-gray-300">{t('area')}:</strong>{' '}
            <span>{area}</span> Sq. Yds.
          </p>
        )}
        {!isNaN(totalCost) && totalCost > 0 && (
          <p>
            <strong className="text-gray-900 dark:text-gray-300">{t('totalCostLabel')}:</strong>{' '}
            <span>₹{totalCost.toLocaleString('en-IN')}</span>
            {Number(area) > 0 && (
              <span className="ml-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                (@ ₹{Math.round(totalCost / Number(area)).toLocaleString('en-IN')}/sq.yd.)
              </span>
            )}
          </p>
        )}
        {bookingDate && (
          <p>
            <strong className="text-gray-900 dark:text-gray-300">{t('bookingDate')}:</strong>{' '}
            <span>{bookingDate}</span>
          </p>
        )}
        {allotmentMode && (
          <p className="flex items-center gap-1">
            <strong className="text-gray-900 dark:text-gray-300">Mode:</strong>{' '}
            <span
              className={
                allotmentMode === 'Direct Sell'
                  ? 'inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300'
                  : 'inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300'
              }
            >
              {allotmentMode === 'Direct Sell' ? (
                <Target className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Shuffle className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
              )}
              {allotmentMode === 'Direct Sell' ? 'Direct Sell' : 'Draw'}
              {drawDate && drawDate !== 'Direct sell'
                ? ` (${drawDate})`
                : allotmentDate
                  ? ` (${allotmentDate})`
                  : ''}
            </span>
          </p>
        )}
        {advisorName && (
          <p className="flex items-center gap-1">
            <strong className="text-gray-900 dark:text-gray-300">{t('advisorLabel')}:</strong>{' '}
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <UserCheck className="h-3 w-3" />
              <span>{advisorName}</span>
            </span>
          </p>
        )}
        {clientPhone && (
          <a
            href={`tel:${clientPhone}`}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 hover:underline dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Phone className="h-3 w-3" />
            {clientPhone}
          </a>
        )}
        {clientEmail && (
          <a
            href={`mailto:${clientEmail}`}
            className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] text-sky-700 hover:underline dark:bg-sky-950/40 dark:text-sky-300"
          >
            <Mail className="h-3 w-3" />
            {clientEmail}
          </a>
        )}
        {clientAddress && (
          <span
            title={clientAddress}
            className="inline-flex items-start gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] leading-snug break-words text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="break-words">{clientAddress}</span>
          </span>
        )}
      </div>

      {/* 3-Column Financial Realization Meter */}
      <div className="mt-3.5 rounded-xl border border-gray-100 bg-slate-50/90 p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-4 sm:text-left">
          {/* Col 1: Deal Value */}
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 sm:justify-start dark:text-gray-400">
              <TrendingUp className="h-3 w-3 text-blue-500" />
              <span>Deal Value</span>
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
              {dealValue > 0 ? `₹${dealValue.toLocaleString('en-IN')}` : 'Not Set'}
            </div>
          </div>

          {/* Col 2: Received */}
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 sm:justify-start dark:text-emerald-400">
              <Wallet className="h-3 w-3" />
              <span>Received</span>
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <div className="mx-auto mt-1.5 h-1.5 w-full max-w-[120px] min-w-[70px] overflow-hidden rounded-full bg-gray-100 sm:mx-0 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  clampedPct >= 100
                    ? 'bg-emerald-500'
                    : clampedPct >= 40
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : 'bg-amber-500'
                }`}
                style={{ width: `${clampedPct}%` }}
              />
            </div>
          </div>

          {/* Col 3: Balance */}
          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-amber-600 sm:justify-start dark:text-amber-400">
              <Clock className="h-3 w-3" />
              <span>Balance</span>
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-amber-600 sm:text-sm dark:text-amber-400">
              {isRefundDone
                ? 'Refunded'
                : dealValue > 0
                  ? `₹${balanceDue.toLocaleString('en-IN')}`
                  : '—'}
            </div>
            {isOverdue && (
              <span className="mt-1 inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertTriangle className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                Overdue: {overdueDateStr}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Realization Percentage */}
        {dealValue > 0 && (
          <div className="mt-2.5 flex items-center gap-2 border-t border-gray-200/60 pt-2 dark:border-white/5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  clampedPct >= 100
                    ? 'bg-emerald-500'
                    : clampedPct >= 40
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : 'bg-amber-500'
                }`}
                style={{ width: `${clampedPct}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              {Math.round(clampedPct)}% Realized
            </span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
        {onOpenLedger ? (
          <button
            type="button"
            onClick={() => onOpenLedger(allotment)}
            aria-label="View Client Ledger"
            title="Open Customer Ledger Statement"
            className="border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Ledger</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className="bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors"
        >
          <span>{isExpanded ? t('hidePayments') : t('viewPayments')}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Schedule Drawer */}
      {isExpanded && children && (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/5">{children}</div>
      )}
    </div>
  );
}
