'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface BrandedLoadingStateProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  className?: string;
}

export function BrandedLoadingState({
  message = 'Synchronizing SVI Workspace...',
  subMessage = 'Securing connection & verifying credentials',
  fullScreen = false,
  className,
}: BrandedLoadingStateProps) {
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
        {/* Soft Ambient Gold Glow */}
        <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 blur-3xl dark:from-amber-500/25 dark:via-orange-500/15" />

        {/* Precision Orbital System Container */}
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          {/* 1. Static Circular Guide Track */}
          <div className="absolute inset-0 rounded-full border border-amber-500/15 dark:border-amber-400/20" />

          {/* 2. Counter-Rotating Inner Dashed Orbit */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-dashed border-amber-500/25 dark:border-amber-400/30"
          />

          {/* 3. Primary High-Precision Vector Gold Spinner with Glowing Tip */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
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
                <filter id="sviGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Seamless Sweeping Arc */}
              <circle
                cx="50"
                cy="50"
                r="49"
                stroke="url(#sviGoldGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="95 215"
              />

              {/* Glowing Leading Satellite Node */}
              <circle cx="99" cy="50" r="2.8" fill="#fef3c7" filter="url(#sviGlow)" />
            </svg>
          </motion.div>

          {/* 4. Central SVI Emblem Badge */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0.9 }}
            animate={{ scale: [0.96, 1.02, 0.96], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/35 bg-white p-2 shadow-2xl shadow-amber-500/15 sm:h-20 sm:w-20 dark:border-amber-400/40 dark:bg-white"
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
          </motion.div>
        </div>

        {/* Corporate Status Information */}
        <div className="mt-7 flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
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

          {/* Precision Micro Progress Shimmer Line */}
          <div className="relative mt-4 h-1 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="absolute inset-y-0 -left-full w-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
