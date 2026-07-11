'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface TimelineStepProps {
  icon: ReactNode;
  title: string;
  description: string;
  isEven: boolean;
}

export default function TimelineStep({ icon, title, description, isEven }: TimelineStepProps) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center">
      {/* Icon Marker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-brand-bg bg-brand-gold text-brand-navy dark:border-brand-dark-bg absolute left-8 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] md:left-1/2"
      >
        {icon}
      </motion.div>

      {/* Content Container */}
      <div
        className={`ml-16 w-full md:ml-0 md:w-1/2 ${
          isEven ? 'text-left md:pr-16 md:text-right' : 'text-left md:ml-auto md:pl-16'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: isEven ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-brand-navy/10 border bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
        >
          <h3 className="text-brand-gold mb-3 font-serif text-2xl">{title}</h3>
          <p className="leading-relaxed text-gray-600 dark:text-white/70">{description}</p>
        </motion.div>
      </div>
    </div>
  );
}
