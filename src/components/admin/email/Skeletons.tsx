'use client';

import { motion } from 'motion/react';

/* ─── Utility ─── */
function SkeletonPulse({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`rounded-lg bg-gray-200/80 dark:bg-gray-800/60 ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
    />
  );
}

/* ─── Email List Skeleton ─── */
export function EmailListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex items-start gap-3.5 px-5 py-4"
        >
          {/* Avatar skeleton */}
          <SkeletonPulse className="h-9 w-9 shrink-0 rounded-full" delay={i * 0.1} />

          <div className="min-w-0 flex-1 space-y-2">
            {/* Subject line */}
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-4 w-4 rounded" delay={i * 0.15} />
              <SkeletonPulse className="h-4 w-4/5" delay={i * 0.15} />
            </div>

            {/* Recipient */}
            <SkeletonPulse className="h-3 w-2/3" delay={i * 0.2} />

            {/* Meta info */}
            <div className="flex items-center gap-3 pt-1">
              <SkeletonPulse className="h-2.5 w-16" delay={i * 0.25} />
              <SkeletonPulse className="h-2.5 w-12" delay={i * 0.25} />
            </div>
          </div>

          {/* Action menu */}
          <SkeletonPulse className="h-3.5 w-3.5 shrink-0 rounded" delay={i * 0.3} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Email Detail Panel Skeleton ─── */
export function EmailDetailSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col border-l border-gray-100 lg:col-span-3 dark:border-gray-800"
    >
      {/* Header */}
      <div className="from-brand-gold/60 via-brand-gold to-brand-gold/60 h-[2px] w-full bg-gradient-to-r" />
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <SkeletonPulse className="h-3.5 w-3.5" />
          <div className="space-y-1">
            <SkeletonPulse className="h-3.5 w-24" />
            <SkeletonPulse className="h-2 w-32" />
          </div>
        </div>
        <SkeletonPulse className="h-4 w-4 rounded" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 p-6">
        {/* Subject */}
        <SkeletonPulse className="h-6 w-4/5" />

        {/* From/To fields */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <SkeletonPulse className="h-2.5 w-10" />
              <SkeletonPulse className={`h-3 ${i === 1 ? 'w-full' : 'w-4/5'}`} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <SkeletonPulse className="h-7 w-20 rounded-lg" />
          <SkeletonPulse className="h-7 w-20 rounded-lg" />
          <SkeletonPulse className="h-7 w-8 rounded-lg" />
        </div>

        {/* Body preview */}
        <div className="space-y-2">
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-5/6" />
          <SkeletonPulse className="h-3 w-4/5" />
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-3/4" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Compose Tab Skeleton ─── */
export function ComposeSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-[920px]"
    >
      <div className="dark:bg-brand-dark-surface rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-4 w-4" />
            <SkeletonPulse className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-3 w-16" />
            <SkeletonPulse className="h-5 w-5 rounded" />
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-0">
          <div className="flex items-center border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <SkeletonPulse className="h-3 w-12" />
            <SkeletonPulse className="h-4 flex-1" />
          </div>
          <div className="flex items-center border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <SkeletonPulse className="h-3 w-12" />
            <SkeletonPulse className="h-4 flex-1" />
          </div>
          <div className="flex items-center border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <SkeletonPulse className="h-3 w-12" />
            <SkeletonPulse className="h-4 flex-1" />
          </div>
        </div>

        {/* Editor */}
        <div className="h-[400px] border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="h-full space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-24 rounded-lg" />
            <SkeletonPulse className="h-8 w-24 rounded-lg" />
          </div>
          <SkeletonPulse className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Dashboard/Card Skeleton ─── */
export function DashboardCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="dark:bg-brand-dark-surface rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-3 w-2/3" />
          <SkeletonPulse className="h-2 w-16" />
        </div>
        <SkeletonPulse className="h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonPulse className="h-8 w-1/2" />
        <div className="h-1.5 w-full rounded-full">
          <SkeletonPulse className="h-1.5 w-3/4 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Deleted Email List Skeleton ─── */
export function DeletedEmailListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="flex items-start gap-2.5 px-4 py-3.5"
        >
          <SkeletonPulse className="h-5 w-5 shrink-0 rounded" delay={i * 0.1} />
          <SkeletonPulse className="h-9 w-9 shrink-0 rounded-full" delay={i * 0.15} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-3.5 w-3.5 rounded" delay={i * 0.2} />
              <SkeletonPulse className="h-4 w-4/5" delay={i * 0.2} />
            </div>
            <SkeletonPulse className="h-3 w-3/4" delay={i * 0.25} />
            <div className="flex items-center gap-3 pt-1">
              <SkeletonPulse className="h-2.5 w-20" delay={i * 0.3} />
              <SkeletonPulse className="h-2.5 w-16" delay={i * 0.3} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Filter Panel Skeleton ─── */
export function FilterPanelSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border-b border-gray-100 dark:border-gray-800"
    >
      <div className="space-y-3 px-4 py-3">
        {/* Status filter */}
        <div>
          <SkeletonPulse className="mb-2 h-3 w-16" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </div>

        {/* Date filter */}
        <div>
          <SkeletonPulse className="mb-2 h-3 w-20" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
