'use client';

import { Search, Plus } from 'lucide-react';

interface CampaignSearchBarProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: string) => void;
  onCreateClick: () => void;
}

const STATUS_FILTERS = ['all', 'draft', 'scheduled', 'sent', 'cancelled', 'lottery'];

export function CampaignSearchBar({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
}: CampaignSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white p-4 sm:flex-row sm:items-center dark:border-gray-700/60 dark:bg-[#0e0e14]">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus-gold w-full rounded-lg border border-gray-200 bg-gray-50/80 py-2.5 pr-4 pl-10 text-sm dark:border-gray-700 dark:bg-gray-800/50"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all ${
              statusFilter === status
                ? 'bg-brand-gold/10 text-brand-gold font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <button
        onClick={onCreateClick}
        className="bg-brand-gold text-brand-navy glow-gold inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Create
      </button>
    </div>
  );
}
