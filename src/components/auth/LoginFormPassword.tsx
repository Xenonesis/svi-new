'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LoginFormPasswordProps {
  identifier: string;
  setIdentifier: (val: string) => void;
  identifierTouched: boolean;
  setIdentifierTouched: (val: boolean) => void;
  showIdentifierError: boolean;
  password: string;
  setPassword: (val: string) => void;
  passwordTouched: boolean;
  setPasswordTouched: (val: boolean) => void;
  showPasswordError: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword?: () => void;
}

export function LoginFormPassword({
  identifier,
  setIdentifier,
  identifierTouched,
  setIdentifierTouched,
  showIdentifierError,
  password,
  setPassword,
  passwordTouched,
  setPasswordTouched,
  showPasswordError,
  showPassword,
  setShowPassword,
  isSubmitting,
  onSubmit,
  onForgotPassword,
}: LoginFormPasswordProps) {
  const t = useTranslations('pages.login');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          required
          placeholder={t('emailPlaceholder')}
          className={`focus:border-brand-gold w-full border px-4 py-3 text-gray-900 transition-colors focus:outline-none ${
            showIdentifierError
              ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
              : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          }`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
            {t('passwordLabel')}
          </label>
          {showPasswordError ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-semibold text-red-500 dark:text-red-400"
            >
              {t('validation.passwordMin')}
            </motion.span>
          ) : onForgotPassword ? (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-brand-gold hover:text-brand-navy cursor-pointer text-[10px] font-semibold tracking-wider uppercase transition-colors dark:hover:text-white"
            >
              Forgot password?
            </button>
          ) : null}
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordTouched) setPasswordTouched(false);
            }}
            onBlur={() => setPasswordTouched(true)}
            required
            placeholder={t('passwordPlaceholder')}
            className={`focus:border-brand-gold w-full border px-4 py-3 pr-10 text-gray-900 transition-colors focus:outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden ${
              showPasswordError
                ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand-navy dark:bg-brand-gold dark:text-brand-navy hover:bg-brand-gold hover:text-brand-navy flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors disabled:opacity-50 dark:hover:bg-white"
      >
        {isSubmitting ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {t('loginButton')} <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
