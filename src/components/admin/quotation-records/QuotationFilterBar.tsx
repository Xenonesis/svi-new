import { Search, X } from 'lucide-react';

interface QuotationFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function QuotationFilterBar({ searchQuery, onSearchChange }: QuotationFilterBarProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative max-w-lg">
        <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 sm:left-3.5 sm:h-4 sm:w-4" />
        <input
          type="text"
          placeholder="Search by quotation no., customer, project..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:border-brand-gold focus:ring-brand-gold/15 dark:bg-brand-dark-surface/85 w-full rounded-lg border border-gray-200 bg-white py-2 pr-9 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none sm:py-3 sm:pr-10 sm:pl-10 sm:text-sm dark:border-white/10 dark:text-white dark:placeholder-gray-600"
          aria-label="Search quotations"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 sm:right-3.5"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
