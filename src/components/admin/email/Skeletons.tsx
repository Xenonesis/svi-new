'use client';

function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-800/60 ${className}`} />
  );
}

export function EmailListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3.5 px-5 py-4">
          <SkeletonPulse className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-3 w-1/2" />
            <div className="flex gap-3 pt-1">
              <SkeletonPulse className="h-2.5 w-16" />
              <SkeletonPulse className="h-2.5 w-12" />
            </div>
          </div>
          <SkeletonPulse className="h-3.5 w-3.5 shrink-0 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200/80 bg-white p-5 dark:border-gray-700/60 dark:bg-[#0e0e14]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-2/3" />
              <SkeletonPulse className="h-3 w-full" />
            </div>
            <SkeletonPulse className="h-6 w-16 rounded-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SkeletonPulse className="h-12 rounded-lg" />
            <SkeletonPulse className="h-12 rounded-lg" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
