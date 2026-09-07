'use client';

import React from 'react';
import { motion } from 'motion/react';
import { UserCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function LoginSuccessCard() {
  const t = useTranslations('pages.login');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 p-8 text-center backdrop-blur-xl dark:bg-gray-900/95"
    >
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="bg-brand-gold/10 border-brand-gold/30 glow-gold dark:border-brand-gold/40 mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
      >
        <UserCircle2 className="text-brand-navy dark:text-brand-gold h-10 w-10 animate-pulse" />
      </motion.div>

      <h2 className="text-brand-navy mb-3 font-serif text-2xl font-semibold tracking-wide dark:text-white">
        {t('welcomeBack')}
      </h2>

      <p className="mb-8 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {t('authSuccess')}
      </p>

      {/* Luxury progress tracking bar */}
      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <motion.div
          initial={{ left: '-100%' }}
          animate={{ left: '100%' }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          className="via-brand-gold absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent to-transparent"
        />
      </div>
    </motion.div>
  );
}
