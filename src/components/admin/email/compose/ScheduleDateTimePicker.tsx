'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScheduleDateTimePickerProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  onClose?: () => void;
  showPresets?: boolean;
  compact?: boolean;
  helperText?: string;
}

const HOURS_12 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function formatDigitsToDDMMYYYY(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function isoDateToDisplay(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function displayToIsoDate(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const dd = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  const yyyy = parseInt(match[3], 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 2024 || yyyy > 2100) return null;
  const dateObj = new Date(yyyy, mm - 1, dd);
  if (dateObj.getFullYear() !== yyyy || dateObj.getMonth() !== mm - 1 || dateObj.getDate() !== dd) {
    return null;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function getLocalYYYYMMDD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function to24Hour(hour12: string, period: 'AM' | 'PM'): string {
  let h = parseInt(hour12, 10);
  if (isNaN(h) || h < 1 || h > 12) h = 10;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return String(h).padStart(2, '0');
}

function parseValue(val: string | null | undefined): {
  isoDate: string;
  displayDate: string;
  hour12: string;
  minute: string;
  period: 'AM' | 'PM';
} {
  if (!val || !val.trim()) {
    return {
      isoDate: '',
      displayDate: '',
      hour12: '10',
      minute: '00',
      period: 'AM',
    };
  }

  // Match "YYYY-MM-DDTHH:mm"
  const match = val.trim().match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const isoDate = match[1];
    const h24 = parseInt(match[2], 10);
    const min = match[3];
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      isoDate,
      displayDate: isoDateToDisplay(isoDate),
      hour12: String(h12).padStart(2, '0'),
      minute: min,
      period,
    };
  }

  const parsedDate = new Date(val);
  if (!isNaN(parsedDate.getTime())) {
    const isoDate = getLocalYYYYMMDD(parsedDate);
    const h24 = parsedDate.getHours();
    const min = String(parsedDate.getMinutes()).padStart(2, '0');
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      isoDate,
      displayDate: isoDateToDisplay(isoDate),
      hour12: String(h12).padStart(2, '0'),
      minute: min,
      period,
    };
  }

  return {
    isoDate: '',
    displayDate: '',
    hour12: '10',
    minute: '00',
    period: 'AM',
  };
}

export function ScheduleDateTimePicker({
  value,
  onChange,
  onClose,
  showPresets = true,
  compact = false,
  helperText,
}: ScheduleDateTimePickerProps) {
  const initial = parseValue(value);
  const [displayDate, setDisplayDate] = useState(initial.displayDate);
  const [isoDate, setIsoDate] = useState(initial.isoDate);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const next = parseValue(value);
    setIsoDate(next.isoDate);
    setDisplayDate(next.displayDate);
    if (next.isoDate) {
      setHour12(next.hour12);
      setMinute(next.minute);
      setPeriod(next.period);
    }
  }, [value]);

  const emitChange = (
    nextIsoDate: string,
    nextHour12: string,
    nextMinute: string,
    nextPeriod: 'AM' | 'PM'
  ) => {
    if (!nextIsoDate) {
      onChange(null);
      return;
    }
    const hh24 = to24Hour(nextHour12, nextPeriod);
    onChange(`${nextIsoDate}T${hh24}:${nextMinute}`);
  };

  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDigitsToDDMMYYYY(e.target.value);
    setDisplayDate(formatted);

    if (formatted === '') {
      setIsoDate('');
      onChange(null);
      return;
    }

    const validIso = displayToIsoDate(formatted);
    if (validIso) {
      setIsoDate(validIso);
      emitChange(validIso, hour12, minute, period);
    }
  };

  const handleDateBlur = () => {
    const digits = displayDate.replace(/\D/g, '');
    if (digits.length === 6) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yy = parseInt(digits.slice(4, 6), 10);
      const yyyy = 2000 + yy;
      const expanded = `${dd}/${mm}/${yyyy}`;
      const validIso = displayToIsoDate(expanded);
      if (validIso) {
        setDisplayDate(expanded);
        setIsoDate(validIso);
        emitChange(validIso, hour12, minute, period);
      }
    }
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenIso = e.target.value;
    if (!chosenIso) {
      setIsoDate('');
      setDisplayDate('');
      onChange(null);
      return;
    }
    setIsoDate(chosenIso);
    setDisplayDate(isoDateToDisplay(chosenIso));
    emitChange(chosenIso, hour12, minute, period);
  };

  const ensureDateOrToday = (): string => {
    if (isoDate) return isoDate;
    const todayIso = getLocalYYYYMMDD(new Date());
    setIsoDate(todayIso);
    setDisplayDate(isoDateToDisplay(todayIso));
    return todayIso;
  };

  const handleHourChange = (nextHour: string) => {
    setHour12(nextHour);
    const activeIso = ensureDateOrToday();
    emitChange(activeIso, nextHour, minute, period);
  };

  const handleMinuteChange = (nextMin: string) => {
    setMinute(nextMin);
    const activeIso = ensureDateOrToday();
    emitChange(activeIso, hour12, nextMin, period);
  };

  const handlePeriodChange = (nextPeriod: 'AM' | 'PM') => {
    setPeriod(nextPeriod);
    const activeIso = ensureDateOrToday();
    emitChange(activeIso, hour12, minute, nextPeriod);
  };

  const applyPreset = (targetDate: Date) => {
    const nextIso = getLocalYYYYMMDD(targetDate);
    const h24 = targetDate.getHours();
    const min = String(targetDate.getMinutes()).padStart(2, '0');
    const nextPeriod: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const h12 = String(h24 % 12 === 0 ? 12 : h24 % 12).padStart(2, '0');

    setIsoDate(nextIso);
    setDisplayDate(isoDateToDisplay(nextIso));
    setHour12(h12);
    setMinute(min);
    setPeriod(nextPeriod);
    onChange(`${nextIso}T${String(h24).padStart(2, '0')}:${min}`);
  };

  const handleClear = () => {
    setIsoDate('');
    setDisplayDate('');
    onChange(null);
    onClose?.();
  };

  // Compute human-readable summary & validation
  const scheduledDateObj = value ? new Date(value) : null;
  const isValidDateObj = scheduledDateObj && !isNaN(scheduledDateObj.getTime());
  const isPast = isValidDateObj ? scheduledDateObj.getTime() <= Date.now() : false;

  const formattedSummary = isValidDateObj
    ? scheduledDateObj.toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="flex flex-col gap-2 py-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. DD/MM/YYYY Input + Calendar Picker */}
        <div className="focus-within:border-brand-gold focus-within:ring-brand-gold/25 relative flex items-center rounded-lg border border-gray-200 bg-gray-50/90 px-2.5 py-1.5 transition-all focus-within:bg-white focus-within:ring-2 dark:border-gray-700 dark:bg-gray-800/70 dark:focus-within:bg-gray-900">
          <input
            type="text"
            inputMode="numeric"
            value={displayDate}
            onChange={handleDateTextChange}
            onBlur={handleDateBlur}
            placeholder="DD/MM/YYYY"
            maxLength={10}
            aria-label="Schedule Date (DD/MM/YYYY)"
            className="w-[95px] bg-transparent font-mono text-xs font-semibold tracking-wider text-gray-900 placeholder-gray-400 outline-none focus:outline-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none dark:text-gray-100 dark:placeholder-gray-500"
          />
          <div className="relative ml-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => datePickerRef.current?.showPicker?.()}
              title="Open Calendar"
              className="text-brand-gold hover:text-brand-gold/80 flex items-center justify-center rounded p-0.5 transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
            </button>
            <input
              ref={datePickerRef}
              type="date"
              tabIndex={-1}
              value={isoDate}
              min={getLocalYYYYMMDD(new Date())}
              onChange={handleNativeDateChange}
              aria-label="Pick schedule date from calendar"
              className="pointer-events-auto absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>

        {/* 2. Time Selector: HH : MM + AM/PM Pill */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50/90 px-2 py-1 dark:border-gray-700 dark:bg-gray-800/70">
          <Clock className="text-brand-gold mr-0.5 h-3.5 w-3.5 shrink-0" />
          <select
            value={hour12}
            onChange={(e) => handleHourChange(e.target.value)}
            aria-label="Hour"
            className="cursor-pointer bg-transparent font-mono text-xs font-bold text-gray-900 outline-none focus:outline-none focus-visible:outline-none dark:bg-gray-800 dark:text-gray-100"
          >
            {HOURS_12.map((h) => (
              <option
                key={h}
                value={h}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {h}
              </option>
            ))}
          </select>
          <span className="font-mono text-xs font-bold text-gray-400">:</span>
          <select
            value={minute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            aria-label="Minute"
            className="cursor-pointer bg-transparent font-mono text-xs font-bold text-gray-900 outline-none focus:outline-none focus-visible:outline-none dark:bg-gray-800 dark:text-gray-100"
          >
            {MINUTES_60.map((m) => (
              <option
                key={m}
                value={m}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {m}
              </option>
            ))}
          </select>

          {/* 1-Click AM / PM Toggle */}
          <div className="ml-1 flex items-center rounded-md bg-gray-200/80 p-0.5 dark:bg-gray-700/80">
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-extrabold transition-all ${
                  period === p
                    ? 'bg-brand-gold text-brand-navy shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quick Presets */}
        {showPresets && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const d = new Date(Date.now() + 60 * 60 * 1000);
                applyPreset(d);
              }}
              className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold rounded-md border border-gray-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
            >
              +1 Hr
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                if (d.getHours() >= 18) {
                  d.setHours(21, 0, 0, 0);
                } else {
                  d.setHours(18, 0, 0, 0);
                }
                applyPreset(d);
              }}
              className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold rounded-md border border-gray-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
            >
              {new Date().getHours() >= 18 ? 'Tonight 9 PM' : 'Today 6 PM'}
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                d.setHours(10, 0, 0, 0);
                applyPreset(d);
              }}
              className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold rounded-md border border-gray-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
            >
              Tomorrow 10 AM
            </button>
            {!compact && (
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(17, 0, 0, 0);
                  applyPreset(d);
                }}
                className="hover:border-brand-gold/50 hover:bg-brand-gold/10 hover:text-brand-gold rounded-md border border-gray-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-gray-600 transition-all dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
              >
                Tomorrow 5 PM
              </button>
            )}
          </div>
        )}

        {/* Clear / Close Button */}
        {(value || onClose) && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear schedule (Send immediately)"
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
            {!compact && <span>Clear</span>}
          </button>
        )}
      </div>

      {/* Live Preview Status / Helper */}
      <div className="flex items-center gap-2 text-[11px]">
        {formattedSummary ? (
          isPast ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Selected time ({formattedSummary}) is in the past — please pick a future time
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              Scheduled for <strong className="font-semibold">{formattedSummary} IST</strong>
            </span>
          )
        ) : (
          <span className="text-gray-400/80">
            {helperText || '(Leave empty to send immediately — or pick date DD/MM/YYYY & time)'}
          </span>
        )}
      </div>
    </div>
  );
}
