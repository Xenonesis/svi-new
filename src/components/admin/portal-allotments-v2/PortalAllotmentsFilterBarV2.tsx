'use client';

import React from 'react';
import {
  Search,
  X,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
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
  onExportSelected?: (format: 'csv' | 'excel' | 'pdf') => void | Promise<void>;
  isExporting?: boolean;
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
  isExporting = false,
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
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  disabled={isExporting}
                  className="dark:border-brand-gold dark:bg-brand-gold dark:hover:bg-brand-gold/90 inline-flex cursor-pointer items-center gap-1.5 border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:text-black"
                >
                  {isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span>Export ({selectedCount})</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="animate-in fade-in zoom-in-95 z-50 min-w-[240px] rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1626]/95"
                >
                  <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Export Format ({selectedCount} Selected)
                  </DropdownMenu.Label>
                  <DropdownMenu.Item
                    onClick={() => onExportSelected('excel')}
                    className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="mt-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Official Excel (.xlsx)
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        SVI logo, formulas & payment ledgers
                      </span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => onExportSelected('pdf')}
                    className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="mt-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Official PDF Dossier
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Printable statement with corporate logo
                      </span>
                    </div>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => onExportSelected('csv')}
                    className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs outline-none select-none hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="mt-0.5 rounded-md border border-blue-500/30 bg-blue-500/10 p-1 text-blue-600 dark:text-blue-400">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Data CSV (.csv)
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Raw table data for spreadsheets
                      </span>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
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
