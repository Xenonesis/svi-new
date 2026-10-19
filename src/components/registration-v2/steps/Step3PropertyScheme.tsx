'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Ruler,
  Home,
  Compass,
  CreditCard,
  UserCheck,
  IndianRupee,
  Calculator,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { SchemeCalculatorV2 } from '../SchemeCalculatorV2';
import { calculateSchemeDetails } from '../schemeCalculator';
import { FALLBACK_ADVISORS, FALLBACK_PROJECTS } from '../useRegistrationV2';
import type { Step3PropertySchemeProps } from '../types';

export type { Step3PropertySchemeProps };

export const PROPERTY_SIZES = [
  { value: '50-100', label: '50-100 Sq. Yd', sqFt: '450 - 900 Sq. Ft', token: 11000 },
  { value: '100-200', label: '100-200 Sq. Yd', sqFt: '900 - 1,800 Sq. Ft', token: 21000 },
  { value: '200-400', label: '200-400 Sq. Yd', sqFt: '1,800 - 3,600 Sq. Ft', token: 31000 },
  { value: '400-700', label: '400-700 Sq. Yd', sqFt: '3,600 - 6,300 Sq. Ft', token: 51000 },
  { value: '700-1000', label: '700-1000 Sq. Yd', sqFt: '6,300 - 9,000 Sq. Ft', token: 75000 },
  { value: '1000-1500', label: '1000-1500 Sq. Yd', sqFt: '9,000 - 13,500 Sq. Ft', token: 100000 },
  { value: '1500-2000', label: '1500-2000 Sq. Yd', sqFt: '13,500 - 18,000 Sq. Ft', token: 150000 },
] as const;

export const PROPERTY_TYPES = [
  {
    value: 'residential-plot',
    label: 'Residential Plots',
    desc: 'Approved Gated Township Plots',
  },
  {
    value: 'commercial-shop',
    label: 'Commercial Units',
    desc: 'High-Footfall Commercial Shops & Retail',
  },
  {
    value: 'luxury-farm-house',
    label: 'Luxury Farm Houses',
    desc: 'Premium Countryside Farmhouse Estates',
  },
] as const;

export const PLOT_PREFERENCES = [
  {
    value: 'main-road',
    label: 'Main Road',
    desc: 'Wide boulevard & direct access',
  },
  {
    value: 'park',
    label: 'Park Facing',
    desc: 'Scenic green landscape & calm ambiance',
  },
  {
    value: 'corner',
    label: 'Corner Plot',
    desc: 'Dual open road frontage & extra ventilation',
  },
  {
    value: 'none',
    label: 'General',
    desc: 'Standard township layout plot',
  },
] as const;

export const PAYMENT_PLANS = [
  { value: 'one-time', label: 'Full Payment (Lump-sum)' },
  { value: '3-months', label: '3 Equal Monthly Installments' },
  { value: '6-months', label: '6 Equal Monthly Installments' },
  { value: '12-months', label: '12 Months Flexible Payment Plan' },
  { value: '18-months', label: '18 Months Extended Scheme' },
  { value: '24-months', label: '24 Months Milestone Plan' },
] as const;

export const PAYMENT_MODES = [
  { value: 'online', label: 'Online (UPI / Net Banking / Card)' },
  { value: 'cash', label: 'Cash at Office' },
  { value: 'net-banking', label: 'Bank Transfer (NEFT / RTGS)' },
] as const;

export function Step3PropertyScheme({
  formData,
  errors,
  touchedFields,
  attempted,
  t,
  onChange,
  onBlur,
  advisors,
  projects,
  onNext,
  onPrev,
}: Step3PropertySchemeProps) {
  // Mobile scheme breakdown toggle state
  const [showMobileCalculator, setShowMobileCalculator] = useState(false);

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

  // Safe fallbacks for options
  const projectList = projects && projects.length > 0 ? projects : FALLBACK_PROJECTS;
  const advisorList = advisors && advisors.length > 0 ? advisors : FALLBACK_ADVISORS;

  // Real-time scheme breakdown calculation
  const currentSchemeDetails = calculateSchemeDetails(
    formData.propertySize,
    formData.project,
    formData.paymentPlan
  );

  // Auto-sync scheme amount when propertySize changes or on mount if empty
  useEffect(() => {
    if (formData.propertySize && !formData.schemeAmount) {
      const details = calculateSchemeDetails(
        formData.propertySize,
        formData.project,
        formData.paymentPlan
      );
      const amountEvent = {
        target: {
          name: 'schemeAmount',
          value: String(details.tokenAmount),
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(amountEvent);
    }
  }, [
    formData.propertySize,
    formData.project,
    formData.paymentPlan,
    formData.schemeAmount,
    onChange,
  ]);

  // Size selection handler updating both propertySize and schemeAmount
  const handleSizeSelect = (sizeValue: string) => {
    const sizeEvent = {
      target: {
        name: 'propertySize',
        value: sizeValue,
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onChange(sizeEvent);

    const details = calculateSchemeDetails(sizeValue, formData.project, formData.paymentPlan);
    const amountEvent = {
      target: {
        name: 'schemeAmount',
        value: String(details.tokenAmount),
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(amountEvent);
  };

  // Generic radio/pill selection helper
  const handlePillSelect = (name: string, value: string) => {
    const syntheticEvent = {
      target: {
        name,
        value,
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  // Input styling helper
  const getInputClasses = (field: string) => {
    const hasError = Boolean(errors[field]);
    const isTouched = Boolean(touchedFields && touchedFields[field]);
    const isSuccess =
      (attempted || isTouched) && !hasError && Boolean(formData[field as keyof typeof formData]);

    return `w-full min-h-[44px] h-12 px-4 rounded-xl text-sm transition-all outline-hidden [color-scheme:light] dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-white ${
      hasError
        ? 'border-2 border-red-500 bg-red-50/30 text-red-950 dark:bg-red-950/20 dark:text-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : isSuccess
          ? 'border-2 border-emerald-500/70 bg-emerald-50/10 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 dark:border-emerald-500/50 dark:bg-emerald-950/10 dark:text-white'
          : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white dark:hover:border-slate-700'
    }`;
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Property Preferences & Scheme Selection (Plot ki Pasand)
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Apna manpasand township project, plot ka size aur payment plan chunein.
        </p>
      </div>

      {/* Mobile Scheme Calculator Accordion (Hidden on Desktop) */}
      <div className="block lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileCalculator(!showMobileCalculator)}
          aria-expanded={showMobileCalculator}
          className="border-brand-gold/40 flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-slate-900/90 px-4 py-3 text-left text-sm font-semibold text-white shadow-md backdrop-blur-md transition-all active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <Calculator className="text-brand-gold h-4 w-4" aria-hidden="true" />
            <span>
              {showMobileCalculator ? 'Hide Live Scheme Breakdown' : 'Show Live Scheme Breakdown'}
            </span>
          </span>
          <span className="text-brand-gold-light flex items-center gap-1 text-xs font-normal">
            <span>{showMobileCalculator ? 'Collapse' : 'Estimate'}</span>
            {showMobileCalculator ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </span>
        </button>

        {showMobileCalculator && (
          <div className="mt-3">
            <SchemeCalculatorV2
              size={formData.propertySize}
              project={formData.project}
              plan={formData.paymentPlan}
            />
          </div>
        )}
      </div>

      {/* Main Grid: Form Controls (Left) + Desktop Sticky Calculator (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form Fields */}
        <div className="space-y-6 lg:col-span-7">
          {/* Project Selection Dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="project"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>Select Preferred Project (Township Chunein)</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            <div className="relative">
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(errors.project)}
                aria-describedby={errors.project ? 'project-error' : undefined}
                className={getInputClasses('project')}
              >
                <option value="">{tr('projectPlaceholder', 'Choose a SVI Mega Township')}</option>
                {projectList.map((proj) => (
                  <option key={proj.value} value={proj.value}>
                    {proj.label}
                  </option>
                ))}
              </select>
            </div>

            {errors.project && (
              <p
                id="project-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.project}</span>
              </p>
            )}
          </div>

          {/* Property Size Selector (Visual Pills + Select) */}
          <div className="space-y-2">
            <label
              htmlFor="propertySize"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="sr-only">Property Size (Plot Area)</span>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                <Ruler className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>Property Size (Plot Area / Gaj)</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            {/* Visual Selector Pills */}
            <div
              role="radiogroup"
              aria-label="Plot dimension pills"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
            >
              {PROPERTY_SIZES.map((opt) => {
                const isSelected = formData.propertySize === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSizeSelect(opt.value)}
                    className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/15 ring-brand-gold/40 text-slate-900 shadow-[0_0_12px_rgba(212,175,55,0.2)] ring-1 dark:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold sm:text-sm">{opt.label}</span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {opt.sqFt}
                    </span>
                    <span
                      className={`mt-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-brand-gold/20 text-brand-gold dark:text-brand-gold'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      Token: ₹{opt.token.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Info className="text-brand-gold h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                Token booking fee is 100% adjustable against the final property allotment cost.
              </span>
            </div>
            {/* Visually hidden accessible select to retain screen-reader and automated test support */}
            <select
              id="propertySize"
              name="propertySize"
              value={formData.propertySize}
              onChange={(e) => handleSizeSelect(e.target.value)}
              onBlur={onBlur}
              aria-invalid={Boolean(errors.propertySize)}
              aria-describedby={errors.propertySize ? 'propertySize-error' : undefined}
              className="sr-only"
              tabIndex={-1}
            >
              <option value="">{tr('sizePlaceholder', 'Or select plot size from list')}</option>
              {PROPERTY_SIZES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (Token: ₹{opt.token.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
            {errors.propertySize && (
              <p
                id="propertySize-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.propertySize}</span>
              </p>
            )}
          </div>

          {/* Property Type (Visual Cards + Select) */}
          <div className="space-y-2">
            <label
              htmlFor="propertyType"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <Home className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>{tr('propertyType', 'Property Type')}</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            {/* Interactive Cards */}
            <div
              role="radiogroup"
              aria-label="Township category cards"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
            >
              {PROPERTY_TYPES.map((type) => {
                const isSelected = formData.propertyType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handlePillSelect('propertyType', type.value)}
                    className={`flex min-h-[44px] flex-col items-start justify-between rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/15 ring-brand-gold/40 text-slate-900 shadow-[0_0_12px_rgba(212,175,55,0.2)] ring-1 dark:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold sm:text-sm">{type.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="text-brand-gold h-3.5 w-3.5 shrink-0" />
                      )}
                    </div>
                    <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Visually hidden accessible select */}
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={onChange}
              aria-invalid={Boolean(errors.propertyType)}
              aria-describedby={errors.propertyType ? 'propertyType-error' : undefined}
              className="sr-only"
              tabIndex={-1}
            >
              <option value="">{tr('typePlaceholder', 'Select Property Type')}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {errors.propertyType && (
              <p
                id="propertyType-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.propertyType}</span>
              </p>
            )}
          </div>

          {/* Plot Preference (Visual Cards + Select) */}
          <div className="space-y-2">
            <label
              htmlFor="plotPreference"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>{tr('plotPreference', 'Plot Preference / Facing')}</span>
              </span>
            </label>

            {/* Interactive Cards - Spacious 2-Column Grid (Zero Truncation) */}
            <div
              role="radiogroup"
              aria-label="Facing orientation cards"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              {PLOT_PREFERENCES.map((pref) => {
                const isSelected = formData.plotPreference === pref.value;
                return (
                  <button
                    key={pref.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handlePillSelect('plotPreference', pref.value)}
                    className={`flex min-h-[54px] flex-col items-start justify-center rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/15 ring-brand-gold/40 text-slate-900 shadow-[0_0_12px_rgba(212,175,55,0.2)] ring-1 dark:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold sm:text-sm">{pref.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="text-brand-gold h-3.5 w-3.5 shrink-0" />
                      )}
                    </div>
                    <span className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {pref.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Visually hidden accessible select */}
            <select
              id="plotPreference"
              name="plotPreference"
              value={formData.plotPreference}
              onChange={onChange}
              aria-invalid={Boolean(errors.plotPreference)}
              aria-describedby={errors.plotPreference ? 'plotPreference-error' : undefined}
              className="sr-only"
              tabIndex={-1}
            >
              <option value="">{tr('preferencePlaceholder', 'Select Plot Preference')}</option>
              {PLOT_PREFERENCES.map((pref) => (
                <option key={pref.value} value={pref.value}>
                  {pref.label} ({pref.desc})
                </option>
              ))}
            </select>
            {errors.plotPreference && (
              <p
                id="plotPreference-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.plotPreference}</span>
              </p>
            )}
          </div>

          {/* Payment Plan & Payment Mode Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Payment Plan */}
            <div className="space-y-1.5">
              <label
                htmlFor="paymentPlan"
                className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <CreditCard className="text-brand-gold h-4 w-4" aria-hidden="true" />
                  <span>Select Payment Plan (Bhugtan Yojna)</span>
                  <span className="text-brand-gold" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>

              <select
                id="paymentPlan"
                name="paymentPlan"
                value={formData.paymentPlan}
                onChange={onChange}
                aria-invalid={Boolean(errors.paymentPlan)}
                aria-describedby={errors.paymentPlan ? 'paymentPlan-error' : undefined}
                className={getInputClasses('paymentPlan')}
              >
                <option value="">{tr('planPlaceholder', 'Choose Payment Plan')}</option>
                {PAYMENT_PLANS.map((plan) => (
                  <option key={plan.value} value={plan.value}>
                    {plan.label}
                  </option>
                ))}
              </select>

              {errors.paymentPlan && (
                <p
                  id="paymentPlan-error"
                  role="alert"
                  className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.paymentPlan}</span>
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div className="space-y-1.5">
              <label
                htmlFor="paymentMode"
                className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
              >
                <span className="flex items-center gap-1.5">
                  <CreditCard className="text-brand-gold h-4 w-4" aria-hidden="true" />
                  <span>Payment Mode (Bhugtan Madhyam)</span>
                  <span className="text-brand-gold" aria-hidden="true">
                    *
                  </span>
                </span>
              </label>

              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={onChange}
                aria-invalid={Boolean(errors.paymentMode)}
                aria-describedby={errors.paymentMode ? 'paymentMode-error' : undefined}
                className={getInputClasses('paymentMode')}
              >
                <option value="">{tr('modePlaceholder', 'Select Payment Mode')}</option>
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>

              {errors.paymentMode && (
                <p
                  id="paymentMode-error"
                  role="alert"
                  className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.paymentMode}</span>
                </p>
              )}
            </div>
          </div>

          {/* Assigned Advisor */}
          <div className="space-y-1.5">
            <label
              htmlFor="advisorName"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>{tr('advisorName', 'Assigned Property Advisor')} (SVI Representative)</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
            </label>

            <select
              id="advisorName"
              name="advisorName"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.advisorName)}
              aria-describedby={errors.advisorName ? 'advisorName-error' : undefined}
              value={formData.advisorName}
              onChange={onChange}
              onBlur={onBlur}
              className={getInputClasses('advisorName')}
            >
              <option value="">{tr('advisorPlaceholder', 'Select an Assigned Advisor')}</option>
              {advisorList.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
            {errors.advisorName && (
              <p
                id="advisorName-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.advisorName}</span>
              </p>
            )}
          </div>

          {/* Registration Token Amount Showcase Card */}
          <div className="space-y-2">
            <label
              htmlFor="schemeAmount"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <IndianRupee className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>Registration Token Fee (INR)</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
              <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold dark:text-brand-gold-light inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
                <ShieldCheck className="h-3 w-3" /> Priority Token
              </span>
            </label>

            {/* High-Impact Executive Token Fee Display Card */}
            <div className="border-brand-gold/40 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#080b11] via-[#111622] to-[#080b11] p-5 text-white shadow-xl">
              <div
                className="bg-brand-gold/15 pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl"
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Booking Token Amount
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      ₹
                      {Number(
                        formData.schemeAmount || currentSchemeDetails.tokenAmount
                      ).toLocaleString('en-IN')}
                    </span>
                    <span className="text-brand-gold text-xs font-semibold">INR</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      100% adjustable against total plot cost
                    </span>
                    <span className="hidden text-slate-600 sm:inline">•</span>
                    <span className="text-slate-400">Instant allotment queue priority</span>
                  </div>
                </div>

                <div className="w-full sm:w-56">
                  <span className="mb-1 block text-[11px] font-medium text-slate-400">
                    Confirmed Amount (₹)
                  </span>
                  <div className="relative">
                    <span className="text-brand-gold pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold">
                      ₹
                    </span>
                    <input
                      id="schemeAmount"
                      name="schemeAmount"
                      type="text"
                      value={formData.schemeAmount}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="e.g. 21000"
                      aria-invalid={Boolean(errors.schemeAmount)}
                      aria-describedby={
                        errors.schemeAmount ? 'schemeAmount-error' : 'schemeAmount-hint'
                      }
                      className="border-brand-gold/40 focus:border-brand-gold focus:ring-brand-gold/30 h-11 w-full rounded-xl border bg-slate-900/90 pr-3.5 pl-8 text-sm font-bold text-white outline-hidden transition-all focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p
              id="schemeAmount-hint"
              className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
            >
              <Info className="text-brand-gold h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                Standard priority token amount based on selected plot dimension (
                {formData.propertySize ? `${formData.propertySize} Sq. Yd` : '100-200 Sq. Yd'}).
              </span>
            </p>

            {errors.schemeAmount && (
              <p
                id="schemeAmount-error"
                role="alert"
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.schemeAmount}</span>
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{tr('prevStep', 'Back to KYC & Address')}</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="from-brand-gold via-brand-gold-light to-brand-gold shadow-brand-gold/20 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-8 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all hover:brightness-105 active:scale-[0.99]"
            >
              <span>{tr('nextStep', 'Next: Review & Confirm')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Live Scheme Breakdown (Desktop) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Live Scheme &amp; Token Breakdown
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Real-time Sync
              </span>
            </div>

            <SchemeCalculatorV2
              size={formData.propertySize}
              project={formData.project}
              plan={formData.paymentPlan}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step3PropertyScheme;
