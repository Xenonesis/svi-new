'use client';

import React from 'react';
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
        {/* Outer Radiant Ambient Glows */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 blur-2xl dark:from-amber-500/25 dark:via-orange-500/15" />

        {/* Pulsing Orbital Halo */}
        <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
          {/* Rotating Dotted / Gradient Ring */}
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-transparent border-t-[#d98b40] border-r-[#d98b40]/40" />
          <div className="absolute inset-1 animate-[spin_6s_linear_infinite_reverse] rounded-full border border-dashed border-amber-500/20" />

          {/* Central Logo Emblem Badge */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: [0.95, 1.02, 0.95], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-white p-2 shadow-xl ring-4 shadow-amber-500/10 ring-amber-500/10 sm:h-20 sm:w-20 dark:border-amber-500/40 dark:bg-white"
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

        {/* Corporate Typography & Status Information */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
            <p className="text-xs font-black tracking-widest text-slate-800 uppercase sm:text-sm dark:text-slate-200">
              {message}
            </p>
          </div>

          {subMessage && (
            <p className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {subMessage}
            </p>
          )}

          {/* Precision Micro Progress Shimmer Line */}
          <div className="relative mt-4 h-1 w-36 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="absolute inset-y-0 -left-full w-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
