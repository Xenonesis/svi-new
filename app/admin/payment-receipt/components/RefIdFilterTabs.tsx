import type { RefIdSourceFilter } from '@/src/lib/receipt/refIdProfiles';

interface RefIdFilterTabsProps {
  sourceFilter: RefIdSourceFilter;
  counts: {
    all: number;
    receipt: number;
    candidate: number;
  };
  onSelectFilter: (filter: RefIdSourceFilter) => void;
}

export function RefIdFilterTabs({ sourceFilter, counts, onSelectFilter }: RefIdFilterTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100/80 p-0.5 dark:border-white/10 dark:bg-black/40">
      <button
        type="button"
        aria-label="Filter all"
        onClick={() => onSelectFilter('all')}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
          sourceFilter === 'all'
            ? 'dark:bg-brand-gold/20 dark:text-brand-gold bg-white text-gray-900 shadow-xs'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        }`}
      >
        <span>All</span>
        <span className="py-0.2 rounded-full bg-gray-200/80 px-1 font-mono text-[10px] dark:bg-white/10">
          {counts.all}
        </span>
      </button>
      <button
        type="button"
        aria-label="Filter receipts"
        onClick={() => onSelectFilter('receipt')}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
          sourceFilter === 'receipt'
            ? 'bg-white text-emerald-600 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-300'
        }`}
      >
        <span>Receipts</span>
        <span className="py-0.2 rounded-full bg-emerald-100 px-1 font-mono text-[10px] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
          {counts.receipt}
        </span>
      </button>
      <button
        type="button"
        aria-label="Filter allotments"
        onClick={() => onSelectFilter('candidate')}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all ${
          sourceFilter === 'candidate'
            ? 'bg-white text-sky-600 shadow-xs dark:bg-sky-500/20 dark:text-sky-400'
            : 'text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-300'
        }`}
      >
        <span>Allotments</span>
        <span className="py-0.2 rounded-full bg-sky-100 px-1 font-mono text-[10px] text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
          {counts.candidate}
        </span>
      </button>
    </div>
  );
}
