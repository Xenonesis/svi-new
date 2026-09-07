'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LoginFormOtpProps {
  identifier: string;
  setIdentifier: (val: string) => void;
  identifierTouched: boolean;
  setIdentifierTouched: (val: boolean) => void;
  showIdentifierError: boolean;
  otpSent: boolean;
  otp: string;
  setOtp: (val: string) => void;
  otpTouched: boolean;
  setOtpTouched: (val: boolean) => void;
  showOtpError: boolean;
  isSubmitting: boolean;
  onSendOtp: () => void;
  onVerifyOtp: (e: React.FormEvent<HTMLFormElement>) => void;
  onResetOtp: () => void;
}

export function LoginFormOtp({
  identifier,
  setIdentifier,
  identifierTouched,
  setIdentifierTouched,
  showIdentifierError,
  otpSent,
  otp,
  setOtp,
  otpTouched,
  setOtpTouched,
  showOtpError,
  isSubmitting,
  onSendOtp,
  onVerifyOtp,
  onResetOtp,
}: LoginFormOtpProps) {
  const t = useTranslations('pages.login');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
            {t('emailLabel')}
          </label>
          {showIdentifierError && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-semibold text-red-500 dark:text-red-400"
            >
              {t('validation.emailInvalid')}
            </motion.span>
          )}
        </div>
        <input
          type="email"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (identifierTouched) setIdentifierTouched(false);
          }}
          onBlur={() => setIdentifierTouched(true)}
          placeholder={t('emailPlaceholder')}
          disabled={otpSent}
          className={`focus:border-brand-gold w-full border px-4 py-3 text-gray-900 transition-colors focus:outline-none disabled:opacity-60 ${
            showIdentifierError
              ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
              : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          }`}
        />
      </div>

      {!otpSent ? (
        <button
          type="button"
          onClick={onSendOtp}
          disabled={isSubmitting}
          className="text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-brand-navy flex w-full cursor-pointer items-center justify-center gap-2 border px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t('sendOtpButton')
          )}
        </button>
      ) : (
        <form onSubmit={onVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                {t('otpLabel')}
              </label>
              {showOtpError && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-semibold text-red-500 dark:text-red-400"
                >
                  {t('validation.otpDigits')}
                </motion.span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                if (otpTouched) setOtpTouched(false);
              }}
              onBlur={() => setOtpTouched(true)}
              placeholder={t('otpPlaceholder')}
              className={`focus:border-brand-gold w-full border px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 transition-colors focus:outline-none ${
                showOtpError
                  ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              }`}
            />
            <p className="text-center text-xs text-gray-500">
              {t('checkInbox', { email: identifier })}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || otp.length < 6}
            className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-60 dark:hover:bg-white"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                {t('verifyButton')} <ArrowRight size={16} />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onResetOtp}
            className="w-full cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('changeEmail')}
          </button>
        </form>
      )}
    </div>
  );
}
