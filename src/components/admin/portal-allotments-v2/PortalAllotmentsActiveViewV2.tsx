'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, SearchX } from 'lucide-react';
import { PortalAllotmentTableRowV2 } from './PortalAllotmentTableRowV2';
import { PortalAllotmentScheduleDrawer } from '../portal-allotments/PortalAllotmentScheduleDrawer';
import { PortalAllotmentsFilterBarV2 } from './PortalAllotmentsFilterBarV2';
import type {
  AllotmentRecord,
  AllotmentFinancials,
  PropertySummary,
  PaymentStatusFilter,
  SaleModeFilter,
  SortField,
  SortDirection,
} from '../portal-allotments/types';
import type { SavedReceipt } from '../payment-receipts/ReceiptTypes';

export interface PortalAllotmentsActiveViewV2Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  loading: boolean;
  loadingText: string;
  noAllotmentsFoundText: string;
  filteredAllotments: AllotmentRecord[];
  allotments?: AllotmentRecord[];
  getAllotmentFinancials: (allotment: AllotmentRecord) => AllotmentFinancials;
  expandedAllotment: string | null;
  onToggleExpand: (id: string) => void;
  onOpenLedger: (target: string | AllotmentRecord) => void;
  onEdit: (allotment: AllotmentRecord) => void;
  onDelete: (id: string) => void;
  onTogglePaymentStatus: (paymentId: string, currentStatus: string) => Promise<void> | void;
  onSelectReceipt: (receipt: SavedReceipt) => void;
  onShareWhatsApp: (receipt: SavedReceipt) => void;
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
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  selectedIds?: Set<string>;
  onToggleSelectRow?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  onExportSelected?: (format: 'csv' | 'excel' | 'pdf') => void | Promise<void>;
  isExporting?: boolean;
}

export function PortalAllotmentsActiveViewV2({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  loading,
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
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
  onExportSelected,
  isExporting = false,
}: PortalAllotmentsActiveViewV2Props): React.JSX.Element {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const handlePropertyChange = onPropertyChange || setSelectedProperty || (() => {});
  const handlePaymentStatusChange = onPaymentStatusChange || setSelectedPaymentStatus || (() => {});
  const handleSaleModeChange = onSaleModeChange || setSelectedSaleMode || (() => {});
  const handleAdvisorChange = onAdvisorChange || setSelectedAdvisor || (() => {});
  const handleResetFilters = onResetFilters || resetFilters || (() => {});

  const renderSortableHeader = (field: SortField, title: string, className?: string) => {
    const isSorted = sortField === field;
    return (
      <th className={className}>
        <button
          type="button"
          onClick={() => onSort?.(field)}
          aria-label={`Sort by ${title.replace('\n', ' ')}`}
          className="group inline-flex items-center gap-1.5 font-bold tracking-wider text-slate-500 uppercase hover:text-slate-900 dark:text-[#8E9BAE] dark:hover:text-white"
        >
          <span className="text-left leading-tight whitespace-pre-line">{title}</span>
          {isSorted && sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-slate-900 dark:text-white" />
          ) : isSorted && sortDirection === 'desc' ? (
            <ArrowDown className="h-3 w-3 text-slate-900 dark:text-white" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Precision Single-Row Control Bar */}
      <PortalAllotmentsFilterBarV2
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
        selectedCount={selectedIds?.size || 0}
        onExportSelected={onExportSelected}
        isExporting={isExporting}
      />

      {/* 2. Main Data Presentation */}
      {loading ? (
        <div className="border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0D1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/[0.08] dark:bg-[#161D2C] dark:text-slate-400">
                <tr>
                  <th className="w-[40px] px-3 py-3 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="w-[110px] px-3 py-3">Ref ID</th>
                  <th className="w-[90px] px-3 py-3">Unit</th>
                  <th className="px-3 py-3">Property</th>
                  <th className="w-[90px] px-3 py-3">Size</th>
                  <th className="w-[95px] px-3 py-3">Mode</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Advisor</th>
                  <th className="px-3 py-3">Deal Value</th>
                  <th className="px-3 py-3">Received</th>
                  <th className="px-3 py-3">Balance</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="w-[40px] px-3 py-3 text-center">
                      <div className="mx-auto h-3.5 w-3.5 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="w-[110px] px-3 py-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="w-[90px] px-3 py-3">
                      <div className="h-4 w-12 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="w-[90px] px-3 py-3">
                      <div className="h-4 w-14 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="w-[95px] px-3 py-3">
                      <div className="h-4 w-14 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="ml-auto h-4 w-12 bg-slate-200 dark:bg-white/10" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredAllotments.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 bg-white/50 px-6 py-14 text-center dark:border-white/[0.1] dark:bg-[#0D1117]/50">
          <SearchX className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-white">
            {noAllotmentsFoundText}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            No plot allotments match your current filter parameters.
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 text-xs font-semibold text-slate-900 underline underline-offset-4 dark:text-white"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="border border-slate-200 bg-white dark:border-white/[0.1] dark:bg-[#0D1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1360px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-white/[0.1] dark:bg-[#161D2C] dark:text-slate-400">
                <tr>
                  <th className="w-[40px] border-r border-slate-200 px-3.5 py-3 text-center dark:border-white/[0.08]">
                    {onToggleSelectAll && (
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = Boolean(isSomeSelected && !isAllSelected);
                        }}
                        onChange={onToggleSelectAll}
                        aria-label="Select all rows"
                        className="h-3.5 w-3.5 rounded-none border-slate-300 text-slate-900 focus:ring-0 dark:border-white/20 dark:bg-black"
                      />
                    )}
                  </th>
                  {renderSortableHeader(
                    'ref_id',
                    'Ref ID',
                    'w-[105px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  {renderSortableHeader(
                    'unit_number',
                    'Unit',
                    'w-[85px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  <th className="min-w-[130px] border-r border-slate-200 px-3 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Property
                  </th>
                  <th className="w-[80px] border-r border-slate-200 px-3 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Size
                  </th>
                  <th className="w-[85px] border-r border-slate-200 px-3 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Mode
                  </th>
                  <th className="min-w-[240px] border-r border-slate-200 px-3.5 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Client
                  </th>
                  <th className="min-w-[130px] border-r border-slate-200 px-3 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Advisor
                  </th>
                  {renderSortableHeader(
                    'deal_value',
                    'Deal Value',
                    'min-w-[110px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  <th className="min-w-[110px] border-r border-slate-200 px-3 py-3 font-semibold tracking-wider uppercase dark:border-white/[0.08]">
                    Rate / yd²
                  </th>
                  {renderSortableHeader(
                    'booking_date',
                    'Booking Date',
                    'min-w-[120px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  {renderSortableHeader(
                    'collection_pct',
                    'RECEIVED\n/ %',
                    'min-w-[120px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  {renderSortableHeader(
                    'balance_due',
                    'BALANCE\nDUE',
                    'min-w-[110px] border-r border-slate-200 px-3 py-3 dark:border-white/[0.08]'
                  )}
                  <th className="w-[200px] px-3 py-3 text-right font-semibold tracking-wider uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAllotments.map((allotment) => {
                  const fin = getAllotmentFinancials(allotment);
                  const isExp = expandedAllotment === allotment.id;
                  const isSel = selectedIds ? selectedIds.has(allotment.id) : false;

                  return (
                    <PortalAllotmentTableRowV2
                      key={allotment.id}
                      allotment={allotment}
                      financials={fin}
                      isExpanded={isExp}
                      onToggleExpand={() => onToggleExpand(allotment.id)}
                      onOpenLedger={onOpenLedger}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onShareWhatsApp={onShareWhatsApp}
                      variant="table-row"
                      isSelected={isSel}
                      onToggleSelect={onToggleSelectRow}
                    >
                      {isExp && (
                        <tr>
                          <td
                            colSpan={14}
                            className="border-b border-slate-200 bg-slate-50/50 p-4 dark:border-white/[0.08] dark:bg-white/[0.02]"
                          >
                            <PortalAllotmentScheduleDrawer
                              isExpanded={isExp}
                              allotment={allotment}
                              paymentSchedules={allotment.payment_schedules || []}
                              receipts={allotment.receipts || []}
                              onTogglePaymentStatus={onTogglePaymentStatus}
                              onSelectReceipt={onSelectReceipt}
                              onShareWhatsApp={onShareWhatsApp}
                              onOpenLedger={(target) => {
                                if (target) onOpenLedger(target);
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </PortalAllotmentTableRowV2>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAllotments.map((allotment) => {
            const fin = getAllotmentFinancials(allotment);
            const isExp = expandedAllotment === allotment.id;
            const isSel = selectedIds ? selectedIds.has(allotment.id) : false;

            return (
              <PortalAllotmentTableRowV2
                key={allotment.id}
                allotment={allotment}
                financials={fin}
                isExpanded={isExp}
                onToggleExpand={() => onToggleExpand(allotment.id)}
                onOpenLedger={onOpenLedger}
                onEdit={onEdit}
                onDelete={onDelete}
                onShareWhatsApp={onShareWhatsApp}
                variant="card"
                isSelected={isSel}
                onToggleSelect={onToggleSelectRow}
              >
                {isExp && (
                  <div className="mt-3 border-t border-slate-100 pt-3 dark:border-white/[0.05]">
                    <PortalAllotmentScheduleDrawer
                      isExpanded={isExp}
                      allotment={allotment}
                      paymentSchedules={allotment.payment_schedules || []}
                      receipts={allotment.receipts || []}
                      onTogglePaymentStatus={onTogglePaymentStatus}
                      onSelectReceipt={onSelectReceipt}
                      onShareWhatsApp={onShareWhatsApp}
                      onOpenLedger={(target) => {
                        if (target) onOpenLedger(target);
                      }}
                    />
                  </div>
                )}
              </PortalAllotmentTableRowV2>
            );
          })}
        </div>
      )}
    </div>
  );
}
