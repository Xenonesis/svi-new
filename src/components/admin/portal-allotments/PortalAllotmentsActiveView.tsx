'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  TableProperties,
  LayoutGrid,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
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

type StatusFilter = 'all' | 'pending' | 'paid' | 'refunded';
type SortOption =
  'default' | 'balance_desc' | 'deal_desc' | 'percent_asc' | 'percent_desc' | 'unit_asc';
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
}: PortalAllotmentsActiveViewProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Distinct property options extracted from the allotments
  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    filteredAllotments.forEach((a) => {
      const name = a.properties?.name?.trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [filteredAllotments]);

  // Financial details & status classifications map
  const financialsMap = useMemo(() => {
    const map = new Map<
      string,
      AllotmentFinancials & {
        isRefundDone: boolean;
        isFullyPaid: boolean;
        hasPendingBalance: boolean;
      }
    >();

    filteredAllotments.forEach((a) => {
      const fin = getAllotmentFinancials(a);
      const isRefundDone = Boolean(
        a.notes?.toLowerCase().includes('refund') ||
        (a.metadata?.status as string)?.toLowerCase().includes('refund') ||
        (a.metadata?.refund_status as string)?.toLowerCase().includes('refund') ||
        (a.metadata?.notes as string)?.toLowerCase().includes('refund') ||
        (a.metadata?.remarks as string)?.toLowerCase().includes('refund')
      );
      const isFullyPaid = !isRefundDone && fin.dealValue > 0 && fin.percentCompleted >= 100;
      const hasPendingBalance = !isRefundDone && fin.balanceDue > 0;

      map.set(a.id, {
        ...fin,
        isRefundDone,
        isFullyPaid,
        hasPendingBalance,
      });
    });

    return map;
  }, [filteredAllotments, getAllotmentFinancials]);

  // Live filter counts
  const counts = useMemo(() => {
    let pending = 0;
    let paid = 0;
    let refunded = 0;

    filteredAllotments.forEach((a) => {
      const info = financialsMap.get(a.id);
      if (info?.isRefundDone) refunded++;
      else if (info?.isFullyPaid) paid++;
      else if (info?.hasPendingBalance) pending++;
    });

    return {
      all: filteredAllotments.length,
      pending,
      paid,
      refunded,
    };
  }, [filteredAllotments, financialsMap]);

  // Filtered and Sorted Allotments
  const displayedAllotments = useMemo(() => {
    let list = filteredAllotments.filter((a) => {
      // 1. Property filter
      if (selectedProperty !== 'all') {
        const propName = a.properties?.name?.trim() || '';
        if (propName !== selectedProperty) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        const info = financialsMap.get(a.id);
        if (statusFilter === 'pending' && !info?.hasPendingBalance) return false;
        if (statusFilter === 'paid' && !info?.isFullyPaid) return false;
        if (statusFilter === 'refunded' && !info?.isRefundDone) return false;
      }

      return true;
    });

    // 3. Sorting
    if (sortBy !== 'default') {
      list = [...list].sort((a, b) => {
        const finA = financialsMap.get(a.id);
        const finB = financialsMap.get(b.id);
        const balA = finA?.balanceDue ?? 0;
        const balB = finB?.balanceDue ?? 0;
        const dealA = finA?.dealValue ?? 0;
        const dealB = finB?.dealValue ?? 0;
        const pctA = finA?.percentCompleted ?? 0;
        const pctB = finB?.percentCompleted ?? 0;
        const unitA = (
          a.unit_no ||
          a.unit_number ||
          (a.metadata?.unit_no as string) ||
          ''
        ).toLowerCase();
        const unitB = (
          b.unit_no ||
          b.unit_number ||
          (b.metadata?.unit_no as string) ||
          ''
        ).toLowerCase();

        switch (sortBy) {
          case 'balance_desc':
            return balB - balA;
          case 'deal_desc':
            return dealB - dealA;
          case 'percent_asc':
            return pctA - pctB;
          case 'percent_desc':
            return pctB - pctA;
          case 'unit_asc':
            return unitA.localeCompare(unitB, undefined, { numeric: true });
          default:
            return 0;
        }
      });
    }

    return list;
  }, [filteredAllotments, selectedProperty, statusFilter, sortBy, financialsMap]);

  const resetLocalFilters = () => {
    setSelectedProperty('all');
    setStatusFilter('all');
    setSortBy('default');
    onSearchChange('');
  };

  const isAnyFilterActive =
    Boolean(searchTerm) ||
    selectedProperty !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'default';

  return (
    <div className="space-y-4">
      {/* 1. Top Action & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs sm:p-4 dark:border-white/10 dark:bg-gray-800">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Bar with clear button */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-slate-50/70 py-2.5 pr-9 pl-9 text-xs text-gray-900 transition-all outline-none focus:bg-white focus:ring-2 sm:text-sm dark:border-gray-700 dark:bg-gray-900/60 dark:text-white dark:focus:bg-gray-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Property Select, Sort Dropdown & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Property Filter Dropdown */}
            {propertyOptions.length > 0 && (
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="all">All Projects ({filteredAllotments.length})</option>
                  {propertyOptions.map((prop) => (
                    <option key={prop} value={prop}>
                      {prop}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort allotments"
                className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="default">Default Sort</option>
                <option value="balance_desc">Highest Balance Due</option>
                <option value="deal_desc">Highest Deal Value</option>
                <option value="percent_asc">Realization (Lowest First)</option>
                <option value="percent_desc">Realization (Highest First)</option>
                <option value="unit_asc">Unit Number (A-Z)</option>
              </select>
            </div>

            {/* Table / Card View Toggle */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-slate-100 p-0.5 dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table View"
                title="Table View (ERP Style)"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <TableProperties className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                aria-label="Card View"
                title="Card View (Compact Grid)"
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Status Filter Tabs / Chips */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2.5 sm:gap-2 dark:border-white/5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'border-brand-gold/40 bg-brand-gold/15 text-brand-navy dark:text-brand-gold border'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <span>All Allotments</span>
            <span className="py-0.2 rounded-md bg-white/70 px-1.5 font-mono text-[10px] dark:bg-black/40">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Pending Balance</span>
            <span className="py-0.2 rounded-md bg-white/70 px-1.5 font-mono text-[10px] dark:bg-black/40">
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === 'paid'
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>Fully Paid</span>
            <span className="py-0.2 rounded-md bg-white/70 px-1.5 font-mono text-[10px] dark:bg-black/40">
              {counts.paid}
            </span>
          </button>

          {counts.refunded > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('refunded')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'refunded'
                  ? 'border border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
              }`}
            >
              <AlertCircle className="h-3 w-3 text-rose-500" />
              <span>Refunded</span>
              <span className="py-0.2 rounded-md bg-white/70 px-1.5 font-mono text-[10px] dark:bg-black/40">
                {counts.refunded}
              </span>
            </button>
          )}

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={resetLocalFilters}
              title="Reset all active filters"
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Data Presentation (Table or Cards) */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          {loadingText}
        </div>
      ) : displayedAllotments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium">{noAllotmentsFoundText}</p>
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={resetLocalFilters}
              className="border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition"
            >
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
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-gray-200 bg-slate-50/90 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                <tr>
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
                {displayedAllotments.map((allotment) => (
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
          {displayedAllotments.map((allotment) => (
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
