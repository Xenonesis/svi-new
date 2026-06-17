'use client';

import { AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { motion } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.08) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Field validation and touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const emailIsValid = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) : true;
  const passwordIsValid = password ? password.length >= 6 : true;

  const showEmailError = emailTouched && !emailIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setShake(true);
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setShake(true);
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.session) {
      setError(authError?.message || 'Login failed. Please verify your credentials.');
      setShake(true);
      setLoading(false);
      return;
    }

    // Verify admin role server-side via profile lookup
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setError('Access denied. This portal is for administrators only.');
      setShake(true);
      setLoading(false);
      return;
    }

    // Show premium success overlay stage
    setSuccess(true);

    // Wait a brief moment to ensure cookies are set, then navigate
    setTimeout(() => {
      router.replace('/admin/dashboard');
    }, 1800);
  };

  return (
    <div className="dark:bg-brand-dark-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-4 font-sans transition-colors duration-300">
      {/* Background glow & luxury accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-gold/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-[100px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-80 w-80 rounded-full blur-[100px]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
        transition={shake ? { duration: 0.5 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setShake(false)}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/75 relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-10 shadow-2xl backdrop-blur-xl transition-colors duration-300">
          {/* Subtle gold line on top of the card */}
          <div className="via-brand-gold/60 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

          {/* Success Stage Glassmorphism Overlay */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="dark:bg-brand-dark-surface/95 absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 p-10 text-center backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="bg-brand-gold/10 border-brand-gold/30 glow-gold mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
              >
                <ShieldCheck className="text-brand-gold h-10 w-10" />
              </motion.div>

              <h2 className="text-brand-navy mb-3 font-serif text-2xl font-semibold tracking-wide dark:text-white">
                Access Granted
              </h2>

              <p className="mb-8 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Welcome back, Administrator. Initializing your secure dashboard session...
              </p>

              {/* Luxury progress tracking bar */}
              <div className="relative h-1 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="via-brand-gold absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent to-transparent"
                />
              </div>
            </motion.div>
          )}

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-brand-gold/10 border-brand-gold/20 glow-gold flex h-16 w-16 items-center justify-center rounded-full border">
              <ShieldCheck className="text-brand-gold h-8 w-8" />
            </div>
          </div>

          <h1 className="text-brand-navy mb-2 text-center font-serif text-3xl tracking-tight transition-colors duration-300 dark:text-white">
            Admin{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block pr-2 italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              Portal
            </span>
          </h1>

          <div className="mb-8 flex justify-center">
            <span className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 inline-block rounded-sm border px-3.5 py-1.5 text-[9px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
              SVI Infra Solutions — Restricted Access
            </span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 transition-colors duration-300 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
                  Email Address
                </label>
                {showEmailError && (
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailTouched) setEmailTouched(false);
                }}
                onBlur={() => setEmailTouched(true)}
                required
                placeholder="admin@sviinfra.com"
                className={`w-full rounded-lg border px-4 py-3 font-sans text-sm transition-all focus:ring-2 focus:outline-none ${
                  showEmailError
                    ? 'border-red-500 bg-red-500/5 text-gray-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                    : 'focus:border-brand-gold focus:ring-brand-gold/20 border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#111118]/80 dark:text-white dark:placeholder-gray-600 dark:focus:bg-white/5'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-[0.15em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
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
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordTouched) setPasswordTouched(false);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-lg border px-4 py-3 pr-12 font-sans text-sm transition-all focus:ring-2 focus:outline-none ${
                    showPasswordError
                      ? 'border-red-500 bg-red-500/5 text-gray-900 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                      : 'focus:border-brand-gold focus:ring-brand-gold/20 border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-[#111118]/80 dark:text-white dark:placeholder-gray-600 dark:focus:bg-white/5'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="hover:text-brand-gold absolute inset-y-0 right-0 cursor-pointer px-4 text-gray-500 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-4 text-xs font-bold tracking-widest uppercase shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="border-brand-navy/40 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[9px] font-semibold tracking-[0.15em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-600">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
