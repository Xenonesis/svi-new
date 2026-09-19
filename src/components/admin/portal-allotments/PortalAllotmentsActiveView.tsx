'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Layers,
  SearchX,
} from 'lucide-react';
import { PortalAllotmentTableRow } from './PortalAllotmentTableRow';
import { PortalAllotmentScheduleDrawer } from './PortalAllotmentScheduleDrawer';
import { PortalAllotmentsFilterBar } from './PortalAllotmentsFilterBar';
import type {
  AllotmentRecord,
  AllotmentFinancials,
  PropertySummary,
  PaymentStatusFilter,
  SaleModeFilter,
  SortField,
  SortDirection,
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
  // Sorting props
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  // Multi-select bulk actions
  selectedIds?: Set<string>;
  onToggleSelectRow?: (id: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
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
  sortField,
  sortDirection,
  onSort,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  isAllSelected,
  isSomeSelected,
}: PortalAllotmentsActiveViewProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

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
          aria-label={`Sort by ${title}`}
          className="group inline-flex items-center gap-1.5 font-bold tracking-wider uppercase hover:text-gray-900 dark:hover:text-white"
        >
          <span>{title}</span>
          {isSorted && sortDirection === 'asc' ? (
            <ArrowUp className="text-brand-gold h-3 w-3" />
          ) : isSorted && sortDirection === 'desc' ? (
            <ArrowDown className="text-brand-gold h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </th>
    );
  };

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
        viewMode === 'table' ? (
          /* TABLE SHIMMER SKELETON (10 Columns x 5 Rows) */
          <div
            data-testid="allotments-table-skeleton"
            className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-white/10 dark:bg-gray-800"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-xs">
                <thead className="border-b border-gray-200 bg-slate-50/90 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                  <tr>
                    <th className="w-[44px] px-3 py-3.5 text-center">
                      <span className="sr-only">Select</span>
                    </th>
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse" data-testid="skeleton-row">
                      <td className="w-[44px] px-3 py-3.5 text-center">
                        <div className="mx-auto h-4 w-4 rounded bg-gray-200 dark:bg-gray-700/60" />
                      </td>
                      <td className="w-[130px] px-4 py-3.5">
                        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700/60" />
                          <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700/60" />
                        </div>
                      </td>
                      <td className="w-[140px] px-4 py-3.5">
                        <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-gray-700/60" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700/60" />
                          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700/60" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-gray-700/60" />
                          <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700/60" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <div className="h-7 w-16 rounded-xl bg-gray-200 dark:bg-gray-700/60" />
                          <div className="h-7 w-8 rounded-lg bg-gray-200 dark:bg-gray-700/60" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CARD SHIMMER SKELETON (4 Cards Grid) */
          <div
            data-testid="allotments-cards-skeleton"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                data-testid="skeleton-card"
                className="animate-pulse rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded bg-gray-200 dark:bg-gray-700/60" />
                    <div className="hidden h-9 w-9 rounded-xl bg-gray-200 sm:block dark:bg-gray-700/60" />
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-gray-700/60" />
                        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700/60" />
                      </div>
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700/60" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700/60" />
                    <div className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700/60" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700/60" />
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60" />
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700/60" />
                </div>
                <div className="mt-4 rounded-xl border border-gray-100 bg-slate-50/90 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700/60" />
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700/60" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700/60" />
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700/60" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700/60" />
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700/60" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 dark:border-white/5">
                  <div className="h-8 w-20 rounded-xl bg-gray-200 dark:bg-gray-700/60" />
                  <div className="h-8 w-28 rounded-xl bg-gray-200 dark:bg-gray-700/60" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredAllotments.length === 0 ? (
        /* ARCHITECTURAL EMPTY STATE */
        <div className="rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-xs dark:border-white/10 dark:bg-gray-800">
          <div className="bg-brand-gold/10 text-brand-gold dark:bg-brand-gold/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            {activeFilterCount > 0 ? (
              <SearchX className="h-8 w-8" />
            ) : (
              <div className="relative">
                <Building2 className="h-8 w-8" />
                <Layers className="text-brand-gold absolute -right-1 -bottom-1 h-4 w-4" />
              </div>
            )}
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
            No Allotments Found
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-gray-500 dark:text-gray-400">
            {activeFilterCount > 0
              ? 'No plot allotments match your current filter criteria. Try clearing filters or refining your search.'
              : 'No active plot allotments have been created yet.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold mt-4 inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters ({activeFilterCount})
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
            <table className="w-full min-w-[1100px] text-left text-xs">
              <thead className="border-b border-gray-200 bg-slate-50/90 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                <tr>
                  <th className="w-[44px] px-3 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = Boolean(isSomeSelected);
                      }}
                      onChange={onToggleSelectAll}
                      aria-label="Select all allotments"
                      className="text-brand-gold focus:ring-brand-gold h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
                  {renderSortableHeader('ref_id', 'Ref ID', 'w-[130px] px-4 py-3.5')}
                  {renderSortableHeader('unit_number', 'Unit & Property', 'px-4 py-3.5')}
                  <th className="w-[140px] px-4 py-3.5">Sale Mode</th>
                  <th className="px-4 py-3.5">Client & Contact</th>
                  <th className="px-4 py-3.5">Advisor</th>
                  {renderSortableHeader('deal_value', 'Deal Value', 'px-4 py-3.5')}
                  {renderSortableHeader('collection_pct', 'Received / %', 'px-4 py-3.5')}
                  {renderSortableHeader('balance_due', 'Balance Due', 'px-4 py-3.5')}
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
                    isSelected={selectedIds?.has(allotment.id)}
                    onToggleSelect={onToggleSelectRow}
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
              isSelected={selectedIds?.has(allotment.id)}
              onToggleSelect={onToggleSelectRow}
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
