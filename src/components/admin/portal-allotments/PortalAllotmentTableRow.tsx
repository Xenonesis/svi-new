'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronUp, Edit, Tag, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AllotmentRecord } from './types';

export interface PortalAllotmentTableRowProps {
  allotment: AllotmentRecord;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (allotment: AllotmentRecord) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

export function PortalAllotmentTableRow({
  allotment,
  isExpanded,
  onToggleExpand,
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
                </p>
              )}
              {bookingDate && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">{t('bookingDate')}:</strong>{' '}
                  {bookingDate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
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
