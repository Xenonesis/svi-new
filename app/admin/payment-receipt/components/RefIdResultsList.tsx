import type { RefObject } from 'react';
import type { RefIdProfile } from '@/src/lib/receipt/refIdProfiles';

interface RefIdResultsListProps {
  suggestions: RefIdProfile[];
  activeIndex: number;
  listboxId: string;
  listRef: RefObject<HTMLUListElement | null>;
  onSelect: (profile: RefIdProfile) => void;
  onHover: (index: number) => void;
}

function formatProfileMeta(p: RefIdProfile): string {
  return `Phone: ${p.clientPhone || 'N/A'} • Plot: ${p.plotNo || 'N/A'} • Size: ${p.plotSize || 'N/A'} • Project: ${p.account || 'N/A'}`;
}

export function RefIdResultsList({
  suggestions,
  activeIndex,
  listboxId,
  listRef,
  onSelect,
  onHover,
}: RefIdResultsListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {suggestions.length > 0 ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="divide-y divide-gray-100 py-0.5 dark:divide-white/5"
        >
          {suggestions.map((profile, index) => {
            const isSelected = index === activeIndex;
            const isReceipt = profile.source === 'receipt';
            const metaText = formatProfileMeta(profile);

            return (
              <li
                key={`${profile.refId}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(profile)}
                onMouseEnter={() => onHover(index)}
                className={`flex min-h-[48px] cursor-pointer flex-col justify-center px-3.5 py-2 transition-colors duration-150 ${
                  isSelected
                    ? 'bg-brand-gold/15 dark:bg-brand-gold/20'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold shrink-0 rounded border px-2 py-0.5 font-mono text-xs font-bold">
                      {profile.refId}
                    </span>
                    <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {profile.name || 'Unknown Client'}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      isReceipt
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    {isReceipt ? 'Receipt' : 'Allotment'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {metaText}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          No matching Ref. IDs found. Enter custom Ref ID.
        </div>
      )}
    </div>
  );
}
