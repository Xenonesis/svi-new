'use client';

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import type { AdminLoginState } from './useAdminLogin';

export interface AdminLoginFormProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPass: boolean;
  setShowPass: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string;
  success: boolean;
  emailTouched: boolean;
  setEmailTouched: React.Dispatch<React.SetStateAction<boolean>>;
  passwordTouched: boolean;
  setPasswordTouched: React.Dispatch<React.SetStateAction<boolean>>;
  showEmailError: boolean;
  showPasswordError: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function AdminLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPass,
  setShowPass,
  loading,
  error,
  success,
  emailTouched,
  setEmailTouched,
  passwordTouched,
  setPasswordTouched,
  showEmailError,
  showPasswordError,
  handleSubmit,
}: AdminLoginFormProps) {
  return (
    <>
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
              className={`w-full rounded-lg border px-4 py-3 pr-12 font-sans text-sm transition-all focus:ring-2 focus:outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden ${
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
            <>
              <Loader2 className="text-brand-navy h-4 w-4 shrink-0 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[9px] font-semibold tracking-[0.15em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-600">
        Authorized Personnel Only
      </p>
    </>
  );
}
