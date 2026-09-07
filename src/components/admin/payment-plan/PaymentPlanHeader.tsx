import React from 'react';
import { PaymentPlanHeaderProps } from './types';

export function PaymentPlanHeader({ className = '' }: PaymentPlanHeaderProps) {
  return (
    <div className={`mb-6 flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
          Payment <span className="text-brand-gold italic">Plan Generator</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate and download structured payment plans and EMIs.
        </p>
      </div>
    </div>
  );
}
