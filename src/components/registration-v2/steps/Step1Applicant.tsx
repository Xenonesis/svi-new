'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  CheckCircle2,
} from 'lucide-react';
import type { StepProps, Step1ApplicantProps } from '../types';

export type { Step1ApplicantProps };

const RELATION_PREFIXES = ['S/O', 'W/O', 'D/O'] as const;
type RelationPrefix = (typeof RELATION_PREFIXES)[number];

function splitRelation(raw: string): { prefix: RelationPrefix; name: string } {
  const trimmed = (raw || '').trim();
  for (const p of RELATION_PREFIXES) {
    const pattern = new RegExp(`^${p}\\s*`, 'i');
    if (pattern.test(trimmed)) {
      return {
        prefix: p,
        name: trimmed.replace(pattern, '').trim(),
      };
    }
  }
  return { prefix: 'S/O', name: trimmed };
}

export function Step1Applicant({
  formData,
  errors,
  touchedFields,
  attempted,
  t,
  onChange,
  onBlur,
  onNext,
}: Step1ApplicantProps) {
  // Relation prefix & relative name state
  const initialRelation = splitRelation(formData.soWoDo);
  const [prefix, setPrefix] = useState<RelationPrefix>(initialRelation.prefix);
  const [relativeName, setRelativeName] = useState<string>(initialRelation.name);

  // Sync relation values when formData.soWoDo updates externally
  useEffect(() => {
    const current = splitRelation(formData.soWoDo);
    setPrefix(current.prefix);
    setRelativeName(current.name);
  }, [formData.soWoDo]);

  // Safe translation helper with English default
  const tr = (key: string, fallback: string): string => {
    if (typeof t !== 'function') return fallback;
    try {
      const val = t(key);
      return val && val !== key ? val : fallback;
    } catch {
      return fallback;
    }
  };

  // DOB date range: 18 to 100 years old
  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minDobDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  // DOB display formatter helpers: DD/MM/YYYY <-> YYYY-MM-DD
  const formatToDdMmYyyy = (input: string): string => {
    if (!input) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, d] = input.split('-');
      return `${d}/${m}/${y}`;
    }
    const digits = input.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const isoToDdMmYyyy = (iso: string): string => {
    if (!iso) return '';
    if (iso.includes('/')) return iso;
    const parts = iso.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  };

  const ddMmYyyyToIso = (display: string): string => {
    const parts = display.split('/');
    if (
      parts.length === 3 &&
      parts[0].length === 2 &&
      parts[1].length === 2 &&
      parts[2].length === 4
    ) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const [dobDisplay, setDobDisplay] = useState<string>(() => isoToDdMmYyyy(formData.dob));
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDobDisplay(isoToDdMmYyyy(formData.dob));
  }, [formData.dob]);

  const handleDobTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatToDdMmYyyy(e.target.value);
    setDobDisplay(formatted);
    const iso = ddMmYyyyToIso(formatted);
    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'dob',
        value: iso || formatted,
      },
    });
  };

  const handleDatePickerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      setDobDisplay(isoToDdMmYyyy(isoVal));
      onChange({
        ...e,
        target: {
          ...e.target,
          name: 'dob',
          value: isoVal,
        },
      });
    }
  };
  // Mobile number sanitizer: digits only, max 10
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'mobileNo',
        value: digitsOnly,
      },
    };
    onChange(syntheticEvent);
  };

  // Relation prefix/name emitter
  const emitRelationChange = (newPrefix: RelationPrefix, newName: string) => {
    const upperName = newName.toUpperCase();
    const formatted = upperName.trim() ? `${newPrefix} ${upperName}` : '';
    const syntheticEvent = {
      target: {
        name: 'soWoDo',
        value: formatted,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handlePrefixSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPrefix = e.target.value as RelationPrefix;
    setPrefix(nextPrefix);
    emitRelationChange(nextPrefix, relativeName);
  };

  const handleRelativeNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = e.target.value.toUpperCase();
    setRelativeName(nextName);
    emitRelationChange(prefix, nextName);
  };

  // Input styling helper
  const getInputClasses = (field: string) => {
    const hasError = Boolean(errors[field]);
    const isTouched = Boolean(touchedFields && touchedFields[field]);
    const isSuccess =
      (attempted || isTouched) && !hasError && Boolean(formData[field as keyof typeof formData]);

    return `w-full min-h-[44px] h-12 px-4 rounded-xl text-sm transition-all outline-hidden ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/30 text-red-950 dark:bg-red-950/20 dark:text-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : isSuccess
          ? 'border-2 border-emerald-500/70 bg-emerald-50/10 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 dark:border-emerald-500/50 dark:bg-emerald-950/10 dark:text-white'
          : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 dark:border-slate-700/80 dark:bg-[#0c101a] dark:text-white dark:hover:border-slate-600 dark:focus:border-brand-gold'
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          {tr('sectionPersonal', 'Applicant Personal Details')}
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          {tr('personalSubtitle', 'Basic information for your priority allotment certificate.')}
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* 1. First Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="firstName"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <User className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>First Name</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">
                (Given Name)
              </span>
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder={tr('firstNamePlaceholder', 'e.g. Rajesh')}
              value={formData.firstName}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className={`${getInputClasses('firstName')} pr-10 uppercase placeholder:normal-case`}
            />
            {Boolean(!errors.firstName && formData.firstName.trim().length >= 2) && (
              <CheckCircle2
                className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-500"
                aria-hidden="true"
              />
            )}
          </div>
          {errors.firstName && (
            <p
              id="firstName-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.firstName}</span>
            </p>
          )}
        </div>

        {/* 2. Last Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="lastName"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Last Name</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">
                (Family Name)
              </span>
            </span>
          </label>
          <div className="relative">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder={tr('lastNamePlaceholder', 'e.g. Sharma')}
              value={formData.lastName}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={errors.lastName ? 'true' : 'false'}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={`${getInputClasses('lastName')} pr-10 uppercase placeholder:normal-case`}
            />
            {Boolean(formData.lastName?.trim() && !errors.lastName) && (
              <CheckCircle2
                className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-500"
                aria-hidden="true"
              />
            )}
          </div>
          {errors.lastName && (
            <p
              id="lastName-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.lastName}</span>
            </p>
          )}
        </div>

        {/* 3. Mobile Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="mobileNo"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Phone className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>Mobile Number</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">(WhatsApp)</span>
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div
            className={`flex h-12 min-h-[44px] overflow-hidden rounded-xl transition-all ${
              errors.mobileNo
                ? 'border-2 border-red-500 bg-red-50/30 dark:bg-red-950/20'
                : !errors.mobileNo && formData.mobileNo.length === 10
                  ? 'border-2 border-emerald-500/70 bg-emerald-50/10 dark:border-emerald-500/50 dark:bg-emerald-950/10'
                  : 'focus-within:border-brand-gold focus-within:ring-brand-gold/25 border border-slate-200 bg-white focus-within:ring-2 dark:border-slate-700/80 dark:bg-[#0c101a]'
            }`}
          >
            <span className="inline-flex h-full items-center border-r border-slate-200 bg-slate-100 px-3.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
              🇮🇳 +91
            </span>
            <div className="relative flex-1">
              <input
                id="mobileNo"
                name="mobileNo"
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={formData.mobileNo}
                onChange={handleMobileChange}
                onBlur={onBlur}
                aria-invalid={errors.mobileNo ? 'true' : 'false'}
                aria-describedby={errors.mobileNo ? 'mobileNo-error' : undefined}
                className="h-full w-full bg-transparent px-4 pr-10 text-sm text-slate-900 outline-hidden dark:text-white"
              />
              {Boolean(!errors.mobileNo && formData.mobileNo.length === 10) && (
                <CheckCircle2
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-500"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
          {errors.mobileNo && (
            <p
              id="mobileNo-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.mobileNo}</span>
            </p>
          )}
        </div>

        {/* 4. Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>Email Address</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">
                (For Allotment Letter)
              </span>
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="rajesh.sharma@example.com"
              value={formData.email}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`${getInputClasses('email')} pr-10 lowercase`}
            />
            {Boolean(
              !errors.email && formData.email.includes('@') && formData.email.includes('.')
            ) && (
              <CheckCircle2
                className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-500"
                aria-hidden="true"
              />
            )}
          </div>
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* 5. Relation Prefix & Relative Name (soWoDo) */}
        <div className="space-y-1.5">
          <label
            htmlFor="soWoDo"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Users className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>Father / Husband / Guardian</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">(Care Of)</span>
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div
            className={`flex h-12 min-h-[44px] overflow-hidden rounded-xl transition-all ${
              errors.soWoDo
                ? 'border-2 border-red-500 bg-red-50/30 dark:bg-red-950/20'
                : !errors.soWoDo && relativeName.trim().length >= 2
                  ? 'border-2 border-emerald-500/70 bg-emerald-50/10 dark:border-emerald-500/50 dark:bg-emerald-950/10'
                  : 'focus-within:border-brand-gold focus-within:ring-brand-gold/25 border border-slate-200 bg-white focus-within:ring-2 dark:border-slate-700/80 dark:bg-[#0c101a]'
            }`}
          >
            <select
              id="relationPrefix"
              aria-label="Relationship prefix"
              value={prefix}
              onChange={handlePrefixSelect}
              className="h-full border-r border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700 outline-hidden transition-colors dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {RELATION_PREFIXES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                id="soWoDo"
                name="soWoDo"
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={relativeName}
                onChange={handleRelativeNameInput}
                onBlur={onBlur}
                aria-invalid={errors.soWoDo ? 'true' : 'false'}
                aria-describedby={errors.soWoDo ? 'soWoDo-error' : undefined}
                className="h-full w-full bg-transparent px-4 pr-10 text-sm text-slate-900 uppercase outline-hidden placeholder:normal-case dark:text-white"
              />
              {Boolean(!errors.soWoDo && relativeName.trim().length >= 2) && (
                <CheckCircle2
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-emerald-500"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
          {errors.soWoDo && (
            <p
              id="soWoDo-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.soWoDo}</span>
            </p>
          )}
        </div>

        {/* 6. Date of Birth */}
        <div className="space-y-1.5">
          <label
            htmlFor="dob"
            className="flex items-center text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>Date of Birth</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">
                (Date / Month / Year)
              </span>
              <span className="text-red-500">*</span>
            </span>
          </label>
          <div className="relative">
            <input
              id="dob"
              name="dob"
              type="text"
              inputMode="numeric"
              required
              autoComplete="bday"
              placeholder="DD/MM/YYYY (e.g. 14/09/1980)"
              maxLength={10}
              value={dobDisplay}
              onChange={handleDobTextChange}
              onBlur={onBlur}
              aria-invalid={errors.dob ? 'true' : 'false'}
              aria-describedby={errors.dob ? 'dob-error' : undefined}
              className={`${getInputClasses('dob')} pr-20 font-mono`}
            />

            {/* Quick Calendar Picker Trigger Button */}
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  try {
                    datePickerRef.current?.showPicker?.();
                  } catch {
                    datePickerRef.current?.focus();
                  }
                }}
                className="hover:text-brand-gold rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
                title="Choose from Calendar"
                aria-label="Choose from Calendar"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
              </button>

              {Boolean((attempted || touchedFields?.dob) && !errors.dob && formData.dob) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              )}
            </div>

            {/* Hidden native date picker input */}
            <input
              ref={datePickerRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              max={maxDobDate}
              min={minDobDate}
              value={ddMmYyyyToIso(dobDisplay) || (formData.dob?.includes('-') ? formData.dob : '')}
              onChange={handleDatePickerSelect}
              className="pointer-events-none sr-only absolute"
            />
          </div>
          {errors.dob && (
            <p
              id="dob-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.dob}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-200/80 pt-4 sm:flex-row dark:border-slate-800">
        <p className="text-center text-xs text-slate-400 sm:text-left dark:text-slate-500">
          🔒 All submitted details are securely encrypted for lottery allotment verification.
        </p>
        <button
          type="button"
          onClick={onNext}
          className="group bg-brand-gold text-brand-navy hover:shadow-brand-gold/25 inline-flex h-12 min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:bg-[#b8904d] active:scale-[0.98] sm:w-auto"
        >
          <span>Next: KYC &amp; Address</span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

export default Step1Applicant;
