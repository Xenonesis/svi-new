'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { LoginMethod } from './useLoginForm';

interface LoginMethodTabsProps {
  loginMethod: LoginMethod;
  onSelectMethod: (method: LoginMethod) => void;
}

export function LoginMethodTabs({ loginMethod, onSelectMethod }: LoginMethodTabsProps) {
  const t = useTranslations('pages.login');

  return (
    <div className="mb-8 flex border-b border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => onSelectMethod('password')}
        className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${
          loginMethod === 'password'
            ? 'border-brand-navy text-brand-navy dark:text-brand-gold dark:border-brand-gold border-b-2'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        {t('passwordTab')}
      </button>
      <button
        type="button"
        onClick={() => onSelectMethod('otp')}
        className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${
          loginMethod === 'otp'
            ? 'border-brand-navy text-brand-navy dark:text-brand-gold dark:border-brand-gold border-b-2'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        {t('otpTab')}
      </button>
    </div>
  );
}
