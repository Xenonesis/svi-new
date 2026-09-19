'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { PortalAllotmentTableRow } from './PortalAllotmentTableRow';
import { PortalAllotmentScheduleDrawer } from './PortalAllotmentScheduleDrawer';
import { PortalAllotmentsFilterBar } from './PortalAllotmentsFilterBar';
import type {
  AllotmentRecord,
  AllotmentFinancials,
  PropertySummary,
  PaymentStatusFilter,
  SaleModeFilter,
} from './types';
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
  // Filter props from usePortalAllotmentsAdmin
  selectedProperty: string;
  setSelectedProperty?: (propertyId: string) => void;
  onPropertyChange?: (propertyId: string) => void;
  properties: PropertySummary[] | Array<{ id: string; name: string }>;
  selectedPaymentStatus: PaymentStatusFilter;
  setSelectedPaymentStatus?: (status: PaymentStatusFilter) => void;
  onPaymentStatusChange?: (status: PaymentStatusFilter) => void;
  selectedSaleMode: SaleModeFilter;
  setSelectedSaleMode?: (mode: SaleModeFilter) => void;
  onSaleModeChange?: (mode: SaleModeFilter) => void;
  selectedAdvisor: string;
  setSelectedAdvisor?: (advisor: string) => void;
  onAdvisorChange?: (advisor: string) => void;
  advisors: string[];
  activeFilterCount: number;
  resetFilters?: () => void;
  onResetFilters?: () => void;
}

type ViewMode = 'table' | 'cards';

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
  selectedProperty,
  setSelectedProperty,
  onPropertyChange,
  properties,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  onPaymentStatusChange,
  selectedSaleMode,
  setSelectedSaleMode,
  onSaleModeChange,
  selectedAdvisor,
  setSelectedAdvisor,
  onAdvisorChange,
  advisors,
  activeFilterCount,
  resetFilters,
  onResetFilters,
}: PortalAllotmentsActiveViewProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const handlePropertyChange = onPropertyChange || setSelectedProperty || (() => {});
  const handlePaymentStatusChange = onPaymentStatusChange || setSelectedPaymentStatus || (() => {});
  const handleSaleModeChange = onSaleModeChange || setSelectedSaleMode || (() => {});
  const handleAdvisorChange = onAdvisorChange || setSelectedAdvisor || (() => {});
  const handleResetFilters = onResetFilters || resetFilters || (() => {});
  return (
    <div className="space-y-4">
      {/* 1. Multi-Dimension Filter Bar */}
      <PortalAllotmentsFilterBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        properties={properties}
        selectedPaymentStatus={selectedPaymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
        selectedSaleMode={selectedSaleMode}
        onSaleModeChange={handleSaleModeChange}
        selectedAdvisor={selectedAdvisor}
        onAdvisorChange={handleAdvisorChange}
        advisors={advisors}
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 3. Main Data Presentation (Table or Cards) */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          {loadingText}
        </div>
      ) : filteredAllotments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium">{noAllotmentsFoundText}</p>
          {activeFilterCount > 0 && (
            <button type="button" onClick={handleResetFilters}>
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filter Scope
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE PRESENTATION */
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-gray-800">
          {/* Subtle mobile hint for horizontal scrolling on narrow screens */}
          <div className="block border-b border-gray-100 bg-slate-50 px-3 py-1.5 text-right text-[11px] text-gray-500 lg:hidden dark:border-white/5 dark:bg-white/[0.02] dark:text-gray-400">
            Swipe table horizontally to view full columns ⇄
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-xs">
              <thead className="border-b border-gray-200 bg-slate-50/90 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                <tr>
                  <th className="w-[130px] px-4 py-3.5">Ref ID</th>
                  <th className="px-4 py-3.5">Unit & Property</th>
                  <th className="w-[140px] px-4 py-3.5">Sale Mode</th>
                  <th className="px-4 py-3.5">Client & Contact</th>
                  <th className="px-4 py-3.5">Advisor</th>
                  <th className="px-4 py-3.5">Deal Value</th>
                  <th className="px-4 py-3.5">Received / %</th>
                  <th className="px-4 py-3.5">Balance Due</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredAllotments.map((allotment) => (
                  <PortalAllotmentTableRow
                    key={allotment.id}
                    variant="table-row"
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
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID PRESENTATION (Optimized for mobile / visual comparison) */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredAllotments.map((allotment) => (
            <PortalAllotmentTableRow
              key={allotment.id}
              variant="card"
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
  );
}
