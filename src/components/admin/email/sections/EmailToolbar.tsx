'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpDown, Clock, Filter, RefreshCw, Search, Star, User, X } from 'lucide-react';
import {
  SORT_OPTIONS,
  DATE_PRESETS,
  STATUS_FILTER_OPTIONS,
  getStatusLabel,
  type SortField,
  type DatePreset,
  type SortDir,
} from './constants';

interface EmailToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortField: SortField;
  sortDir: SortDir;
  sortLabel: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSort: (field: SortField) => void;
  sortRef: React.RefObject<HTMLDivElement | null>;
  filterOpen: boolean;
  onFilterToggle: () => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  statusFilter: Set<string>;
  datePreset: DatePreset;
  fromFilter: string;
  showStarredOnly: boolean;
  hasSortChanged: boolean;
  activeFilterCount: number;
  loading: boolean;
  onRefresh: () => void;
  onStatusToggle: (s: string) => void;
  onDatePresetChange: (v: DatePreset) => void;
  onFromFilterChange: (v: string) => void;
  onStarToggle: () => void;
  onSearchClear: () => void;
}

export function EmailToolbar({
  search,
  onSearchChange,
  sortField,
  sortDir,
  sortLabel,
  sortOpen,
  onSortToggle,
  onSort,
  sortRef,
  filterOpen,
  onFilterToggle,
  filterRef,
  statusFilter,
  datePreset,
  fromFilter,
  showStarredOnly,
  hasSortChanged,
  activeFilterCount,
  loading,
  onRefresh,
  onStatusToggle,
  onDatePresetChange,
  onFromFilterChange,
  onStarToggle,
  onSearchClear,
}: EmailToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
      {/* Search */}
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2 pr-8 pl-9 text-xs text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
        />
        {search && (
          <button
            onClick={onSearchClear}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Filter button */}
        <div ref={filterRef} className="relative">
          <button
            onClick={onFilterToggle}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeFilterCount > 0
                ? 'text-brand-gold bg-brand-gold/5'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-brand-gold flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                className="absolute top-full right-0 z-50 mt-1.5 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
              >
                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onStatusToggle(opt.value)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                          statusFilter.has(opt.value)
                            ? 'bg-brand-gold/10 text-brand-gold ring-brand-gold/30 ring-1'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                        {getStatusLabel(opt.value)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    Date Range
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => onDatePresetChange(p.key)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                          datePreset === p.key
                            ? 'bg-brand-gold/10 text-brand-gold ring-brand-gold/30 ring-1'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                    From
                  </p>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="sender@example.com"
                      value={fromFilter}
                      onChange={(e) => onFromFilterChange(e.target.value)}
                      className="focus:border-brand-gold/40 w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-[11px] text-gray-700 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort button */}
        <div ref={sortRef} className="relative">
          <button
            onClick={onSortToggle}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              hasSortChanged
                ? 'text-brand-gold bg-brand-gold/5'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortLabel}</span>
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                className="absolute top-full right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-[#0e0e14]"
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = sortField === opt.field;
                  return (
                    <button
                      key={opt.field}
                      onClick={() => onSort(opt.field)}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors ${
                        active
                          ? 'bg-brand-gold/5 text-brand-gold'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <opt.icon className="h-3.5 w-3.5 shrink-0" />
                      {opt.label}
                      {active && (
                        <span className="ml-auto text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Star toggle */}
        <button
          onClick={onStarToggle}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            showStarredOnly
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${showStarredOnly ? 'fill-amber-400' : ''}`} />
          <span className="hidden sm:inline">{showStarredOnly ? 'Starred' : 'Star'}</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Active Filter Chips ─── */
interface ActiveFilterChipsProps {
  search: string;
  statusFilter: Set<string>;
  datePreset: DatePreset;
  fromFilter: string;
  showStarredOnly: boolean;
  hasSortChanged: boolean;
  sortLabel: string;
  onSearchClear: () => void;
  onStatusFilterRemove: (s: string) => void;
  onDatePresetReset: () => void;
  onFromFilterClear: () => void;
  onStarFilterClear: () => void;
  onSortReset: () => void;
  onClearAllFilters: () => void;
}

export function ActiveFilterChips({
  search,
  statusFilter,
  datePreset,
  fromFilter,
  showStarredOnly,
  hasSortChanged,
  sortLabel,
  onSearchClear,
  onStatusFilterRemove,
  onDatePresetReset,
  onFromFilterClear,
  onStarFilterClear,
  onSortReset,
  onClearAllFilters,
}: ActiveFilterChipsProps) {
  const hasAny =
    search.trim() ||
    statusFilter.size > 0 ||
    datePreset !== 'all' ||
    fromFilter.trim() ||
    showStarredOnly ||
    hasSortChanged;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2">
      <span className="mr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Active:
      </span>

      {search.trim() && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <Search className="h-2.5 w-2.5" />
          &quot;{search.trim()}&quot;
          <button onClick={onSearchClear} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {Array.from(statusFilter).map((s) => (
        <span
          key={s}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${STATUS_FILTER_OPTIONS.find((o) => o.value === s)?.color || 'bg-gray-400'}`}
          />
          {getStatusLabel(s)}
          <button onClick={() => onStatusFilterRemove(s)} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}

      {datePreset !== 'all' && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <Clock className="h-2.5 w-2.5" />
          {DATE_PRESETS.find((p) => p.key === datePreset)?.label}
          <button onClick={onDatePresetReset} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {fromFilter.trim() && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <User className="h-2.5 w-2.5" />
          {fromFilter.trim()}
          <button onClick={onFromFilterClear} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {showStarredOnly && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Star className="h-2.5 w-2.5 fill-amber-400" />
          Starred
          <button onClick={onStarFilterClear} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {hasSortChanged && (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ArrowUpDown className="h-2.5 w-2.5" />
          {sortLabel}
          <button onClick={onSortReset} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      <button
        onClick={onClearAllFilters}
        className="ml-1 text-[10px] font-semibold text-red-500 transition-colors hover:text-red-600"
      >
        Clear all
      </button>
    </div>
  );
}
