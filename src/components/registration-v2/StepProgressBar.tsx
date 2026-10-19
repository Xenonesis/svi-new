'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { RegistrationV2Step, StepProgressBarProps } from './types';

export type { StepProgressBarProps };

export interface StepConfig {
  step: RegistrationV2Step;
  title: string;
  subtitle: string;
  shortLabel: string;
}

export const REGISTRATION_STEPS: readonly StepConfig[] = [
  {
    step: 1,
    title: 'Applicant',
    subtitle: 'Personal Details',
    shortLabel: 'Applicant',
  },
  {
    step: 2,
    title: 'KYC & Address',
    subtitle: 'Identity & Proof',
    shortLabel: 'KYC',
  },
  {
    step: 3,
    title: 'Property & Scheme',
    subtitle: 'Unit & Plot',
    shortLabel: 'Property',
  },
  {
    step: 4,
    title: 'Review & Pay',
    subtitle: 'Confirm & Token',
    shortLabel: 'Review',
  },
] as const;

export function StepProgressBar({ currentStep, onSelectStep }: StepProgressBarProps) {
  const currentStepConfig =
    REGISTRATION_STEPS.find((s) => s.step === currentStep) || REGISTRATION_STEPS[0];

  const progressPercent = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (REGISTRATION_STEPS.length - 1)) * 100)
  );

  return (
    <div className="w-full">
      <nav aria-label="Registration Progress" className="relative">
        {/* Connecting Progress Bar Track */}
        <div
          className="absolute top-5 right-6 left-6 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 sm:top-6 sm:right-8 sm:left-8 dark:bg-slate-800"
          aria-hidden="true"
        >
          <div
            className="bg-brand-gold h-full rounded-full shadow-[0_0_10px_rgba(212,175,55,0.6)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Nodes */}
        <ol className="relative z-10 flex items-start justify-between">
          {REGISTRATION_STEPS.map(({ step, title, subtitle, shortLabel }) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isUpcoming = step > currentStep;

            return (
              <li key={step} className="flex flex-1 flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => onSelectStep?.(step)}
                  disabled={!onSelectStep}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${step}: ${title}${
                    isCompleted ? ' (Completed)' : isCurrent ? ' (Current Step)' : ' (Upcoming)'
                  }`}
                  className={`group focus:ring-brand-gold/60 relative flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full text-sm font-bold transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-hidden sm:h-12 sm:w-12 dark:focus:ring-offset-slate-900 ${
                    onSelectStep ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isCompleted
                      ? 'border-brand-gold bg-brand-gold text-brand-navy border-2 shadow-md hover:scale-105'
                      : isCurrent
                        ? 'border-brand-gold bg-brand-navy text-brand-gold ring-brand-gold/30 border-2 font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.45)] ring-4 dark:bg-slate-950'
                        : 'border-2 border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.8]" aria-hidden="true" />
                  ) : (
                    <span>{step}</span>
                  )}
                </button>

                {/* Step Title & Subtitle for Tablet & Desktop */}
                <div className="mt-2 hidden sm:flex sm:flex-col sm:items-center">
                  <span
                    className={`text-xs font-bold tracking-wide transition-colors ${
                      isCurrent
                        ? 'text-brand-gold dark:text-brand-gold'
                        : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {title}
                  </span>
                  <span className="hidden text-[10px] text-slate-400 md:block dark:text-slate-500">
                    {subtitle}
                  </span>
                </div>

                {/* Compact Step Title for Mobile */}
                <span
                  className={`mt-1.5 line-clamp-1 block max-w-[72px] px-1 text-center text-[10px] font-semibold transition-colors sm:hidden ${
                    isCurrent
                      ? 'text-brand-gold font-bold'
                      : isCompleted
                        ? 'text-slate-800 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {shortLabel}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Active Step Indicator Pill */}
      <div className="mt-3 flex justify-center sm:hidden" aria-hidden="true">
        <span className="bg-brand-gold/10 text-brand-gold border-brand-gold/25 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-xs">
          Step {currentStep} of {REGISTRATION_STEPS.length}: {currentStepConfig.title}
        </span>
      </div>
    </div>
  );
}

export default StepProgressBar;
