'use client';

import { type ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Base skeleton block with shimmer animation.
 */
export function SkeletonBlock({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
}

/**
 * Skeleton for a chat log card — matches the real card layout.
 */
export function ChatLogSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <SkeletonBlock className="mt-1 h-4 w-4 rounded" />

        {/* Avatar skeleton */}
        <SkeletonBlock className="h-8 w-8 rounded-full" />

        {/* Content skeleton */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-14 rounded-full" />
          </div>
          {/* Meta row */}
          <div className="mt-2 flex gap-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-12" />
            <SkeletonBlock className="h-3 w-12" />
          </div>
          {/* Preview row */}
          <div className="mt-3 space-y-1.5">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for stat cards.
 */
export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <SkeletonBlock className="h-10 w-10 rounded-lg" />
      <div className="space-y-1.5">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-5 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton for filter bar.
 */
export function FilterBarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-8 w-48 rounded-lg" />
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

interface DynamicSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Type of skeleton layout */
  type?: 'chat-log' | 'stat-cards' | 'full-page';
}

/**
 * Dynamic skeleton that adapts to show the right number of shimmering
 * placeholder cards matching the actual UI layout.
 */
export default function DynamicSkeleton({ count = 6, type = 'chat-log' }: DynamicSkeletonProps) {
  if (type === 'stat-cards') {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'full-page') {
    return (
      <div className="space-y-6">
        <StatCardSkeleton />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <FilterBarSkeleton />
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <ChatLogSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ChatLogSkeleton key={i} />
      ))}
    </div>
  );
}
