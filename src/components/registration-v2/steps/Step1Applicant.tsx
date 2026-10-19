'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, User, Phone, Mail, Calendar, Users } from 'lucide-react';
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
  attempted,
  t,
  onChange,
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
    const isSuccess = attempted && !hasError && Boolean(formData[field as keyof typeof formData]);

    return `w-full min-h-[44px] h-12 px-4 rounded-xl text-sm transition-all outline-hidden ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/30 text-red-950 dark:bg-red-950/20 dark:text-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : isSuccess
          ? 'border border-emerald-500/60 bg-white text-slate-900 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 dark:border-emerald-500/40 dark:bg-slate-900 dark:text-white'
          : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:hover:border-slate-700'
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
          {tr(
            'personalSubtitle',
            'Please provide your official legal identity as registered on your Government ID documents.'
          )}
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* 1. First Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="firstName"
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <User className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>{tr('firstName', 'First Name')}</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">min 2 chars</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            placeholder={tr('firstNamePlaceholder', 'ENTER FIRST NAME')}
            value={formData.firstName}
            onChange={onChange}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            className={`${getInputClasses('firstName')} uppercase`}
          />
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
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>{tr('lastName', 'Last Name')}</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">optional</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={tr('lastNamePlaceholder', 'ENTER LAST NAME')}
            value={formData.lastName}
            onChange={onChange}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className={`${getInputClasses('lastName')} uppercase`}
          />
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
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Phone className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>{tr('mobileNo', 'Mobile Number')}</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">10 digits</span>
          </label>
          <div className="relative flex rounded-xl">
            <span className="inline-flex h-12 min-h-[44px] items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
              🇮🇳 +91
            </span>
            <input
              id="mobileNo"
              name="mobileNo"
              type="tel"
              required
              maxLength={10}
              autoComplete="tel-national"
              placeholder={tr('mobilePlaceholder', '9876543210')}
              value={formData.mobileNo}
              onChange={handleMobileChange}
              aria-invalid={errors.mobileNo ? 'true' : 'false'}
              aria-describedby={errors.mobileNo ? 'mobileNo-error' : undefined}
              className={`${getInputClasses('mobileNo')} rounded-l-none`}
            />
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
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>{tr('email', 'Email Address')}</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">
              for allotment letter
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={tr('emailPlaceholder', 'NAME@EXAMPLE.COM')}
            value={formData.email}
            onChange={onChange}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${getInputClasses('email')} uppercase`}
          />
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
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Users className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>{tr('soWoDo', 'Father / Husband / Guardian')}</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">S/O, W/O, D/O</span>
          </label>
          <div className="flex overflow-hidden rounded-xl">
            <select
              id="relationPrefix"
              aria-label="Relationship prefix"
              value={prefix}
              onChange={handlePrefixSelect}
              className="focus:border-brand-gold h-12 min-h-[44px] rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700 transition-colors focus:outline-hidden dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {RELATION_PREFIXES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              id="soWoDo"
              name="soWoDo"
              type="text"
              required
              placeholder={tr('soWoDoPlaceholder', "ENTER RELATIVE'S FULL NAME")}
              value={relativeName}
              onChange={handleRelativeNameInput}
              aria-invalid={errors.soWoDo ? 'true' : 'false'}
              aria-describedby={errors.soWoDo ? 'soWoDo-error' : undefined}
              className={`${getInputClasses('soWoDo')} rounded-l-none uppercase`}
            />
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
            className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="text-brand-gold h-3.5 w-3.5" aria-hidden="true" />
              <span>{tr('dob', 'Date of Birth')}</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">18+ years</span>
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            required
            autoComplete="bday"
            max={maxDobDate}
            min={minDobDate}
            value={formData.dob}
            onChange={onChange}
            aria-invalid={errors.dob ? 'true' : 'false'}
            aria-describedby={errors.dob ? 'dob-error' : undefined}
            className={getInputClasses('dob')}
          />
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
