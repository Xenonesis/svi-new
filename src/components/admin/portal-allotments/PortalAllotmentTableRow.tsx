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
}: PortalAllotmentTableRowProps) {
  const t = useTranslations('pages.adminPortalAllotments');

  const ticketId = allotment.metadata?.ticket_id || allotment.metadata?.ticketId;
  const unitNumber = allotment.unit_no || allotment.unit_number || '—';
  const area = allotment.metadata?.area ?? allotment.area;
  const totalCost = Number(allotment.metadata?.total_cost ?? allotment.total_cost);
  const bookingDate = allotment.allotted_date || allotment.booking_date;
  const advisorName =
    allotment.advisor_name ||
    (allotment.metadata?.advisor_name as string) ||
    (allotment.metadata?.advisorName as string);

  const dealValue = financials?.dealValue ?? (isNaN(totalCost) ? 0 : totalCost);
  const totalPaid = financials?.totalPaid ?? 0;
  const balanceDue =
    financials?.balanceDue ?? (dealValue > 0 ? Math.max(0, dealValue - totalPaid) : 0);
  const percentCompleted =
    financials?.percentCompleted ??
    (dealValue > 0 ? Math.min(100, (totalPaid / dealValue) * 100) : 0);

  const isRefundDone = Boolean(
    allotment.notes?.toLowerCase().includes('refund') ||
    (allotment.metadata?.status as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.refund_status as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.notes as string)?.toLowerCase().includes('refund') ||
    (allotment.metadata?.remarks as string)?.toLowerCase().includes('refund')
  );

  return (
    <div className="p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-gray-800/50">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="bg-brand-gold/10 hidden rounded-xl p-3 sm:block">
            <Building2 className="text-brand-gold h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {allotment.profiles?.full_name || 'Client'}
              </h3>
              {allotment.profiles?.email && (
                <span className="text-sm font-normal text-gray-400">
                  ({allotment.profiles?.email})
                </span>
              )}
              {ticketId && (
                <span className="dark:text-brand-gold inline-flex items-center gap-1 rounded-md bg-[#0f2942] px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-2xs dark:bg-gray-900">
                  <Tag className="text-brand-gold h-3 w-3" />
                  {ticketId}
                </span>
              )}
              {isRefundDone && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-rose-600 uppercase dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-400">
                  Refund Done
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-gray-300">{t('propertyLabel')}:</strong>{' '}
                {allotment.properties?.name || 'Assigned Property'}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-gray-300">{t('unitLabel')}:</strong>{' '}
                <span className="dark:text-brand-gold font-semibold text-[#0f2942]">
                  {unitNumber}
                </span>
              </p>
              {area !== null && area !== undefined && area !== '' && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">{t('area')}:</strong>{' '}
                  <span>{area}</span> Sq. Yds.
                </p>
              )}
              {!isNaN(totalCost) && totalCost > 0 && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">
                    {t('totalCostLabel')}:
                  </strong>{' '}
                  ₹{totalCost.toLocaleString('en-IN')}
                  {Number(area) > 0 && (
                    <span className="ml-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      (@ ₹{Math.round(totalCost / Number(area)).toLocaleString('en-IN')}/sq.yd.)
                    </span>
                  )}
                </p>
              )}
              {bookingDate && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">{t('bookingDate')}:</strong>{' '}
                  {bookingDate}
                </p>
              )}
              {advisorName && (
                <p className="flex items-center gap-1.5">
                  <strong className="text-gray-900 dark:text-gray-300">{t('advisorLabel')}:</strong>{' '}
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <UserCheck className="h-3 w-3" />
                    {advisorName}
                  </span>
                </p>
              )}
              {isRefundDone && (
                <p className="flex items-center gap-1.5">
                  <strong className="text-gray-900 dark:text-gray-300">Status:</strong>{' '}
                  <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    Refund Done
                  </span>
                </p>
              )}
            </div>

            {/* Per-Client Sales Revenue & Payment Realization Bar */}
            <div className="mt-3.5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200/70 bg-slate-50/80 p-2.5 text-xs dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-500 dark:text-gray-400">Sales Value:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {dealValue > 0 ? `₹${dealValue.toLocaleString('en-IN')}` : 'Not Set'}
                  {dealValue > 0 && Number(area) > 0 && (
                    <span className="ml-1 text-[11px] font-normal text-sky-600 dark:text-sky-400">
                      (₹{Math.round(dealValue / Number(area)).toLocaleString('en-IN')}/sq.yd.)
                    </span>
                  )}
                </span>
              </div>

              <span className="text-gray-300 dark:text-gray-600">•</span>

              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-500 dark:text-gray-400">Received:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
              </div>

              <span className="text-gray-300 dark:text-gray-600">•</span>

              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {dealValue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : '—'}
                </span>
              </div>

              {dealValue > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 sm:w-20 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(100, percentCompleted)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                    {Math.round(percentCompleted)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {onOpenLedger && (
            <button
              type="button"
              onClick={() => onOpenLedger(allotment)}
              aria-label="View Client Ledger"
              title="Open Customer Ledger Statement"
              className="border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-bold transition-all active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Ledger</span>
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className="text-brand-navy dark:text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {isExpanded ? t('hidePayments') : t('viewPayments')}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onEdit(allotment)}
            aria-label={t('editAllotment')}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(allotment.id)}
            aria-label="Delete"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
