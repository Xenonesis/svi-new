import { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  type RefIdProfile,
  type RefIdSourceFilter,
  type RefIdSortOption,
  filterAndSortRefIdProfiles,
} from '@/src/lib/receipt/refIdProfiles';
import { RefIdFilterTabs } from './RefIdFilterTabs';
import { RefIdSortMenu } from './RefIdSortMenu';
import { RefIdResultsList } from './RefIdResultsList';

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

  const resetScroll = () => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  };

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
          <div className="shrink-0 border-b border-gray-200/80 bg-gray-50/90 px-2.5 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#111622]/95">
            <div className="flex items-center justify-between gap-1.5">
              <RefIdFilterTabs
                sourceFilter={sourceFilter}
                counts={counts}
                onSelectFilter={(filter) => {
                  setSourceFilter(filter);
                  setActiveIndex(-1);
                  resetScroll();
                }}
              />

              <RefIdSortMenu
                sortOption={sortOption}
                isSortOpen={isSortOpen}
                onToggleSortOpen={() => setIsSortOpen((prev) => !prev)}
                onSelectSortOption={(opt) => {
                  setSortOption(opt);
                  setIsSortOpen(false);
                  setActiveIndex(-1);
                  resetScroll();
                }}
                sortMenuRef={sortMenuRef}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>
                Showing {suggestions.length} match{suggestions.length === 1 ? '' : 'es'}
              </span>
              {Boolean(activeValue) && (
                <span className="truncate italic">Query: &quot;{activeValue}&quot;</span>
              )}
            </div>
          </div>

          <RefIdResultsList
            suggestions={suggestions}
            activeIndex={activeIndex}
            listboxId={listboxId}
            listRef={listRef}
            onSelect={handleSelect}
            onHover={setActiveIndex}
          />
        </div>
      )}
    </div>
  );
}
