import { motion } from 'motion/react';

export default function ProjectCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex h-full flex-col overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Image Skeleton */}
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        <div className="absolute top-4 right-4 z-20 h-6 w-24 animate-pulse bg-gray-300 shadow-sm dark:bg-gray-600" />
      </div>

      {/* Content Skeleton */}
      <div className="z-20 flex flex-grow flex-col bg-white p-8 dark:bg-gray-800">
        {/* Location & Type */}
        <div className="mb-4 flex flex-col gap-2">
          <div className="h-3 w-32 animate-pulse bg-gray-200 dark:bg-gray-700" />
          <div className="bg-brand-gold/40 h-3 w-24 animate-pulse" />
        </div>

        {/* Title */}
        <div className="mb-4 h-8 w-3/4 animate-pulse bg-gray-200 dark:bg-gray-700" />

        {/* Description lines */}
        <div className="mb-8 flex flex-grow flex-col gap-2">
          <div className="h-4 w-full animate-pulse bg-gray-100 dark:bg-gray-700/50" />
          <div className="h-4 w-full animate-pulse bg-gray-100 dark:bg-gray-700/50" />
          <div className="h-4 w-2/3 animate-pulse bg-gray-100 dark:bg-gray-700/50" />
        </div>

        {/* View Details button */}
        <div className="bg-brand-gold/30 mb-6 h-4 w-28 animate-pulse" />

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-700">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="bg-brand-gold/40 h-3 w-20 animate-pulse" />
          </div>
          <div className="h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </motion.div>
  );
}
