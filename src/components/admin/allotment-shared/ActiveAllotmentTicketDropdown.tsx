'use client';

import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Tag, Building2 } from 'lucide-react';
import type { ActiveAllotmentOption } from './types';
import { formatTicketId } from '@/src/lib/allotment/ticketUtils';

export interface ActiveAllotmentTicketDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAllotment?: (allotment: ActiveAllotmentOption) => void;
  allotments: ActiveAllotmentOption[];
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
}

export function ActiveAllotmentTicketDropdown({
  value,
  onChange,
  onSelectAllotment,
  allotments,
  loading = false,
  disabled = false,
  required = false,
  id,
  name = 'ticketId',
  placeholder = 'Select or search active allotment ticket...',
  className = '',
}: ActiveAllotmentTicketDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const generatedId = useId();
  const inputId = id || `allotment-ticket-select-${generatedId.replace(/:/g, '')}`;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const cleanCurrentVal = formatTicketId(value);

  // Selected allotment details
  const selectedAllotment = useMemo(() => {
    if (!cleanCurrentVal) return null;
    return allotments.find((a) => formatTicketId(a.ticketId) === cleanCurrentVal) || null;
  }, [cleanCurrentVal, allotments]);

  // Filtered allotments
  const filteredAllotments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allotments;
    return allotments.filter((a) => {
      const t = a.ticketId.toLowerCase();
      const c = a.clientName.toLowerCase();
      const u = a.unitNumber.toLowerCase();
      const p = a.projectName.toLowerCase();
      const ph = a.phone.toLowerCase();
      const adv = a.advisorName.toLowerCase();
      return (
        t.includes(q) ||
        c.includes(q) ||
        u.includes(q) ||
        p.includes(q) ||
        ph.includes(q) ||
        adv.includes(q)
      );
    });
  }, [allotments, searchQuery]);

  const handleSelect = (allotment: ActiveAllotmentOption) => {
    onChange(allotment.ticketId);
    onSelectAllotment?.(allotment);
    setIsOpen(false);
    setSearchQuery('');
    setActiveIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
      setActiveIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredAllotments.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredAllotments.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredAllotments.length) {
        handleSelect(filteredAllotments[activeIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400"
      >
        Ticket ID {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button / Display */}
      <div
        id={inputId}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`group focus:border-brand-gold focus:ring-brand-gold/50 dark:focus:border-brand-gold flex min-h-[46px] w-full cursor-pointer items-center justify-between rounded-xl border bg-gray-50 px-3.5 py-2 text-xs transition-all outline-none focus:ring-1 dark:border-white/10 dark:bg-[#111118] ${
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-gray-400 dark:hover:border-white/20'
        } ${isOpen ? 'border-brand-gold ring-brand-gold/50 dark:border-brand-gold ring-1' : 'border-gray-200'}`}
      >
        {selectedAllotment ? (
          <div className="flex flex-1 items-center gap-2 overflow-hidden pr-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              <Tag className="h-3 w-3" />
              {selectedAllotment.ticketId}
            </span>
            <span className="truncate font-semibold text-gray-900 dark:text-white">
              {selectedAllotment.clientName}
            </span>
            <span className="shrink-0 text-slate-400 dark:text-slate-500">•</span>
            <span className="truncate font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Plot {selectedAllotment.unitNumber}
            </span>
            {selectedAllotment.projectName && (
              <span className="hidden truncate text-[10px] text-slate-400 sm:inline dark:text-slate-500">
                ({selectedAllotment.projectName})
              </span>
            )}
          </div>
        ) : value ? (
          <div className="flex flex-1 items-center gap-2 overflow-hidden pr-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-slate-200 px-2 py-0.5 font-mono text-xs font-bold text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white">
              <Tag className="text-brand-gold h-3 w-3" />
              {value}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              (Manual / Custom Entry)
            </span>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            {loading ? 'Loading active allotments...' : placeholder}
          </span>
        )}

        <div className="flex items-center gap-1.5 pl-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'text-brand-gold rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] z-50 flex max-h-[360px] w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#111622]">
          {/* Search Header */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by ticket, client, unit, project..."
              className="w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* List Options */}
          <ul
            ref={listRef}
            role="listbox"
            className="flex-1 divide-y divide-gray-100 overflow-y-auto overscroll-contain py-1 dark:divide-white/[0.05]"
          >
            {filteredAllotments.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                {searchQuery ? (
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      No active allotment matches &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const clean = formatTicketId(searchQuery);
                        onChange(clean);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 mt-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold"
                    >
                      Use &ldquo;{formatTicketId(searchQuery)}&rdquo; as Custom Ticket
                    </button>
                  </div>
                ) : (
                  'No active allotments available in database.'
                )}
              </li>
            ) : (
              filteredAllotments.map((item, idx) => {
                const isSelected = formatTicketId(item.ticketId) === cleanCurrentVal;
                const isHighlighted = idx === activeIndex;

                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex cursor-pointer items-start justify-between gap-3 px-3.5 py-2.5 transition-colors ${
                      isSelected
                        ? 'bg-brand-gold/15 dark:bg-brand-gold/10'
                        : isHighlighted
                          ? 'bg-gray-100/80 dark:bg-white/[0.06]'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                      {/* Top row: Ticket badge + Client name */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <Tag className="h-2.5 w-2.5" />
                          {item.ticketId}
                        </span>
                        <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                          {item.clientName}
                        </span>
                      </div>

                      {/* Middle row: Unit and Project */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300">
                          Unit: {item.unitNumber}
                        </span>
                        {item.area && (
                          <span className="text-slate-400 dark:text-slate-500">
                            • {item.area} Sq.Yds.
                          </span>
                        )}
                        {item.projectName && (
                          <span className="flex items-center gap-1 truncate text-slate-500 dark:text-slate-400">
                            <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                            {item.projectName}
                          </span>
                        )}
                      </div>

                      {/* Bottom row: Advisor & Phone */}
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                        {item.advisorName && <span>Advisor: {item.advisorName}</span>}
                        {item.phone && <span>Phone: {item.phone}</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="bg-brand-gold/20 text-brand-gold flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
