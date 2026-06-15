'use client';

import { CheckCircle2 } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
}

const STEPS = [
  { step: 1, label: 'Details' },
  { step: 2, label: 'Participants' },
  { step: 3, label: 'Launch' },
];

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="mb-12">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-white/10" />
        <div
          className="bg-brand-gold absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(currentStep - 1) * 50}%` }}
        />
        {STEPS.map(({ step, label }) => (
          <div key={step} className="relative z-10 flex flex-col items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all duration-500 ${
                currentStep >= step
                  ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-[0_0_15px_rgba(212, 175, 55,0.4)]'
                  : 'dark:bg-brand-dark-surface border-slate-200 bg-white text-slate-400 dark:border-white/20 dark:text-gray-500'
              }`}
            >
              {currentStep > step ? <CheckCircle2 className="h-6 w-6" /> : step}
            </div>
            <span
              className={`text-[10px] font-bold tracking-widest uppercase ${
                currentStep >= step ? 'text-brand-gold' : 'text-slate-400 dark:text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
