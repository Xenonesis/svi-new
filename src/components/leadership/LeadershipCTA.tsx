'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LeadershipCTA(): React.JSX.Element {
  const t = useTranslations('pages.leadership');

  return (
    <section className="border-t border-gray-200 bg-gray-100 py-16 md:py-20 dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-brand-navy mb-6 font-serif text-3xl md:text-4xl dark:text-gray-100">
            {t('joinTeamTitle')}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t('joinTeamDesc')}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/careers"
              className="bg-brand-navy hover:bg-brand-gold hover:text-brand-navy inline-flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors"
            >
              {t('viewPositions')} <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
