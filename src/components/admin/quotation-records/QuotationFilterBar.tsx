import { Search, X, Filter } from 'lucide-react';

interface QuotationFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  counts?: {
    all: number;
    completed: number;
    draft: number;
  };
}

export function QuotationFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  counts,
}: QuotationFilterBarProps) {
  const statusOptions = [
    { id: 'all', label: 'All Quotations', count: counts?.all },
    { id: 'completed', label: 'Completed', count: counts?.completed },
    { id: 'draft', label: 'Drafts', count: counts?.draft },
  ];

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by quotation no, customer, phone, project..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:border-brand-gold/80 focus:ring-brand-gold/20 dark:bg-brand-dark-surface/85 w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-10 text-xs text-gray-900 placeholder-gray-400 shadow-xs transition-all focus:ring-2 focus:outline-none sm:text-sm dark:border-white/10 dark:text-white dark:placeholder-gray-500"
          aria-label="Search quotations"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status Filter Chips */}
      {onStatusFilterChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusOptions.map((opt) => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusFilterChange(opt.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-gold text-brand-navy shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {opt.count != null && (
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                      isActive
                        ? 'text-brand-navy bg-black/15'
                        : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
