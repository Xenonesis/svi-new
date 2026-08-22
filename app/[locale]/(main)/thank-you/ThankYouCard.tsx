'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ThankYouCard({
  registered = false,
  queued = false,
}: {
  registered?: boolean;
  queued?: boolean;
}) {
  const t = useTranslations('pages.thankYou');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className="mx-auto max-w-2xl border border-gray-200 bg-white p-16 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center border shadow-sm ${queued ? 'border-blue-400 text-blue-500' : 'border-brand-gold text-brand-gold'}`}
      >
        <CheckCircle size={40} />
      </motion.div>

      <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
        {queued ? t('queuedBadge') : t('completeBadge')}
      </h4>
      <h1 className="text-brand-navy mb-6 font-serif text-4xl md:text-5xl dark:text-gray-100">
        {t('heading')}
      </h1>
      {queued ? (
        <p className="mb-12 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          {t('queuedDescription')}
        </p>
      ) : (
        <p className="mb-12 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          {t('completedDescription')}
        </p>
      )}

      <Link
        href="/"
        className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex inline-flex w-full items-center justify-center gap-3 border px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors sm:w-auto"
      >
        <Home size={16} />
        {t('backToHome')}
      </Link>
    </motion.div>
  );
}
