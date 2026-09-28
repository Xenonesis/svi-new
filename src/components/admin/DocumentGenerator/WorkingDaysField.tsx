'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { CalendarDays, Check } from 'lucide-react';

interface WorkingDaysFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const WORKING_DAYS_OPTIONS = [
  {
    value: 'Wednesday to Monday',
    label: 'Wednesday to Monday (Tuesday Off - Real Estate Standard)',
  },
  { value: 'Monday to Saturday', label: 'Monday to Saturday (Sunday Off - 6 Days)' },
  { value: 'Monday to Friday', label: 'Monday to Friday (Saturday & Sunday Off - 5 Days)' },
  { value: 'Thursday to Tuesday', label: 'Thursday to Tuesday (Wednesday Off)' },
  { value: 'Tuesday to Sunday', label: 'Tuesday to Sunday (Monday Off)' },
  { value: 'Custom', label: 'Custom (Type manually below)' },
];

export function WorkingDaysField({
  label,
  name,
  value,
  onChange,
  placeholder = 'Wednesday to Monday',
  required = false,
  className = '',
  disabled = false,
}: WorkingDaysFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const triggerChange = (newVal: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: newVal,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleSelect = (val: string) => {
    if (val === 'Custom') {
      setIsOpen(false);
      return;
    }
    triggerChange(val);
    setIsOpen(false);
  };

  const isPresetMatch = WORKING_DAYS_OPTIONS.some(
    (opt) => opt.value !== 'Custom' && opt.value.toLowerCase() === value?.toLowerCase().trim()
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
        {label} {required && '*'}
      </label>

      <div className="relative flex items-center">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="focus:border-brand-gold focus:ring-brand-gold/50 w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-10 pl-4 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100/70 dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600 dark:disabled:bg-gray-900/40"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          title="Open working days dropdown"
          aria-label={`Open working days dropdown for ${label}`}
          aria-expanded={isOpen}
          aria-controls={dropdownId}
          className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 focus:outline-none dark:hover:bg-white/10 dark:hover:text-amber-400"
        >
          <CalendarDays className={`h-4 w-4 transition-colors ${isOpen ? 'text-amber-500' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          id={dropdownId}
          className="dark:bg-brand-dark-surface/95 absolute z-50 mt-1.5 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white p-2.5 shadow-xl backdrop-blur-md sm:min-w-[320px] dark:border-white/15"
          style={{ top: '100%', left: 0 }}
        >
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-1 pb-1.5 dark:border-white/10">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              <CalendarDays className="h-3.5 w-3.5" /> Working Days Options
            </span>
            {isPresetMatch && (
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                Preset Active
              </span>
            )}
          </div>

          <div className="space-y-1">
            {WORKING_DAYS_OPTIONS.map((opt) => {
              const selected =
                opt.value !== 'Custom' && opt.value.toLowerCase() === value?.toLowerCase().trim();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    selected
                      ? 'bg-amber-500 font-semibold text-white shadow-xs'
                      : 'text-gray-700 hover:bg-amber-50/70 hover:text-amber-700 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-amber-400'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="ml-1.5 h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
