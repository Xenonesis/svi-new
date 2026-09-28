'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  type?: 'start' | 'end';
}

const START_PRESETS = ['09:00 am', '09:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'];

const END_PRESETS = ['05:30 pm', '06:00 pm', '06:30 pm', '07:00 pm', '07:30 pm', '08:00 pm'];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function parseTimeString(timeStr: string): { hour: string; minute: string; period: 'am' | 'pm' } {
  if (!timeStr) {
    return { hour: '10', minute: '30', period: 'am' };
  }
  const clean = timeStr.trim().toLowerCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    if (isNaN(h) || h < 1) h = 12;
    if (h > 12) h = 12;
    const hourStr = h < 10 ? `0${h}` : `${h}`;
    const minStr = match[2] || '00';
    const period = (match[3] as 'am' | 'pm') || (h >= 12 ? 'pm' : 'am');
    return { hour: hourStr, minute: minStr, period };
  }
  return { hour: '10', minute: '30', period: 'am' };
}

export function TimePickerField({
  label,
  name,
  value,
  onChange,
  placeholder = '10:30 am',
  required = false,
  className = '',
  disabled = false,
  type = 'start',
}: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const presets = type === 'start' ? START_PRESETS : END_PRESETS;
  const parsed = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'am' | 'pm'>(parsed.period);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const p = parseTimeString(value);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);
    }
  }, [value]);

  // Click outside to close popover
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

  const handleSelectPreset = (preset: string) => {
    triggerChange(preset);
    setIsOpen(false);
  };

  const handleApplyCustom = (hour: string, minute: string, period: 'am' | 'pm') => {
    const formatted = `${hour}:${minute} ${period}`;
    triggerChange(formatted);
  };

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
          title="Open clock picker"
          aria-label={`Open clock picker for ${label}`}
          aria-expanded={isOpen}
          aria-controls={dropdownId}
          className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-amber-600 focus:outline-none dark:hover:bg-white/10 dark:hover:text-amber-400"
        >
          <Clock
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-12 text-amber-500' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          id={dropdownId}
          className="dark:bg-brand-dark-surface/95 absolute z-50 mt-1.5 w-72 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xl backdrop-blur-md dark:border-white/15"
          style={{ top: '100%', left: 0 }}
        >
          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/10">
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" /> Clock Dropdown
            </span>
            <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
              {selectedHour}:{selectedMinute} {selectedPeriod.toUpperCase()}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="mb-3">
            <span className="mb-1.5 block text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Common Shifts
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {presets.map((p) => {
                const isSelected = value?.toLowerCase().trim() === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`rounded-md px-2 py-1 text-center font-mono text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-amber-500 font-bold text-white shadow-xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-600 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-amber-500/15 dark:hover:text-amber-400'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Time Selector Columns */}
          <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50/70 p-2 dark:border-white/5 dark:bg-white/5">
            <div className="grid grid-cols-3 gap-2">
              {/* Hour column */}
              <div>
                <span className="mb-1 block text-center text-[9px] font-bold text-gray-400 uppercase">
                  Hour
                </span>
                <div className="max-h-28 scrollbar-thin space-y-0.5 overflow-y-auto rounded">
                  {HOURS.map((h) => {
                    const active = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setSelectedHour(h);
                          handleApplyCustom(h, selectedMinute, selectedPeriod);
                        }}
                        className={`w-full rounded py-0.5 text-center font-mono text-xs transition-colors ${
                          active
                            ? 'bg-amber-500 font-bold text-white'
                            : 'text-gray-700 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute column */}
              <div>
                <span className="mb-1 block text-center text-[9px] font-bold text-gray-400 uppercase">
                  Min
                </span>
                <div className="max-h-28 scrollbar-thin space-y-0.5 overflow-y-auto rounded">
                  {MINUTES.map((m) => {
                    const active = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMinute(m);
                          handleApplyCustom(selectedHour, m, selectedPeriod);
                        }}
                        className={`w-full rounded py-0.5 text-center font-mono text-xs transition-colors ${
                          active
                            ? 'bg-amber-500 font-bold text-white'
                            : 'text-gray-700 hover:bg-gray-200/70 dark:text-gray-300 dark:hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AM / PM column */}
              <div>
                <span className="mb-1 block text-center text-[9px] font-bold text-gray-400 uppercase">
                  Period
                </span>
                <div className="flex flex-col gap-1.5 pt-1">
                  {(['am', 'pm'] as const).map((ap) => {
                    const active = selectedPeriod === ap;
                    return (
                      <button
                        key={ap}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(ap);
                          handleApplyCustom(selectedHour, selectedMinute, ap);
                        }}
                        className={`rounded py-1.5 text-center font-mono text-xs font-bold uppercase transition-colors ${
                          active
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15'
                        }`}
                      >
                        {ap}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full cursor-pointer rounded-lg bg-gray-900 py-1.5 text-center text-xs font-bold text-white transition-colors hover:bg-black dark:bg-white/10 dark:hover:bg-white/20"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
