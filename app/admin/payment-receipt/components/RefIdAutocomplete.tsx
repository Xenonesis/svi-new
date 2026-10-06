import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Search, X, ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import {
  RefIdProfile,
  RefIdSourceFilter,
  RefIdSortOption,
  filterAndSortRefIdProfiles,
} from '@/src/lib/receipt/refIdProfiles';

export interface RefIdAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProfile?: (profile: RefIdProfile) => void;
  profiles: RefIdProfile[];
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

function formatProfileMeta(p: RefIdProfile): string {
  return `Phone: ${p.clientPhone || 'N/A'} • Plot: ${p.plotNo || 'N/A'} • Size: ${p.plotSize || 'N/A'} • Project: ${p.account || 'N/A'}`;
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

export default function RefIdAutocomplete({
  value,
  onChange,
  onSelectProfile,
  profiles,
  disabled = false,
  required = false,
  id,
  name,
  placeholder = 'Search or enter Ref. ID...',
  className = '',
}: RefIdAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalQuery, setInternalQuery] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<RefIdSourceFilter>('all');
  const [sortOption, setSortOption] = useState<RefIdSortOption>('none');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const generatedId = useId();
  const listboxId = `ref-id-listbox-${id || generatedId.replace(/:/g, '')}`;

  useEffect(() => {
    setInternalQuery(null);
  }, [value]);

  const activeValue = internalQuery !== null ? internalQuery : value;

  // Profile counts for tabs
  const counts = useMemo(() => {
    let receipts = 0;
    let candidates = 0;
    for (const p of profiles) {
      if (p.source === 'receipt') receipts++;
      else if (p.source === 'candidate') candidates++;
    }
    return {
      all: profiles.length,
      receipt: receipts,
      candidate: candidates,
    };
  }, [profiles]);

  // Filter and sort suggestions
  const suggestions = useMemo(
    () =>
      filterAndSortRefIdProfiles(profiles, {
        query: activeValue,
        sourceFilter,
        sortOption,
        limit: 35,
      }),
    [profiles, activeValue, sourceFilter, sortOption]
  );
  // Click outside handling to cleanly close dropdown & sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSortOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Reset list scroll position when opening or filtering
  const resetScroll = () => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  };

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleSelect = (profile: RefIdProfile) => {
    setInternalQuery(profile.refId);
    onChange(profile.refId);
    onSelectProfile?.(profile);
    setIsOpen(false);
    setIsSortOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalQuery('');
    onChange('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        if (suggestions.length > 0) {
          setActiveIndex(0);
        }
      } else if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        if (suggestions.length > 0) {
          setActiveIndex(suggestions.length - 1);
        }
      } else if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          value={activeValue}
          onChange={(e) => {
            setInternalQuery(e.target.value);
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className="focus:border-brand-gold focus:ring-brand-gold/50 min-h-[44px] w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-10 pl-9 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/70 dark:border-white/10 dark:bg-[#111622] dark:text-white dark:placeholder-gray-500 dark:disabled:bg-gray-900/40"
        />
        {Boolean(activeValue) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear Ref. ID"
            className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1.5 flex max-h-[400px] w-full max-w-[460px] min-w-[340px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1017]/98">
          {/* Dropdown Control Header */}
          <div className="shrink-0 border-b border-gray-200/80 bg-gray-50/90 px-2.5 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#111622]/95">
            <div className="flex items-center justify-between gap-1.5">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100/80 p-0.5 dark:border-white/10 dark:bg-black/40">
                <button
                  type="button"
                  aria-label="Filter all"
                  onClick={() => {
                    setSourceFilter('all');
                    setActiveIndex(-1);
                    resetScroll();
                  }}
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
                  onClick={() => {
                    setSourceFilter('receipt');
                    setActiveIndex(-1);
                    resetScroll();
                  }}
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
                  onClick={() => {
                    setSourceFilter('candidate');
                    setActiveIndex(-1);
                    resetScroll();
                  }}
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

              {/* Sort Selector Dropdown */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  type="button"
                  aria-label="Sort options"
                  onClick={() => setIsSortOpen((prev) => !prev)}
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
                    {(
                      ['refId-desc', 'refId-asc', 'name-asc', 'name-desc'] as RefIdSortOption[]
                    ).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSortOption(opt);
                          setIsSortOpen(false);
                          setActiveIndex(-1);
                          resetScroll();
                        }}
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
            </div>

            {/* Results count bar */}
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>
                Showing {suggestions.length} match{suggestions.length === 1 ? '' : 'es'}
              </span>
              {Boolean(activeValue) && (
                <span className="truncate italic">Query: &quot;{activeValue}&quot;</span>
              )}
            </div>
          </div>

          {/* Scrollable Results List */}
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
                      onMouseDown={(e) => {
                        // Prevent input blur before click finishes
                        e.preventDefault();
                      }}
                      onClick={() => handleSelect(profile)}
                      onMouseEnter={() => setActiveIndex(index)}
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
        </div>
      )}
    </div>
  );
}
