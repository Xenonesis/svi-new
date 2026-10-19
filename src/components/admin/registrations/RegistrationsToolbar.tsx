'use client';

import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  SortDesc,
  FileSpreadsheet,
  FileText,
  CheckSquare,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SORT_OPTIONS } from './types';

interface RegistrationsToolbarProps {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showFilters: boolean;
  activeFilterCount: number;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchClear: () => void;
  onSortByChange: (v: string) => void;
  onSortOrderToggle: () => void;
  onFilterToggle: () => void;
  onExport: () => void;
  onExportExcel?: () => void;
  onExportSelectedCsv?: () => void;
  onExportSelectedExcel?: () => void;
  onBulkReassign?: () => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onRefresh: () => void;
  onManageAdvisors: () => void;
}

export function RegistrationsToolbar({
  search,
  sortBy,
  sortOrder,
  showFilters,
  activeFilterCount,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSortByChange,
  onSortOrderToggle,
  onFilterToggle,
  onExport,
  onExportExcel,
  onExportSelectedCsv,
  onExportSelectedExcel,
  onBulkReassign,
  selectedCount = 0,
  onClearSelection,
  onRefresh,
  onManageAdvisors,
}: RegistrationsToolbarProps) {
  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Sort';

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search Bar */}
      <form onSubmit={onSearchSubmit} className="relative max-w-xl flex-1">
        <div className="group focus-within:ring-brand-gold/50 dark:focus-within:ring-brand-gold/50 relative flex items-center rounded-xl bg-white/80 shadow-sm backdrop-blur-xl transition-all focus-within:ring-2 hover:shadow-md dark:bg-[#111118]/80 dark:shadow-none dark:ring-1 dark:ring-white/10">
          <Search className="group-focus-within:text-brand-gold absolute left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, name, email, phone, aadhar, advisor..."
            className="w-full bg-transparent py-3.5 pr-12 pl-12 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
          />
          {search && (
            <button
              type="button"
              onClick={onSearchClear}
              className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 rounded-xl bg-white/80 p-1 shadow-sm backdrop-blur-xl dark:bg-[#111118]/80 dark:ring-1 dark:ring-white/10">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
                <SortDesc className="h-4 w-4" />
                <span className="hidden sm:inline">{currentSortLabel}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="animate-in fade-in zoom-in-95 z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a1a24]/95"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Sort By
                </DropdownMenu.Label>
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenu.Item
                    key={opt.value}
                    onClick={() => onSortByChange(opt.value)}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
                  >
                    <div
                      className={`mr-2 h-1.5 w-1.5 rounded-full ${sortBy === opt.value ? 'bg-brand-gold' : 'bg-transparent'}`}
                    />
                    {opt.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />

          <button
            onClick={onSortOrderToggle}
            className="hover:text-brand-gold dark:hover:text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Filter Button */}
        <button
          onClick={onFilterToggle}
          className={`relative flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-widest uppercase shadow-sm backdrop-blur-xl transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-brand-gold/10 text-brand-gold ring-brand-gold/50 ring-1'
              : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-[#111118]/80 dark:text-gray-300 dark:ring-1 dark:ring-white/10 dark:hover:bg-white/5'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand-gold absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Selected Export Button (when records are selected) */}
        {selectedCount > 0 && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="animate-in fade-in flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:brightness-110 focus:outline-none">
                <CheckSquare className="h-4 w-4" />
                <span>Export Selected ({selectedCount})</span>
                <ArrowDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="animate-in fade-in zoom-in-95 z-50 min-w-[220px] rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a1a24]/95"
              >
                <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                  Actions ({selectedCount} Selected)
                </DropdownMenu.Label>
                {onBulkReassign && (
                  <DropdownMenu.Item
                    onClick={onBulkReassign}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-amber-700 outline-none select-none data-[highlighted]:bg-amber-50 dark:text-amber-400 dark:data-[highlighted]:bg-amber-500/10"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-amber-500" />
                    Reassign Advisor ({selectedCount})
                  </DropdownMenu.Item>
                )}
                {onExportSelectedExcel && (
                  <DropdownMenu.Item
                    onClick={onExportSelectedExcel}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                    Export to Excel (.xlsx)
                  </DropdownMenu.Item>
                )}
                {onExportSelectedCsv && (
                  <DropdownMenu.Item
                    onClick={onExportSelectedCsv}
                    className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
                  >
                    <Download className="text-brand-gold mr-2 h-4 w-4" />
                    Export to CSV (.csv)
                  </DropdownMenu.Item>
                )}
                {onClearSelection && (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/10" />
                    <DropdownMenu.Item
                      onClick={onClearSelection}
                      className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-rose-600 outline-none select-none data-[highlighted]:bg-rose-50 dark:text-rose-400 dark:data-[highlighted]:bg-rose-500/10"
                    >
                      <X className="mr-2 h-4 w-4 text-rose-500" />
                      Deselect All ({selectedCount})
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}

        {/* Other Actions Dropdown (Export, Refresh, Manage) */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="hover:text-brand-gold dark:hover:text-brand-gold flex cursor-pointer items-center justify-center rounded-xl bg-white/80 p-3 text-gray-700 shadow-sm backdrop-blur-xl transition-colors hover:bg-white focus:outline-none dark:bg-[#111118]/80 dark:text-gray-300 dark:ring-1 dark:ring-white/10 dark:hover:bg-white/5">
              <span className="hidden pr-2 text-xs font-bold tracking-widest uppercase sm:inline">
                Actions
              </span>
              <ArrowDown className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="animate-in fade-in zoom-in-95 z-50 min-w-[200px] rounded-xl border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a1a24]/95"
            >
              <DropdownMenu.Item
                onClick={onRefresh}
                className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
              >
                <RefreshCw className="group-data-[highlighted]:text-brand-gold mr-2 h-4 w-4 text-gray-400" />
                Refresh Data
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={onExport}
                className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
              >
                <Download className="group-data-[highlighted]:text-brand-gold mr-2 h-4 w-4 text-gray-400" />
                Export All CSV
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-white/10" />
              <DropdownMenu.Item
                onClick={onManageAdvisors}
                className="group flex cursor-pointer items-center rounded-md px-2 py-2 text-xs font-medium text-gray-700 outline-none select-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-white/10 dark:data-[highlighted]:text-white"
              >
                <Users className="group-data-[highlighted]:text-brand-gold mr-2 h-4 w-4 text-gray-400" />
                Manage Advisors
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
