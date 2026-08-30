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
  ArrowLeft,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useEmployeeLoginForm } from '@/src/components/employee/login/useEmployeeLoginForm';
import { EmployeeLoginHelpModal } from '@/src/components/employee/login/EmployeeLoginHelpModal';

export default function EmployeeLogin() {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    setError,
    success,
    showPassword,
    setShowPassword,
    showHelpModal,
    setShowHelpModal,
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
  } = useEmployeeLoginForm();

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-between bg-[#080b11] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] text-slate-100 antialiased">
      {/* Background Subtle Gradient & Micro-Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,rgba(8,11,17,0)_70%)]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(8,11,17,0)_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Website</span>
        </Link>

        <button
          onClick={() => setShowHelpModal(true)}
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          <HelpCircle size={14} />
          <span>Support &amp; Access</span>
        </button>
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 items-center justify-center px-4 py-8">
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

            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Employee Portal
            </h1>
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
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="cursor-pointer text-[11px] font-medium text-amber-400/90 transition-colors hover:text-amber-300"
                >
                  Forgot password?
                </button>
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
      </main>

      {/* Subtle Corporate Footer */}
      <footer className="relative z-10 py-5 text-center text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} SVI Infra Solutions Pvt. Ltd. All rights reserved.</p>
      </footer>

      {/* Clean Support Modal */}
      <EmployeeLoginHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
