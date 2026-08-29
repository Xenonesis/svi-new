'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { clsx } from 'clsx';

export interface TouchCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
}

export function TouchCard({
  children,
  interactive = false,
  bordered = true,
  className,
  onClick,
  ...props
}: TouchCardProps) {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={clsx(
        'relative rounded-2xl bg-white p-4 transition-all duration-200 dark:bg-[#14151a]',
        bordered && 'border border-gray-200/80 dark:border-white/10',
        interactive &&
          'hover:border-brand-gold/40 active:border-brand-gold/60 cursor-pointer hover:shadow-md',
        'touch-manipulation',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
