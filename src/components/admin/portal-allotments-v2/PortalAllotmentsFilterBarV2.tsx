'use client';

import React from 'react';
import { Search, X, RotateCcw, LayoutList, LayoutGrid, Download, ChevronDown } from 'lucide-react';
import type { PaymentStatusFilter, SaleModeFilter } from '../portal-allotments/types';

export interface PortalAllotmentsFilterBarV2Props {
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
  selectedCount?: number;
  onExportSelected?: () => void;
}

export function PortalAllotmentsFilterBarV2({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Filter plots by client, unit, ticket...',
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
  selectedCount = 0,
  onExportSelected,
}: PortalAllotmentsFilterBarV2Props): React.JSX.Element {
  const handlePropertyChange = onPropertyChange || (() => {});
  const handlePaymentStatusChange = onPaymentStatusChange || (() => {});
  const handleSaleModeChange = onSaleModeChange || (() => {});
  const handleAdvisorChange = onAdvisorChange || (() => {});
  const handleResetFilters = onResetFilters || (() => {});

  return (
    <div className="flex flex-col gap-2.5">
      {/* Precision Single-Row Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-3.5 py-2.5 dark:border-white/[0.08] dark:bg-[#0D1117]">
        {/* Left: Minimal Search Input with Monospace Shortcut */}
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            aria-label="Filter allotments"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-0 bg-transparent py-1.5 pr-8 pl-8 text-xs text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear filter"
              className="absolute top-1/2 right-2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <span className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 font-mono text-[10px] text-slate-400 sm:inline-block">
              /
            </span>
          )}
        </div>

        {/* Center: Clean Segmented Dropdowns (Zero Cartoon Badges) */}
        <div className="flex flex-wrap items-center gap-1.5 border-l border-slate-200 pl-3 dark:border-white/[0.08]">
          {/* Property Dropdown */}
          <div className="relative">
            <select
              aria-label="Property"
              value={selectedProperty}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="appearance-none border border-slate-200 bg-transparent py-1.5 pr-6 pl-2.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-slate-400 dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Payment Status Dropdown */}
          <div className="relative">
            <select
              aria-label="Payment Status"
              value={selectedPaymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatusFilter)}
              className="appearance-none border border-slate-200 bg-transparent py-1.5 pr-6 pl-2.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-slate-400 dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              <option value="all">All Statuses</option>
              <option value="fully_paid">Fully Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="unpaid">Unpaid (0%)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Sale Mode Dropdown */}
          <div className="relative">
            <select
              aria-label="Sale Mode"
              value={selectedSaleMode}
              onChange={(e) => handleSaleModeChange(e.target.value as SaleModeFilter)}
              className="appearance-none border border-slate-200 bg-transparent py-1.5 pr-6 pl-2.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-slate-400 dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              <option value="all">All Modes</option>
              <option value="Direct Sell">Direct Sell</option>
              <option value="Draw">Draw Allotment</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Advisor Dropdown */}
          <div className="relative">
            <select
              aria-label="Advisor"
              value={selectedAdvisor}
              onChange={(e) => handleAdvisorChange(e.target.value)}
              className="appearance-none border border-slate-200 bg-transparent py-1.5 pr-6 pl-2.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-slate-400 dark:border-white/[0.1] dark:text-slate-300 dark:hover:bg-white/[0.04]"
            >
              <option value="all">All Advisors</option>
              {advisors.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Clear active filters"
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Right: Actions & View Switcher */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 && onExportSelected && (
            <button
              type="button"
              onClick={onExportSelected}
              className="dark:border-brand-gold dark:bg-brand-gold dark:hover:bg-brand-gold/90 inline-flex items-center gap-1.5 border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:text-black"
            >
              <Download className="h-3 w-3" />
              <span>Export ({selectedCount})</span>
            </button>
          )}

          {onViewModeChange && (
            <div className="inline-flex border border-slate-200 dark:border-white/[0.1]">
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                aria-label="Table View"
                className={`p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.1] dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('cards')}
                aria-label="Cards View"
                className={`p-1.5 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.1] dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
