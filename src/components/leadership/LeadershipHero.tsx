'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export function LeadershipHero(): React.JSX.Element {
  const t = useTranslations('pages.leadership');

  return (
    <section className="bg-brand-navy relative overflow-hidden py-14 text-center md:py-24">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Animated orbs */}
      <motion.div
        className="bg-brand-gold/10 absolute -top-20 -left-20 h-64 w-64 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="bg-brand-gold/10 absolute -right-20 -bottom-20 h-80 w-80 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <div className="relative z-10 container mx-auto px-4">
        <h1 className="animate-hero-h1 mb-6 font-serif text-3xl leading-tight text-white sm:text-4xl md:text-6xl">
          {t('title')}
        </h1>
        <div className="bg-brand-gold animate-hero-divider mx-auto mb-6 h-px w-16"></div>
        <p className="animate-hero-subtitle mx-auto max-w-2xl text-lg leading-relaxed text-gray-300">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}
