import { Search, Calendar, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface BbaFiltersProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  projectFilter: string;
  setProjectFilter: Dispatch<SetStateAction<string>>;
  projects: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  setSortConfig: Dispatch<SetStateAction<{ key: string; direction: 'asc' | 'desc' }>>;
  dateRange: { start: string; end: string };
  setDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  onClearFilters: () => void;
}

export default function BbaFilters({
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  projects,
  sortConfig,
  setSortConfig,
  dateRange,
  setDateRange,
  onClearFilters,
}: BbaFiltersProps) {
  const hasActiveFilters = searchQuery || projectFilter || dateRange.start || dateRange.end;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="text-brand-gold absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or advisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-brand-gold dark:bg-brand-dark-surface w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 transition-colors focus:outline-none dark:border-white/8 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-brand-gold h-4 w-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
          >
            <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
              All Projects
            </option>
            {projects.map((proj) => (
              <option
                key={proj}
                value={proj}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {proj}
              </option>
            ))}
          </select>

          <select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction: direction as 'asc' | 'desc' });
            }}
            className="focus:border-brand-gold dark:bg-brand-dark-surface rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 [color-scheme:light] outline-none dark:border-white/10 dark:text-gray-200 dark:[color-scheme:dark]"
          >
            <option
              value="date-desc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Newest First
            </option>
            <option
              value="date-asc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Oldest First
            </option>
            <option
              value="name-asc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Client (A-Z)
            </option>
            <option
              value="name-desc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Client (Z-A)
            </option>
            <option
              value="cost-desc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Value (High-Low)
            </option>
            <option
              value="cost-asc"
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              Value (Low-High)
            </option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">Active Filters:</span>
          <button
            onClick={onClearFilters}
            className="text-brand-gold hover:text-brand-navy flex items-center gap-1 font-medium transition-colors dark:hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
