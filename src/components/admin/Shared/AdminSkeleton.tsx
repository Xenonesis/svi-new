import { SkeletonBlock } from '@/src/components/ui/DynamicSkeleton';

export function StatCardSkeleton() {
  return (
    <div className="dark:bg-brand-dark-surface/50 animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-6 w-16 rounded bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-gray-100 px-6 py-4 dark:border-white/5"
        >
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-28" />
          <div className="ml-auto flex gap-1.5">
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
            <SkeletonBlock className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
