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
  Sparkles,
  Info,
} from 'lucide-react';
import { SchemeCalculatorV2 } from '../SchemeCalculatorV2';
import { calculateSchemeDetails } from '../schemeCalculator';
import { FALLBACK_ADVISORS, FALLBACK_PROJECTS } from '../useRegistrationV2';
import type { Step3PropertySchemeProps } from '../types';

export type { Step3PropertySchemeProps };

export const PROPERTY_SIZES = [
  { value: '50-100', label: '50-100 Sq. Yd', token: 11000 },
  { value: '100-200', label: '100-200 Sq. Yd', token: 21000 },
  { value: '200-400', label: '200-400 Sq. Yd', token: 31000 },
  { value: '400-700', label: '400-700 Sq. Yd', token: 51000 },
  { value: '700-1000', label: '700-1000 Sq. Yd', token: 75000 },
  { value: '1000-1500', label: '1000-1500 Sq. Yd', token: 100000 },
  { value: '1500-2000', label: '1500-2000 Sq. Yd', token: 150000 },
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
  attempted,
  t,
  onChange,
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
    <div className="space-y-8">
      {/* Step Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          {tr('sectionProperty', 'Property Preferences & Scheme Selection')}
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          {tr(
            'propertySubtitle',
            'Select your preferred township project, plot dimension, and payment schedule'
          )}
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
                <span>{tr('selectProjects', 'Select Preferred Project')}</span>
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
              <span className="flex items-center gap-1.5">
                <Ruler className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>{tr('propertySize', 'Property Size (Plot Area)')}</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Token adjustable against cost
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
                    className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/15 ring-brand-gold/40 dark:text-brand-gold-light text-slate-900 shadow-[0_0_12px_rgba(212,175,55,0.2)] ring-1'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold sm:text-sm">{opt.label}</span>
                    <span
                      className={`mt-0.5 text-[10px] font-medium ${
                        isSelected
                          ? 'text-brand-gold dark:text-brand-gold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Token: ₹{opt.token.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Select Dropdown Fallback for standard form accessibility */}
            <div className="pt-1">
              <select
                id="propertySize"
                name="propertySize"
                value={formData.propertySize}
                onChange={(e) => handleSizeSelect(e.target.value)}
                aria-invalid={Boolean(errors.propertySize)}
                aria-describedby={errors.propertySize ? 'propertySize-error' : undefined}
                className={getInputClasses('propertySize')}
              >
                <option value="">{tr('sizePlaceholder', 'Or select plot size from list')}</option>
                {PROPERTY_SIZES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (Token: ₹{opt.token.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

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

            {/* Select Dropdown Fallback */}
            <div className="pt-1">
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={onChange}
                aria-invalid={Boolean(errors.propertyType)}
                aria-describedby={errors.propertyType ? 'propertyType-error' : undefined}
                className={getInputClasses('propertyType')}
              >
                <option value="">{tr('typePlaceholder', 'Select Property Type')}</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

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

            {/* Interactive Cards */}
            <div
              role="radiogroup"
              aria-label="Facing orientation cards"
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
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
                    className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/15 ring-brand-gold/40 text-slate-900 shadow-[0_0_12px_rgba(212,175,55,0.2)] ring-1 dark:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{pref.label}</span>
                    <span className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                      {pref.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Select Dropdown Fallback */}
            <div className="pt-1">
              <select
                id="plotPreference"
                name="plotPreference"
                value={formData.plotPreference}
                onChange={onChange}
                aria-invalid={Boolean(errors.plotPreference)}
                aria-describedby={errors.plotPreference ? 'plotPreference-error' : undefined}
                className={getInputClasses('plotPreference')}
              >
                <option value="">{tr('preferencePlaceholder', 'Select Plot Preference')}</option>
                {PLOT_PREFERENCES.map((pref) => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label} ({pref.desc})
                  </option>
                ))}
              </select>
            </div>

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
                  <span>{tr('paymentPlan', 'Payment Plan')}</span>
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
                  <span>{tr('paymentMode', 'Payment Mode')}</span>
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
                <span>{tr('advisorName', 'Assigned Property Advisor')}</span>
              </span>
            </label>

            <select
              id="advisorName"
              name="advisorName"
              value={formData.advisorName}
              onChange={onChange}
              className={getInputClasses('advisorName')}
            >
              <option value="">{tr('advisorPlaceholder', 'Select an Advisor (Optional)')}</option>
              {advisorList.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Token Amount (schemeAmount) */}
          <div className="space-y-1.5">
            <label
              htmlFor="schemeAmount"
              className="flex items-center justify-between text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300"
            >
              <span className="flex items-center gap-1.5">
                <IndianRupee className="text-brand-gold h-4 w-4" aria-hidden="true" />
                <span>{tr('schemeAmount', 'Registration Token Fee (INR)')}</span>
                <span className="text-brand-gold" aria-hidden="true">
                  *
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" /> Auto-computed
              </span>
            </label>

            <div className="relative">
              <input
                id="schemeAmount"
                name="schemeAmount"
                type="text"
                value={formData.schemeAmount}
                onChange={onChange}
                placeholder={tr('schemeAmountPlaceholder', 'Enter or confirm token amount')}
                aria-invalid={Boolean(errors.schemeAmount)}
                aria-describedby={errors.schemeAmount ? 'schemeAmount-error' : 'schemeAmount-hint'}
                className={getInputClasses('schemeAmount')}
              />
            </div>

            <p
              id="schemeAmount-hint"
              className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400"
            >
              <Info className="text-brand-gold h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {tr('schemeAmountHint', 'Standard token amount based on selected plot dimension')}
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
