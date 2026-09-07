'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { UserCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useLoginForm,
  LoginMethodTabs,
  LoginFormPassword,
  LoginFormOtp,
  LoginSuccessCard,
} from '@/src/components/auth';

export default function Login() {
  const t = useTranslations('pages.login');
  const {
    isSubmitting,
    loginMethod,
    switchMethod,
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    otpSent,
    otp,
    setOtp,
    resetOtp,
    success,
    identifierTouched,
    setIdentifierTouched,
    passwordTouched,
    setPasswordTouched,
    otpTouched,
    setOtpTouched,
    shake,
    setShake,
    showIdentifierError,
    showPasswordError,
    showOtpError,
    handlePasswordLogin,
    handleSendOtp,
    handleOtpVerify,
  } = useLoginForm();

  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center pt-24 pb-20 dark:bg-gray-950">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 container mx-auto flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
          transition={shake ? { duration: 0.5 } : { duration: 0.6 }}
          onAnimationComplete={() => setShake(false)}
          className="relative w-full max-w-md overflow-hidden border bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Success Stage Glassmorphism Overlay */}
          {success && <LoginSuccessCard />}

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="text-brand-navy dark:text-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <UserCircle2 size={32} />
            </div>
            <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('tagline')}</p>
          </div>

          {/* Tab switcher */}
          <LoginMethodTabs loginMethod={loginMethod} onSelectMethod={switchMethod} />

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Active Form */}
          {loginMethod === 'password' ? (
            <LoginFormPassword
              identifier={identifier}
              setIdentifier={setIdentifier}
              identifierTouched={identifierTouched}
              setIdentifierTouched={setIdentifierTouched}
              showIdentifierError={showIdentifierError}
              password={password}
              setPassword={setPassword}
              passwordTouched={passwordTouched}
              setPasswordTouched={setPasswordTouched}
              showPasswordError={showPasswordError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
              onSubmit={handlePasswordLogin}
              onForgotPassword={() => switchMethod('otp')}
            />
          ) : (
            <LoginFormOtp
              identifier={identifier}
              setIdentifier={setIdentifier}
              identifierTouched={identifierTouched}
              setIdentifierTouched={setIdentifierTouched}
              showIdentifierError={showIdentifierError}
              otpSent={otpSent}
              otp={otp}
              setOtp={setOtp}
              otpTouched={otpTouched}
              setOtpTouched={setOtpTouched}
              showOtpError={showOtpError}
              isSubmitting={isSubmitting}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleOtpVerify}
              onResetOtp={resetOtp}
            />
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('noAccount')}{' '}
            <Link
              href="/registration"
              className="text-brand-navy dark:text-brand-gold hover:text-brand-gold font-bold transition-colors dark:hover:text-white"
            >
              {t('registerLink')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
