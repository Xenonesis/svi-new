'use client';

import React from 'react';
import {
  Search,
  X,
  Building2,
  CreditCard,
  Target,
  Users,
  RotateCcw,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import type { PaymentStatusFilter, SaleModeFilter } from './types';

export interface PortalAllotmentsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selectedProperty?: string;
  onPropertyChange?: (propertyId: string) => void;
  properties?: Array<{ id: string; name: string }>;
  selectedPaymentStatus?: PaymentStatusFilter;
  onPaymentStatusChange?: (status: PaymentStatusFilter) => void;
  selectedSaleMode?: SaleModeFilter;
  onSaleModeChange?: (mode: SaleModeFilter) => void;
  selectedAdvisor?: string;
  onAdvisorChange?: (advisor: string) => void;
  advisors?: string[];
  activeFilterCount?: number;
  onResetFilters?: () => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export function PortalAllotmentsFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search by client, property, unit, ticket...',
  selectedProperty = 'all',
  onPropertyChange,
  properties = [],
  selectedPaymentStatus = 'all',
  onPaymentStatusChange,
  selectedSaleMode = 'all',
  onSaleModeChange,
  selectedAdvisor = 'all',
  onAdvisorChange,
  advisors = [],
  activeFilterCount = 0,
  onResetFilters,
  viewMode = 'table',
  onViewModeChange,
}: PortalAllotmentsFilterBarProps): React.JSX.Element {
  const handlePropertyChange = onPropertyChange || (() => {});
  const handlePaymentStatusChange = onPaymentStatusChange || (() => {});
  const handleSaleModeChange = onSaleModeChange || (() => {});
  const handleAdvisorChange = onAdvisorChange || (() => {});
  const handleResetFilters = onResetFilters || (() => {});

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-gray-800">
      {/* Row 1: Search input and view mode toggle buttons */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            aria-label="Search allotments"
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

        {onViewModeChange && (
          <div className="inline-flex self-start rounded-xl border border-gray-200 bg-slate-100 p-0.5 sm:self-auto dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-label="Table View"
              title="Table View (ERP Style)"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
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
        )}
      </div>

      {/* Row 2: Multi-Dimension Filters & Reset */}
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
        {/* Property Filter */}
        <div className="relative min-w-[140px] flex-1 sm:flex-initial">
          <Building2 className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            id="property-filter"
            aria-label="Property"
            value={selectedProperty}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2 pr-7 pl-8 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Properties</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="relative min-w-[150px] flex-1 sm:flex-initial">
          <CreditCard className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            id="payment-status-filter"
            aria-label="Payment Status"
            value={selectedPaymentStatus}
            onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatusFilter)}
            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2 pr-7 pl-8 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Payment Statuses</option>
            <option value="fully_paid">100% Fully Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue Milestones</option>
            <option value="unpaid">Unpaid (0%)</option>
          </select>
        </div>

        {/* Sale Mode Filter */}
        <div className="relative min-w-[130px] flex-1 sm:flex-initial">
          <Target className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            id="sale-mode-filter"
            aria-label="Sale Mode"
            value={selectedSaleMode}
            onChange={(e) => handleSaleModeChange(e.target.value as SaleModeFilter)}
            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2 pr-7 pl-8 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Sale Modes</option>
            <option value="Direct Sell">Direct Sell</option>
            <option value="Draw">Draw Allotment</option>
          </select>
        </div>

        {/* Advisor Filter */}
        <div className="relative min-w-[130px] flex-1 sm:flex-initial">
          <Users className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <select
            id="advisor-filter"
            aria-label="Advisor"
            value={selectedAdvisor}
            onChange={(e) => handleAdvisorChange(e.target.value)}
            className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-white py-2 pr-7 pl-8 text-xs font-medium text-gray-700 shadow-2xs transition-colors focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="all">All Advisors</option>
            {advisors.map((adv) => (
              <option key={adv} value={adv}>
                {adv}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={handleResetFilters}
          aria-label="Reset filters"
          title="Reset filters"
          className={`ml-auto inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
            activeFilterCount > 0
              ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:text-brand-gold'
              : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand-gold flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
