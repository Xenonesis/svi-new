import type { RefObject } from 'react';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import type { RefIdSortOption } from '@/src/lib/receipt/refIdProfiles';

interface RefIdSortMenuProps {
  sortOption: RefIdSortOption;
  isSortOpen: boolean;
  onToggleSortOpen: () => void;
  onSelectSortOption: (option: RefIdSortOption) => void;
  sortMenuRef: RefObject<HTMLDivElement | null>;
}

const SORT_LABELS: Record<RefIdSortOption, string> = {
  none: 'Default',
  'refId-desc': 'Ref ID (Newest)',
  'refId-asc': 'Ref ID (Oldest)',
  'name-asc': 'Name (A → Z)',
  'name-desc': 'Name (Z → A)',
  'date-desc': 'Date (Newest)',
};

const SHORT_SORT_LABELS: Record<RefIdSortOption, string> = {
  none: 'Sort',
  'refId-desc': 'Newest ↓',
  'refId-asc': 'Oldest ↑',
  'name-asc': 'A → Z',
  'name-desc': 'Z → A',
  'date-desc': 'Date ↓',
};

const SORT_OPTIONS: RefIdSortOption[] = ['refId-desc', 'refId-asc', 'name-asc', 'name-desc'];

export function RefIdSortMenu({
  sortOption,
  isSortOpen,
  onToggleSortOpen,
  onSelectSortOption,
  sortMenuRef,
}: RefIdSortMenuProps) {
  return (
    <div className="relative" ref={sortMenuRef}>
      <button
        type="button"
        aria-label="Sort options"
        onClick={onToggleSortOpen}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-xs transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-[#161c2c] dark:text-gray-200 dark:hover:border-white/20"
      >
        <ArrowUpDown className="text-brand-gold h-3 w-3 shrink-0" />
        <span className="text-brand-gold text-[11px] font-semibold">
          {SHORT_SORT_LABELS[sortOption] || 'Sort'}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>
      {isSortOpen && (
        <div className="absolute right-0 z-60 mt-1 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-[#111622]">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Sort Ref IDs By
          </div>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelectSortOption(opt)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                sortOption === opt
                  ? 'bg-brand-gold/15 text-brand-gold font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
              }`}
            >
              <span>{SORT_LABELS[opt]}</span>
              {sortOption === opt && <Check className="text-brand-gold h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
