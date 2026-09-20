'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useEmployeeLoginForm } from '@/src/components/employee/login/useEmployeeLoginForm';

export interface EmployeeLoginFormState {
  identifier: string;
  setIdentifier: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  success: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  identifierTouched: boolean;
  setIdentifierTouched: (value: boolean) => void;
  passwordTouched: boolean;
  setPasswordTouched: (value: boolean) => void;
  shake: boolean;
  setShake: (value: boolean) => void;
  isSubmitting: boolean;
  showIdentifierError: boolean;
  showPasswordError: boolean;
  handlePasswordLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export interface EmployeeLoginFormProps extends Partial<EmployeeLoginFormState> {
  onOpenHelp?: () => void;
  onOpenHelpModal?: () => void;
  onForgotPassword?: () => void;
}

interface EmployeeLoginFormContentProps extends EmployeeLoginFormState {
  onOpenHelp?: () => void;
  onOpenHelpModal?: () => void;
  onForgotPassword?: () => void;
}

function EmployeeLoginFormContent({
  identifier,
  setIdentifier,
  password,
  setPassword,
  error,
  setError,
  success,
  showPassword,
  setShowPassword,
  identifierTouched,
  setIdentifierTouched,
  passwordTouched,
  setPasswordTouched,
  shake,
  setShake,
  isSubmitting,
  showIdentifierError,
  showPasswordError,
  handlePasswordLogin,
  onOpenHelp,
  onOpenHelpModal,
  onForgotPassword,
}: EmployeeLoginFormContentProps) {
  const handleHelp = onForgotPassword ?? onOpenHelpModal ?? onOpenHelp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={shake ? { x: [0, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
      transition={shake ? { duration: 0.35 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => setShake(false)}
      className="relative w-full rounded-2xl border border-slate-800/80 bg-[#0d121c]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-9"
    >
      {/* Success Stage Overlay */}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-[#0d121c] p-8 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-lg font-semibold text-white">Authentication Verified</h2>
          <p className="mt-1 text-xs text-slate-400">Opening employee workspace...</p>
          <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              className="h-full w-full bg-amber-400"
            />
          </div>
        </motion.div>
      )}

      {/* Clean Corporate Brand Header */}
      <div className="mb-8 text-center">
        <div className="mb-5 inline-flex items-center justify-center">
          <div className="rounded-xl bg-white p-2.5 shadow-xs ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions"
              width={240}
              height={70}
              quality={100}
              priority
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Employee Portal</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Enter your corporate credentials to access workspace.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="emp-email" className="block text-xs font-medium text-slate-300">
            Work Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Mail size={15} />
            </div>
            <input
              id="emp-email"
              type="email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (identifierTouched) setIdentifierTouched(false);
                if (error) setError('');
              }}
              onBlur={() => setIdentifierTouched(true)}
              required
              placeholder="employee@sviinfra.com"
              autoComplete="email"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pr-3.5 pl-10 text-sm text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                showIdentifierError
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                  : 'border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20'
              }`}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="emp-password" className="block text-xs font-medium text-slate-300">
              Password
            </label>
            {handleHelp && (
              <button
                type="button"
                onClick={handleHelp}
                className="cursor-pointer text-[11px] font-medium text-amber-400/90 transition-colors hover:text-amber-300"
              >
                Forgot password?
              </button>
            )}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Lock size={15} />
            </div>
            <input
              id="emp-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordTouched) setPasswordTouched(false);
                if (error) setError('');
              }}
              onBlur={() => setPasswordTouched(true)}
              required
              placeholder="••••••••••••"
              autoComplete="current-password"
              className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pr-10 pl-10 font-mono text-sm text-white transition-colors placeholder:font-sans placeholder:text-slate-500 focus:outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden ${
                showPasswordError
                  ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                  : 'border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-slate-500 transition-colors hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3 text-xs font-bold tracking-wide text-slate-950 uppercase transition-all hover:bg-[#c59e26] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-950" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bottom Clean Divider & Links */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Need account access?</span>
          <Link
            href="/admin"
            className="font-medium text-slate-300 transition-colors hover:text-amber-400"
          >
            Admin Portal →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function isFullFormState(
  props?: EmployeeLoginFormProps
): props is EmployeeLoginFormProps & EmployeeLoginFormState {
  return (
    props !== undefined &&
    typeof props.handlePasswordLogin === 'function' &&
    typeof props.identifier === 'string' &&
    typeof props.password === 'string'
  );
}

function EmployeeLoginFormWithHook(props: EmployeeLoginFormProps) {
  const form = useEmployeeLoginForm();
  return <EmployeeLoginFormContent {...form} {...props} />;
}

export function EmployeeLoginForm(props?: EmployeeLoginFormProps) {
  if (isFullFormState(props)) {
    return <EmployeeLoginFormContent {...props} />;
  }
  return <EmployeeLoginFormWithHook {...(props ?? {})} />;
}
