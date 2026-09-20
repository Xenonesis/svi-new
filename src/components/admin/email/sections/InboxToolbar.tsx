'use client';

import React from 'react';
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
  Trash2,
  CheckCheck,
  Tag,
  Mail,
  MailOpen,
  Archive,
  Inbox,
  MinusSquare,
  Square,
  CheckSquare,
} from 'lucide-react';
import type { DatePreset, SortDir } from './constants';
import { DATE_PRESETS } from './constants';
import { COMMON_TAGS } from '../constants';
import type { InboxViewFilter, InboxSortField } from '../hooks/useInboxFilters';
import { INBOX_SORT_OPTIONS } from '../hooks/useInboxFilters';

interface InboxToolbarProps {
  // Search
  search: string;
  onSearchChange: (v: string) => void;
  onSearchClear: () => void;

  // Sort
  sortField: InboxSortField;
  sortDir: SortDir;
  sortLabel: string;
  sortOpen: boolean;
  onSortToggle: () => void;
  onSort: (field: InboxSortField) => void;
  sortRef: React.RefObject<HTMLDivElement | null>;
  hasSortChanged: boolean;

  // Filter
  filterOpen: boolean;
  onFilterToggle: () => void;
  filterRef: React.RefObject<HTMLDivElement | null>;
  activeFilterCount: number;
  hasActiveFilters: boolean;

  // Filter states
  viewFilter: InboxViewFilter;
  onViewFilterChange: (v: InboxViewFilter) => void;
  datePreset: DatePreset;
  onDatePresetChange: (v: DatePreset) => void;
  senderFilter: string;
  onSenderFilterChange: (v: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  allUsedTags: string[];

  // Star & Refresh
  showStarredOnly: boolean;
  onStarToggle: () => void;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;

  // Unread & Mark all
  unreadCount: number;
  onMarkAllAsRead?: () => void;

  // Selection & Bulk
  selectedCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMarkRead: (read: boolean) => void;
  onBulkArchive: (archive: boolean) => void;
  onBulkDelete: () => void;
  onBulkApplyTag: (tag: string) => void;
  bulkCustomTag: string;
  setBulkCustomTag: (v: string) => void;
  bulkTagMenuOpen: boolean;
  setBulkTagMenuOpen: (v: boolean) => void;
  bulkTagRef: React.RefObject<HTMLDivElement | null>;

  // Chip Resets
  onDatePresetReset: () => void;
  onSenderClear: () => void;
  onTagClear: () => void;
  onStarFilterClear: () => void;
  onSortReset: () => void;
  onClearAllFilters: () => void;

  // Counts
  totalCount: number;
  processedCount: number;
}

const VIEW_OPTIONS: {
  id: InboxViewFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'unread', label: 'Unread', icon: Mail },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'all', label: 'All', icon: MailOpen },
];

export function InboxToolbar({
  search,
  onSearchChange,
  onSearchClear,
  sortField,
  sortDir,
  sortLabel,
  sortOpen,
  onSortToggle,
  onSort,
  sortRef,
  hasSortChanged,
  filterOpen,
  onFilterToggle,
  filterRef,
  activeFilterCount,
  hasActiveFilters,
  viewFilter,
  onViewFilterChange,
  datePreset,
  onDatePresetChange,
  senderFilter,
  onSenderFilterChange,
  selectedTag,
  onTagChange,
  allUsedTags,
  showStarredOnly,
  onStarToggle,
  loading,
  refreshing,
  onRefresh,
  unreadCount,
  onMarkAllAsRead,
  selectedCount,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onClearSelection,
  onBulkMarkRead,
  onBulkArchive,
  onBulkDelete,
  onBulkApplyTag,
  bulkCustomTag,
  setBulkCustomTag,
  bulkTagMenuOpen,
  setBulkTagMenuOpen,
  bulkTagRef,
  onDatePresetReset,
  onSenderClear,
  onTagClear,
  onStarFilterClear,
  onSortReset,
  onClearAllFilters,
  totalCount,
  processedCount,
}: InboxToolbarProps) {
  return (
    <div className="flex flex-col border-b border-gray-100 dark:border-gray-800">
      {/* ─── Bulk Action Bar (When items selected) ─── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-gray-100 bg-amber-50/80 px-4 py-2 dark:border-gray-800 dark:bg-amber-500/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {selectedCount} selected
                </span>
                <button
                  onClick={onClearSelection}
                  className="text-[11px] text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Mark as Read */}
                <button
                  onClick={() => onBulkMarkRead(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  title="Mark as Read"
                >
                  <MailOpen className="h-3.5 w-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Read</span>
                </button>

                {/* Mark as Unread */}
                <button
                  onClick={() => onBulkMarkRead(false)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  title="Mark as Unread"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Unread</span>
                </button>

                {/* Archive */}
                <button
                  onClick={() => onBulkArchive(viewFilter !== 'archived')}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  title={viewFilter === 'archived' ? 'Move to Inbox' : 'Archive'}
                >
                  <Archive className="h-3.5 w-3.5 text-amber-500" />
                  <span className="hidden sm:inline">
                    {viewFilter === 'archived' ? 'Unarchive' : 'Archive'}
                  </span>
                </button>

                {/* Apply Tag Popover */}
                <div ref={bulkTagRef} className="relative">
                  <button
                    onClick={() => setBulkTagMenuOpen(!bulkTagMenuOpen)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    title="Apply Tag"
                  >
                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">Tag</span>
                  </button>

                  <AnimatePresence>
                    {bulkTagMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        className="dark:bg-brand-dark-surface absolute top-full right-0 z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white p-2.5 shadow-xl dark:border-gray-700"
                      >
                        <p className="mb-2 text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                          Apply Tag to {selectedCount} emails
                        </p>
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          {COMMON_TAGS.map((t) => (
                            <button
                              key={t.name}
                              onClick={() => onBulkApplyTag(t.name)}
                              className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-all ${t.bg} ${t.color} ${t.border} hover:scale-105`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800">
                          <input
                            type="text"
                            placeholder="Custom tag..."
                            value={bulkCustomTag}
                            onChange={(e) => setBulkCustomTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && bulkCustomTag.trim()) {
                                e.preventDefault();
                                onBulkApplyTag(bulkCustomTag.trim());
                              }
                            }}
                            className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              if (bulkCustomTag.trim()) {
                                onBulkApplyTag(bulkCustomTag.trim());
                              }
                            }}
                            className="bg-brand-gold text-brand-navy rounded-md px-2.5 py-1 text-xs font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Delete button */}
                <button
                  onClick={onBulkDelete}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 shadow-2xs hover:bg-red-50 dark:border-red-500/20 dark:bg-gray-800 dark:text-red-400"
                  title="Move to Trash"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Toolbar Row ─── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Left: Select all + Search */}
        <div className="flex flex-1 items-center gap-2">
          {/* Select all checkbox */}
          <button
            onClick={onSelectAll}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            title={isAllSelected ? 'Deselect all' : 'Select all'}
          >
            {isAllSelected ? (
              <CheckSquare className="text-brand-gold h-4 w-4" />
            ) : isIndeterminate ? (
              <MinusSquare className="text-brand-gold h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          {/* Search Bar */}
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sender, subject, content..."
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

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mark all as read (if unread > 0) */}
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
              title="Mark all as read"
            >
              <CheckCheck className="text-brand-gold h-3.5 w-3.5" />
              <span className="hidden md:inline">Mark all read</span>
            </button>
          )}

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

          {/* Sort button & Dropdown (properly anchored) */}
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

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 z-50 mt-1.5 w-52 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-1.5">
                    {INBOX_SORT_OPTIONS.map((opt) => {
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
          </div>

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
            onClick={() => {
              if (!loading && !refreshing) onRefresh();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all dark:hover:bg-white/5 ${
              loading || refreshing
                ? 'cursor-not-allowed text-gray-300 opacity-50'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Syncing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ─── Expandable Filter Panel ─── */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-4 px-4 py-3">
              {/* View / Status Filter */}
              <div>
                <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  View
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {VIEW_OPTIONS.map((opt) => {
                    const active = viewFilter === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onViewFilterChange(opt.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                          active
                            ? 'bg-brand-navy dark:bg-brand-gold dark:text-brand-navy font-bold text-white shadow-xs'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {opt.label}
                        {opt.id === 'unread' && unreadCount > 0 && (
                          <span className="bg-brand-gold/20 text-brand-gold rounded-full px-1.5 text-[9px]">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Presets */}
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

              {/* Sender Filter */}
              <div>
                <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  From Sender
                </label>
                <div className="relative max-w-sm">
                  <User className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter by sender name or email..."
                    value={senderFilter}
                    onChange={(e) => onSenderFilterChange(e.target.value)}
                    className="focus-gold w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-9 text-sm text-gray-900 placeholder-gray-400 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onTagChange(null)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                      !selectedTag
                        ? 'bg-brand-gold text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    All Tags
                  </button>
                  {/* Common tags */}
                  {COMMON_TAGS.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => onTagChange(selectedTag === t.name ? null : t.name)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                        selectedTag === t.name
                          ? 'border-brand-gold bg-brand-gold/15 text-brand-gold font-bold'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${t.bg}`} />
                      {t.name}
                    </button>
                  ))}
                  {/* Additional custom tags found in messages */}
                  {allUsedTags
                    .filter((name) => !COMMON_TAGS.some((ct) => ct.name === name))
                    .map((customName) => (
                      <button
                        key={customName}
                        onClick={() => onTagChange(selectedTag === customName ? null : customName)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                          selectedTag === customName
                            ? 'border-brand-gold bg-brand-gold/15 text-brand-gold font-bold'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {customName}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Active Filter Chips ─── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-2 dark:border-gray-800"
          >
            <span className="mr-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Active:
            </span>

            {/* Search query chip */}
            {search.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Search className="h-2.5 w-2.5" />
                &quot;{search.trim()}&quot;
                <button onClick={onSearchClear} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* View filter chip */}
            {viewFilter !== 'inbox' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                View: {viewFilter.charAt(0).toUpperCase() + viewFilter.slice(1)}
                <button
                  onClick={() => onViewFilterChange('inbox')}
                  className="ml-0.5 hover:text-red-500"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Date preset chip */}
            {datePreset !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Calendar className="h-2.5 w-2.5" />
                {DATE_PRESETS.find((p) => p.key === datePreset)?.label}
                <button onClick={onDatePresetReset} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Sender chip */}
            {senderFilter.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <User className="h-2.5 w-2.5" />
                From: {senderFilter.trim()}
                <button onClick={onSenderClear} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Tag chip */}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Tag className="h-2.5 w-2.5" />
                {selectedTag}
                <button onClick={onTagClear} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Starred chip */}
            {showStarredOnly && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Star className="h-2.5 w-2.5 fill-amber-400" />
                Starred
                <button onClick={onStarFilterClear} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Sort chip */}
            {hasSortChanged && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <ArrowUpDown className="h-2.5 w-2.5" />
                {sortLabel}
                <button onClick={onSortReset} className="ml-0.5 hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}

            {/* Clear all */}
            <button
              onClick={onClearAllFilters}
              className="ml-1 text-[10px] font-semibold text-red-500 transition-colors hover:text-red-600"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Results count + status bar ─── */}
      {!loading && (
        <div className="flex items-center justify-between border-t border-gray-50 px-4 py-1.5 dark:border-gray-800/50">
          <span className="font-mono text-[10px] text-gray-400">
            {processedCount === totalCount
              ? `${totalCount} message${totalCount !== 1 ? 's' : ''}`
              : `${processedCount} of ${totalCount} message${totalCount !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <span className="font-mono text-[10px] font-medium text-amber-600 dark:text-amber-400">
                {selectedCount} selected
              </span>
            )}
            {hasActiveFilters && (
              <span className="text-brand-gold text-[10px] font-medium">Filtered</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
