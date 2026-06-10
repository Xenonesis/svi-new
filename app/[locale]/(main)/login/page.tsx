'use client';

import { motion } from 'motion/react';
import { UserCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { useTheme } from '@/src/components/ThemeProvider';

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation & touched states
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [otpTouched, setOtpTouched] = useState(false);
  const [shake, setShake] = useState(false);

  const identifierIsValid = identifier ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : true;
  const passwordIsValid = password ? password.length >= 6 : true;
  const otpIsValid = otp ? /^\d{6}$/.test(otp) : true;

  const showIdentifierError = identifierTouched && !identifierIsValid;
  const showPasswordError = passwordTouched && !passwordIsValid;
  const showOtpError = otpTouched && !otpIsValid;

  const handlePasswordLogin = async (e: FormEvent) => {
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

      setSuccess(true);
      setTimeout(() => {
        router.push('/payment'); // redirect to client portal after login
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setIdentifierTouched(true);

    if (!identifier || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      setError('Please enter a valid email address.');
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: identifier,
      });
      if (otpError) throw otpError;
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpTouched(true);

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit numeric OTP.');
      setShake(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: identifier,
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/payment');
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
      setShake(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-navy relative flex min-h-screen items-center justify-center pt-24 pb-20 dark:bg-gray-950">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 container mx-auto flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0], y: 0 } : { opacity: 1, y: 0 }}
          transition={shake ? { duration: 0.5 } : { duration: 0.6 }}
          onAnimationComplete={() => setShake(false)}
          className="relative w-full max-w-md overflow-hidden border bg-white p-8 shadow-2xl md:p-12 dark:border-gray-700 dark:bg-gray-900"
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
                className="bg-brand-gold/10 border-brand-gold/30 glow-gold dark:border-brand-gold/40 mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
              >
                <UserCircle2 className="text-brand-navy dark:text-brand-gold h-10 w-10 animate-pulse" />
              </motion.div>

              <h2 className="text-brand-navy mb-3 font-serif text-2xl font-semibold tracking-wide dark:text-white">
                Welcome Back
              </h2>

              <p className="mb-8 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Authentication successful. Initializing your client document portal...
              </p>

              {/* Luxury progress tracking bar */}
              <div className="relative h-1 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"
                />
              </div>
            </motion.div>
          )}

          <div className="mb-8 text-center">
            <div className="text-brand-navy dark:text-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <UserCircle2 size={32} />
            </div>
            <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
              Client Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log in to view your property documents and payment schedules.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setLoginMethod('password');
                setError('');
                setOtpSent(false);
                setIdentifierTouched(false);
                setPasswordTouched(false);
                setOtpTouched(false);
              }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${loginMethod === 'password' ? 'text-brand-navy dark:text-brand-gold border-brand-navy dark:border-brand-gold border-b-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setLoginMethod('otp');
                setError('');
                setOtpSent(false);
                setIdentifierTouched(false);
                setPasswordTouched(false);
                setOtpTouched(false);
              }}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase transition-colors ${loginMethod === 'otp' ? 'text-brand-navy dark:text-brand-gold border-brand-navy dark:border-brand-gold border-b-2' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              OTP Login
            </button>
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

          {loginMethod === 'password' ? (
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
                  className={`focus:border-brand-gold w-full border px-4 py-3 text-gray-900 transition-colors focus:outline-none ${
                    showPasswordError
                      ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                  }`}
                />
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
                    Log In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
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
                  placeholder="you@example.com"
                  disabled={otpSent}
                  className={`focus:border-brand-gold w-full border px-4 py-3 text-gray-900 transition-colors focus:outline-none disabled:opacity-60 ${
                    showIdentifierError
                      ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                  }`}
                />
              </div>

              {!otpSent ? (
                <>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    className="text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-brand-navy flex w-full cursor-pointer items-center justify-center gap-2 border px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-brand-navy text-[10px] font-bold tracking-widest uppercase dark:text-gray-300">
                        Enter OTP
                      </label>
                      {showOtpError && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] font-semibold text-red-500 dark:text-red-400"
                        >
                          Must be 6 digits
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
                      placeholder="6-digit code"
                      className={`focus:border-brand-gold w-full border px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 transition-colors focus:outline-none ${
                        showOtpError
                          ? 'border-red-500 bg-red-500/5 focus:ring-1 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/5 dark:text-white'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                      }`}
                    />
                    <p className="text-center text-xs text-gray-500">
                      Check your inbox at <span className="text-brand-gold">{identifier}</span>
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
                        Verify & Login <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setOtpTouched(false);
                    }}
                    className="w-full cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ← Change email
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/registration"
              className="text-brand-navy dark:text-brand-gold hover:text-brand-gold font-bold transition-colors dark:hover:text-white"
            >
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
