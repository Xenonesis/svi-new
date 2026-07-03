'use client';

import { useComparisonStore } from '@/src/stores/comparisonStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Building2 } from 'lucide-react';
import Image from 'next/image';

export default function PropertyComparisonTray() {
  const { compareList, setOpen, removeFromCompare, clearCompare } = useComparisonStore();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 bottom-20 left-4 z-40 mx-auto max-w-4xl md:bottom-6"
      >
        <div className="border-brand-gold/20 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white/90 p-4 shadow-2xl backdrop-blur-md md:flex-row md:px-6 dark:border-gray-800 dark:bg-gray-900/90">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 text-brand-gold hidden h-10 w-10 items-center justify-center rounded-full md:flex">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-brand-navy text-sm font-semibold dark:text-white">
                Comparing Properties
              </p>
              <p className="text-xs text-gray-500">{compareList.length} of 3 selected</p>
            </div>
          </div>

          {/* List of properties being compared */}
          <div className="flex flex-wrap justify-center gap-3">
            {compareList.map((project) => (
              <div
                key={project.id}
                className="border-gray-150 relative flex items-center gap-2 rounded-xl border bg-gray-50/50 py-1.5 pr-8 pl-2 dark:border-gray-800 dark:bg-gray-800/50"
              >
                <div className="relative h-7 w-10 overflow-hidden rounded">
                  <Image src={project.img} alt={project.title} fill className="object-cover" />
                </div>
                <span className="text-brand-navy max-w-[100px] truncate text-xs font-semibold dark:text-gray-200">
                  {project.title}
                </span>
                <button
                  onClick={() => removeFromCompare(project.id)}
                  className="absolute top-1/2 right-1.5 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex w-full items-center justify-between gap-3 md:w-auto">
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Clear All
            </button>
            <button
              onClick={() => setOpen(true)}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex flex-1 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold tracking-wider uppercase shadow-md transition-all hover:scale-105 md:flex-initial"
            >
              Compare Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
