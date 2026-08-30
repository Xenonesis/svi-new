'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Send,
  Loader2,
  ArrowLeft,
  X,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

export default function EmployeeLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.role === 'employee' || profile?.role === 'admin') {
            router.replace('/employee/dashboard');
          }
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    }
    checkExistingSession();
  }, [router]);

  const identifierIsValid = identifier
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())
    : true;
  const passwordIsValid = password ? password.length >= 6 : true;

  const showIdentifierError = identifierTouched && !identifierIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIdentifierTouched(true);
    setPasswordTouched(true);

    const cleanIdentifier = identifier.trim().toLowerCase();

    if (!cleanIdentifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)) {
      setError('Please enter a valid work email address.');
      setShake(true);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }
        throw authError;
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user record found.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, department')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch warning on login:', profileError);
      }

      if (profile?.role === 'client') {
        await supabase.auth.signOut();
        throw new Error(
          'This portal is strictly reserved for SVI Infra Employees & Staff. Client accounts must log in via the Client Portal.'
        );
      }

      setSuccess(true);
      toast.success(`Welcome, ${profile?.full_name || 'Employee'}`);

      setTimeout(() => {
        router.replace('/employee/dashboard');
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-between bg-[#080b11] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] text-slate-100 antialiased">
      {/* Background Subtle Gradient & Micro-Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft Radial Ambient Vignette */}
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,rgba(8,11,17,0)_70%)]" />
        <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(8,11,17,0)_70%)]" />
        {/* Precise hairline grid */}
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          <HelpCircle size={14} />
          <span>Support & Access</span>
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
              <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-white/10">
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
                  className="text-[11px] font-medium text-amber-400/90 transition-colors hover:text-amber-300"
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
                  className={`w-full rounded-xl border bg-slate-900/60 py-2.5 pr-10 pl-10 font-mono text-sm text-white transition-colors placeholder:font-sans placeholder:text-slate-500 focus:outline-none ${
                    showPasswordError
                      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-300"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-3 text-xs font-bold tracking-wide text-slate-950 uppercase transition-all hover:bg-[#c59e26] active:scale-[0.99] disabled:opacity-50"
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
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Employee Support</h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs leading-relaxed text-slate-400">
                If you have forgotten your password or require a new account, please contact the SVI
                Administration or HR desk.
              </p>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium text-white">
                  <Building2 size={14} className="text-amber-400" />
                  <span>HR & Admin Desk</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Password resets are issued securely by system administrators.
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="flex-1 rounded-xl border border-slate-800 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800"
                >
                  Close
                </button>
                <a
                  href="https://wa.me/?text=Hello%20HR%20Admin,%20I%20need%20assistance%20with%20my%20SVI%20Employee%20Portal%20credentials."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Send size={13} />
                  <span>Contact HR</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
