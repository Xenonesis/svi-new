import React from 'react';
import { Search } from 'lucide-react';
import { PortalAllotmentTableRow } from './PortalAllotmentTableRow';
import { PortalAllotmentScheduleDrawer } from './PortalAllotmentScheduleDrawer';
import type { AllotmentRecord, AllotmentFinancials } from './types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';

export interface PortalAllotmentsActiveViewProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  loading: boolean;
  loadingText: string;
  noAllotmentsFoundText: string;
  filteredAllotments: AllotmentRecord[];
  getAllotmentFinancials: (allotment: AllotmentRecord) => AllotmentFinancials;
  expandedAllotment: string | null;
  onToggleExpand: (id: string) => void;
  onOpenLedger: (target: string | AllotmentRecord) => void;
  onEdit: (allotment: AllotmentRecord) => void;
  onDelete: (id: string) => void;
  onTogglePaymentStatus: (paymentId: string, currentStatus: string) => Promise<void> | void;
  onSelectReceipt: (receipt: SavedReceipt) => void;
  onShareWhatsApp: (receipt: SavedReceipt) => void;
}

export function PortalAllotmentsActiveView({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  loading,
  loadingText,
  noAllotmentsFoundText,
  filteredAllotments,
  getAllotmentFinancials,
  expandedAllotment,
  onToggleExpand,
  onOpenLedger,
  onEdit,
  onDelete,
  onTogglePaymentStatus,
  onSelectReceipt,
  onShareWhatsApp,
}: PortalAllotmentsActiveViewProps): React.JSX.Element {
  return (
    <div>
      {/* Search Filter */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-12 text-center text-gray-500">{loadingText}</div>
        ) : filteredAllotments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">{noAllotmentsFoundText}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAllotments.map((allotment) => (
              <PortalAllotmentTableRow
                key={allotment.id}
                allotment={allotment}
                financials={getAllotmentFinancials(allotment)}
                isExpanded={expandedAllotment === allotment.id}
                onToggleExpand={() => onToggleExpand(allotment.id)}
                onOpenLedger={onOpenLedger}
                onEdit={onEdit}
                onDelete={onDelete}
              >
                <PortalAllotmentScheduleDrawer
                  isExpanded={expandedAllotment === allotment.id}
                  allotment={allotment}
                  paymentSchedules={allotment.payment_schedules}
                  receipts={allotment.receipts}
                  onOpenLedger={(target) => {
                    if (target) onOpenLedger(target);
                    else onOpenLedger(allotment);
                  }}
                  onToggleStatus={onTogglePaymentStatus}
                  onSelectReceipt={onSelectReceipt}
                  onShareWhatsApp={onShareWhatsApp}
                />
              </PortalAllotmentTableRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
