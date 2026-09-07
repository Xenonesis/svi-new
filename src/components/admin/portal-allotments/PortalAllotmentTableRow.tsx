'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
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

  return (
    <div className="p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="bg-brand-gold/10 hidden rounded-xl p-3 sm:block">
            <Building2 className="text-brand-gold h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {allotment.profiles?.full_name}{' '}
              <span className="font-normal text-gray-400">({allotment.profiles?.email})</span>
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-gray-300">{t('propertyLabel')}:</strong>{' '}
                {allotment.properties?.name}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-gray-300">{t('unitLabel')}:</strong>{' '}
                {allotment.unit_number}
              </p>
              {allotment.area !== null && allotment.area !== undefined && allotment.area !== '' && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">{t('area')}:</strong>{' '}
                  {allotment.area}
                </p>
              )}
              <p>
                <strong className="text-gray-900 dark:text-gray-300">{t('totalCostLabel')}:</strong>{' '}
                ₹{allotment.total_cost?.toLocaleString('en-IN')}
              </p>
              {allotment.booking_date && (
                <p>
                  <strong className="text-gray-900 dark:text-gray-300">{t('bookingDate')}:</strong>{' '}
                  {allotment.booking_date}
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
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(allotment.id)}
            aria-label={t('deleteConfirmation')}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
