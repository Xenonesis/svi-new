'use client';

import { Search, X, ArrowUp, ArrowDown, Filter, Download, RefreshCw, Users } from 'lucide-react';
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
  onRefresh,
  onManageAdvisors,
}: RegistrationsToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      {/* Search */}
      <form onSubmit={onSearchSubmit} className="relative flex-1">
        <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by submission ID, name, email, phone, aadhar, advisor or project..."
          className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder-gray-600"
        />
        {search && (
          <button
            type="button"
            onClick={onSearchClear}
            className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="focus:border-brand-gold dark:bg-brand-dark-surface/85 appearance-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-xs text-gray-700 outline-none dark:border-white/10 dark:text-gray-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={onSortOrderToggle}
          className="hover:border-brand-gold hover:text-brand-gold dark:bg-brand-dark-surface/85 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors dark:border-white/10"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Filter toggle */}
      <button
        onClick={onFilterToggle}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-3 text-xs font-bold tracking-widest uppercase transition-all ${
          showFilters || activeFilterCount > 0
            ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
            : 'dark:bg-brand-dark-surface/85 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'
        }`}
      >
        <Filter className="h-3.5 w-3.5" /> Filters
        {activeFilterCount > 0 && (
          <span className="bg-brand-gold text-brand-navy flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      <button
        onClick={onExport}
        className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <Download className="h-3.5 w-3.5" /> Export
      </button>

      <button
        onClick={onRefresh}
        className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Refresh
      </button>

      <button
        onClick={onManageAdvisors}
        className="dark:bg-brand-dark-surface/85 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <Users className="h-3.5 w-3.5" /> Manage Advisors
      </button>
    </div>
  );
}
