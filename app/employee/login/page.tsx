'use client';

import { motion } from 'motion/react';
import { UserCircle2, ArrowRight, AlertCircle, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { useTheme } from '@/src/components/ThemeProvider';

export default function EmployeeLogin() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation & touched states
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const identifierIsValid = identifier ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : true;
  const passwordIsValid = password ? password.length >= 6 : true;

  const showIdentifierError = identifierTouched && !identifierIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIdentifierTouched(true);
    setPasswordTouched(true);

    if (!identifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError('Please enter a valid email address.');
      setShake(true);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (authError) throw authError;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'employee') {
          // Not an employee, but logged in. Log them out or just show error.
          await supabase.auth.signOut();
          throw new Error('Access denied. Employee portal only.');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/employee/attendance');
        }, 1800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center pt-10 pb-20 dark:bg-gray-950">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 container mx-auto flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
          transition={shake ? { duration: 0.5 } : { duration: 0.6 }}
          onAnimationComplete={() => setShake(false)}
          className="relative w-full max-w-md overflow-hidden rounded-xl border bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Success Stage Glassmorphism Overlay */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 p-8 text-center backdrop-blur-xl dark:bg-gray-900/95"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="glow-gold mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:border-emerald-500/40"
              >
                <MapPin className="h-10 w-10 animate-pulse text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <h2 className="text-brand-navy mb-3 font-serif text-2xl font-semibold tracking-wide dark:text-white">
                Welcome Back
              </h2>

              <p className="mb-8 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Authentication successful. Loading your attendance portal...
              </p>

              {/* Luxury progress tracking bar */}
              <div className="relative h-1 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                />
              </div>
            </motion.div>
          )}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-emerald-600 dark:border-gray-600 dark:bg-gray-800 dark:text-emerald-400">
              <MapPin size={32} />
            </div>
            <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
              Employee Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log in to mark your daily attendance.
            </p>
          </div>

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

          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                  Registered Email
                </label>
                {showIdentifierError && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-semibold text-red-500 dark:text-red-400"
                  >
                    Invalid Email format
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
                placeholder="you@example.com"
                className={`focus:border-brand-gold w-full rounded-lg border px-4 py-3 text-gray-900 transition-colors focus:outline-none ${
                  showIdentifierError
                    ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                }`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                  Password
                </label>
                {showPasswordError && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-semibold text-red-500 dark:text-red-400"
                  >
                    At least 6 characters
                  </motion.span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordTouched) setPasswordTouched(false);
                }}
                onBlur={() => setPasswordTouched(true)}
                required
                placeholder="••••••••"
                className={`focus:border-brand-gold w-full rounded-lg border px-4 py-3 text-gray-900 transition-colors focus:outline-none ${
                  showPasswordError
                    ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 py-4 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  Log In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
