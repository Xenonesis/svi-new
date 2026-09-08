'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Check, RotateCw, Zap, AlertTriangle } from 'lucide-react';

export interface VerificationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface BrandedLoadingStateProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  className?: string;
  steps?: VerificationStep[];
  status?: 'loading' | 'success' | 'timeout' | 'error';
  onRetry?: () => void;
  onOfflineFallback?: () => void;
}

export function BrandedLoadingState({
  message = 'Synchronizing SVI Workspace...',
  subMessage = 'Securing connection & verifying credentials',
  fullScreen = false,
  className,
  steps,
  status = 'loading',
  onRetry,
  onOfflineFallback,
}: BrandedLoadingStateProps) {
  const isSuccess = status === 'success';
  const isTimeout = status === 'timeout';
  const isError = status === 'error';

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center select-none',
        fullScreen
          ? 'fixed inset-0 z-50 min-h-screen bg-slate-950 text-white'
          : 'min-h-[48vh] w-full py-12 text-slate-900 dark:text-white',
        className
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Radial Glow */}
        <div
          className={clsx(
            'pointer-events-none absolute -inset-6 rounded-full blur-3xl transition-colors duration-700',
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-emerald-500/25'
              : isTimeout || isError
                ? 'bg-gradient-to-r from-rose-500/20 via-amber-500/15 to-rose-500/20'
                : 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 dark:from-amber-500/25 dark:via-orange-500/15'
          )}
        />

        {/* Precision Orbital System Container */}
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          {/* 1. Static Circular Guide Track */}
          <div
            className={clsx(
              'absolute inset-0 rounded-full border transition-colors duration-500',
              isSuccess
                ? 'border-emerald-500/30'
                : isTimeout || isError
                  ? 'border-rose-500/25'
                  : 'border-amber-500/15 dark:border-amber-400/20'
            )}
          />

          {/* 2. Counter-Rotating Inner Dashed Orbit */}
          <motion.div
            animate={isSuccess ? { rotate: 0 } : { rotate: -360 }}
            transition={
              isSuccess ? { duration: 0.5 } : { duration: 8, repeat: Infinity, ease: 'linear' }
            }
            className={clsx(
              'absolute inset-2 rounded-full border border-dashed transition-colors duration-500',
              isSuccess
                ? 'border-emerald-500/40 opacity-40'
                : isTimeout || isError
                  ? 'border-rose-500/30 opacity-60'
                  : 'border-amber-500/25 dark:border-amber-400/30'
            )}
          />

          {/* 3. Primary High-Precision Vector Spinner with Morphing Capabilities */}
          <motion.div
            animate={isSuccess ? { rotate: 0 } : isTimeout ? { rotate: 0 } : { rotate: 360 }}
            transition={
              isSuccess || isTimeout
                ? { duration: 0.4 }
                : { duration: 2.2, repeat: Infinity, ease: 'linear' }
            }
            className="absolute inset-0 h-full w-full will-change-transform"
          >
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sviGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="50%" stopColor="#d98b40" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#d98b40" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="sviSuccessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                </linearGradient>
                <filter id="sviGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Seamless Sweeping Arc (Morphs into solid ring on success) */}
              <motion.circle
                cx="50"
                cy="50"
                r="49"
                stroke={
                  isSuccess
                    ? 'url(#sviSuccessGradient)'
                    : isTimeout
                      ? '#f43f5e'
                      : 'url(#sviGoldGradient)'
                }
                strokeWidth={isSuccess ? '3' : '2.5'}
                strokeLinecap="round"
                initial={false}
                animate={{
                  strokeDasharray: isSuccess ? '308 0' : isTimeout ? '60 250' : '95 215',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Leading Satellite Node (Hides on complete success ring) */}
              {!isSuccess && (
                <circle
                  cx={isTimeout ? '50' : '99'}
                  cy={isTimeout ? '1' : '50'}
                  r="2.8"
                  fill={isTimeout ? '#fda4af' : '#fef3c7'}
                  filter="url(#sviGlow)"
                />
              )}
            </svg>
          </motion.div>

          {/* 4. Central SVI Emblem Badge */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0.9 }}
            animate={
              isSuccess
                ? { scale: [1, 1.06, 1], opacity: 1 }
                : { scale: [0.96, 1.02, 0.96], opacity: [0.9, 1, 0.9] }
            }
            transition={
              isSuccess ? { duration: 0.4 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
            className={clsx(
              'relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl transition-colors duration-500 sm:h-20 sm:w-20',
              isSuccess
                ? 'border-2 border-emerald-500 ring-4 shadow-emerald-500/25 ring-emerald-500/15'
                : isTimeout || isError
                  ? 'border-2 border-rose-500/60 shadow-rose-500/15'
                  : 'border border-amber-500/35 shadow-amber-500/15 dark:border-amber-400/40'
            )}
          >
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions"
              width={282}
              height={83}
              quality={100}
              priority
              className="h-auto w-full object-contain"
            />

            {/* Success Checkmark Badge Morph */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white dark:ring-slate-950"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeout Warning Badge */}
            <AnimatePresence>
              {isTimeout && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg ring-2 ring-white dark:ring-slate-950"
                >
                  <AlertTriangle size={13} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dynamic Verification Step Indicator Strip */}
        {steps && steps.length > 0 && (
          <div className="mt-5 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 shadow-xs backdrop-blur-md sm:gap-2 dark:border-slate-800/80 dark:bg-slate-900/80">
            {steps.map((step, idx) => (
              <div key={step.id || idx} className="flex items-center gap-1.5">
                <div
                  className={clsx(
                    'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-all duration-300',
                    step.status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : step.status === 'in_progress'
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                  )}
                >
                  {step.status === 'completed' ? (
                    <Check size={10} strokeWidth={3} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-[10.5px] transition-colors',
                    step.status === 'completed'
                      ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                      : step.status === 'in_progress'
                        ? 'font-bold text-amber-600 dark:text-amber-300'
                        : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <span className="h-0.5 w-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Corporate Status Information */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={clsx(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  isSuccess
                    ? 'bg-emerald-400'
                    : isTimeout
                      ? 'animate-ping bg-rose-400'
                      : 'animate-ping bg-amber-400'
                )}
              />
              <span
                className={clsx(
                  'relative inline-flex h-2 w-2 rounded-full',
                  isSuccess ? 'bg-emerald-500' : isTimeout ? 'bg-rose-500' : 'bg-amber-500'
                )}
              />
            </span>
            <p className="text-xs font-black tracking-widest text-slate-800 uppercase sm:text-sm dark:text-slate-100">
              {message}
            </p>
          </div>

          {subMessage && (
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {subMessage}
            </p>
          )}

          {/* Micro Progress Shimmer Line (Hidden on success) */}
          {!isSuccess && (
            <div className="relative mt-4 h-1 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={clsx(
                  'absolute inset-y-0 -left-full w-full',
                  isTimeout
                    ? 'bg-rose-500'
                    : 'animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-amber-500 to-transparent'
                )}
              />
            </div>
          )}

          {/* Timeout Action Buttons */}
          {isTimeout && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-2.5"
            >
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-500 shadow-xs transition hover:bg-amber-500/20 active:scale-95 dark:text-amber-400"
                >
                  <RotateCw size={13} />
                  <span>Retry Location</span>
                </button>
              )}
              {onOfflineFallback && (
                <button
                  type="button"
                  onClick={onOfflineFallback}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Zap size={13} className="text-amber-500" />
                  <span>Punch in Offline Mode</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
