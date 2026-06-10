'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

export default function BlogHero() {
  const t = useTranslations('pages.blog');

  return (
    <section className="from-brand-navy via-brand-navy to-brand-navy/80 relative overflow-hidden bg-gradient-to-br py-24 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/80">
      {/* Animated gradient orbs */}
      <motion.div
        className="bg-brand-gold/10 absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="bg-brand-gold/5 absolute -right-24 -bottom-24 h-80 w-80 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-1.5 text-[11px] font-semibold tracking-widest uppercase backdrop-blur-sm"
        >
          <span className="bg-brand-gold h-1.5 w-1.5 animate-pulse rounded-full" />
          {t('title')}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-6 max-w-3xl font-serif text-4xl leading-tight text-white md:text-6xl"
        >
          {t('heading')}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="from-brand-gold mx-auto mb-6 h-px w-24 bg-gradient-to-r to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300/90 md:text-lg"
        >
          {t('subtitle') ||
            'Stay informed with the latest market trends, investment guides, and updates from SVI Infra Solutions.'}
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex items-center justify-center gap-8"
        >
          {[
            { num: '3', label: t('stats.articles') || 'Articles' },
            { num: '5+', label: t('stats.mins') || 'Min Reads' },
            { num: '100%', label: t('stats.free') || 'Free' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-brand-gold font-serif text-2xl font-bold">{s.num}</div>
              <div className="mt-0.5 text-[10px] tracking-wider text-gray-400 uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
