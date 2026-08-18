'use client';

import { Search, X } from 'lucide-react';

interface PortalAllotmentsFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  projects: string[];
}

export function PortalAllotmentsFilters({
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  projects,
}: PortalAllotmentsFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-2.5 font-sans sm:mb-6 sm:flex-row sm:gap-3">
      <div className="relative flex-1">
        <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 sm:left-3.5 sm:h-4 sm:w-4" />
        <input
          type="text"
          placeholder="Search by client, ticket ID or advisor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-2 pr-9 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none sm:py-3 sm:pr-10 sm:pl-10 sm:text-sm dark:border-white/10 dark:text-white dark:placeholder-gray-600"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search query"
            className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 sm:right-3.5"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          aria-label="Filter by project"
          className="focus:border-brand-gold dark:bg-brand-dark-surface/85 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-semibold tracking-wider text-gray-700 transition-all outline-none hover:bg-gray-50 sm:w-auto sm:px-5 sm:py-3 sm:text-xs sm:font-bold sm:tracking-widest dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
            ALL PROJECTS
          </option>
          {projects.map((proj) => (
            <option
              key={proj}
              value={proj}
              className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            >
              {proj.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
