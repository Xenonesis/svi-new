'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpDown,
  Filter,
  RefreshCw,
  Search,
  Star,
  User,
  X,
  Calendar,
  Mail,
  Send,
  BarChart3,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
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
  // ─── Multi-select & Delete ───
  selectedCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  deleting: boolean;
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
  selectedCount,
  onSelectAll,
  onDeleteSelected,
  deleting,
}: EmailToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
      {/* Selection mode bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between rounded-lg bg-red-50/80 px-3 py-2 dark:bg-red-500/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  {selectedCount} selected
                </span>
                <button
                  onClick={onSelectAll}
                  className="text-[11px] font-medium text-gray-500 underline transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Select all
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDeleteSelected}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row: Search + Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Select all checkbox + Search */}
        <div className="flex flex-1 items-center gap-2">
          {/* Select all toggle */}
          <button
            onClick={onSelectAll}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            title="Toggle select all"
          >
            {selectedCount > 0 ? (
              <CheckSquare className="text-brand-gold h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2 pr-8 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
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
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <button
              onClick={onFilterToggle}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
          </div>

          {/* Sort button */}
          <div ref={sortRef} className="relative">
            <button
              onClick={onSortToggle}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                hasSortChanged
                  ? 'text-brand-gold bg-brand-gold/5'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-white/5'
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{sortLabel}</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 z-50 mt-1.5 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-1.5">
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = sortField === opt.field;
                    const isAsc = isActive && sortDir === 'asc';
                    return (
                      <button
                        key={opt.field}
                        onClick={() => onSort(opt.field)}
                        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-brand-gold/10 text-brand-gold'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
                        }`}
                      >
                        <opt.icon className="h-4 w-4" />
                        <span className="flex-1">{opt.label}</span>
                        {isActive && (
                          <span className="text-brand-gold text-xs font-bold">
                            {isAsc ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Star toggle */}
          <button
            onClick={onStarToggle}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
            disabled={!!loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filterOpen && (
          <FilterPanel
            statusFilter={statusFilter}
            datePreset={datePreset}
            fromFilter={fromFilter}
            showStarredOnly={showStarredOnly}
            onStatusToggle={onStatusToggle}
            onDatePresetChange={onDatePresetChange}
            onFromFilterChange={onFromFilterChange}
            onStarToggle={onStarToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Filter Panel ─── */
interface FilterPanelProps {
  statusFilter: Set<string>;
  datePreset: DatePreset;
  fromFilter: string;
  showStarredOnly: boolean;
  onStatusToggle: (s: string) => void;
  onDatePresetChange: (v: DatePreset) => void;
  onFromFilterChange: (v: string) => void;
  onStarToggle: () => void;
}

function FilterPanel({
  statusFilter,
  datePreset,
  fromFilter,
  showStarredOnly,
  onStatusToggle,
  onDatePresetChange,
  onFromFilterChange,
  onStarToggle,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="space-y-4 px-4 py-3">
        {/* Status filter */}
        <div>
          <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTER_OPTIONS.map((opt) => {
              const active = statusFilter.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => onStatusToggle(opt.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    active
                      ? `${opt.color.replace('bg-', 'bg-')} text-white dark:text-white`
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                  {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date filter */}
        <div>
          <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Date range
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => onDatePresetChange(preset.key)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                  datePreset === preset.key
                    ? 'bg-brand-gold text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* From filter */}
        <div>
          <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            From
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by sender..."
              value={fromFilter}
              onChange={(e) => onFromFilterChange(e.target.value)}
              className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-1.5 pr-3 pl-9 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            />
          </div>
        </div>

        {/* Starred only */}
        <div>
          <button
            onClick={onStarToggle}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              showStarredOnly
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${showStarredOnly ? 'fill-amber-400' : ''}`} />
            Show starred only
          </button>
        </div>
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-2 dark:border-gray-800"
    >
      <span className="mr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Active:
      </span>

      {search.trim() && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <Calendar className="h-2.5 w-2.5" />
          {DATE_PRESETS.find((p) => p.key === datePreset)?.label}
          <button onClick={onDatePresetReset} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {fromFilter.trim() && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          <User className="h-2.5 w-2.5" />
          {fromFilter.trim()}
          <button onClick={onFromFilterClear} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {showStarredOnly && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Star className="h-2.5 w-2.5 fill-amber-400" />
          Starred
          <button onClick={onStarFilterClear} className="ml-0.5 hover:text-red-500">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      )}

      {hasSortChanged && (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
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
    </motion.div>
  );
}
