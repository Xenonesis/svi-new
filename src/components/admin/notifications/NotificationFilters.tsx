import React from 'react';
import { motion } from 'motion/react';
import { Search, X, ChevronDown, MailOpen, Mail } from 'lucide-react';
import { FilterType, ReadFilter, SortOption } from './types';

interface NotificationFiltersProps {
  typeFilter: FilterType;
  setTypeFilter: (val: FilterType) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  readFilter: ReadFilter;
  setReadFilter: (val: ReadFilter) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  setCurrentPage: (val: number) => void;
  sortOptions: { value: SortOption; label: string }[];
}

export function NotificationFilters({
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  readFilter,
  setReadFilter,
  sortBy,
  setSortBy,
  setCurrentPage,
  sortOptions,
}: NotificationFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark:bg-brand-dark-surface mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 dark:border-gray-700"
    >
      {/* Row 1: Type filter & search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'info', label: 'Info' },
              { key: 'success', label: 'Success' },
              { key: 'warning', label: 'Warning' },
              { key: 'error', label: 'Error' },
            ] as { key: FilterType; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setTypeFilter(key);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                typeFilter === key
                  ? 'bg-brand-gold text-brand-navy'
                  : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-8 pl-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Read filter & sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Read status filter */}
        <div className="flex gap-2">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' },
            ] as { key: ReadFilter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setReadFilter(key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all ${
                readFilter === key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {key === 'read' ? (
                <MailOpen size={12} />
              ) : key === 'unread' ? (
                <Mail size={12} />
              ) : null}
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setCurrentPage(1);
            }}
            className="focus:border-brand-gold appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pr-8 pl-3 text-xs text-gray-700 transition-colors focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-gray-800">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </motion.div>
  );
}
