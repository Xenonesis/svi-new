'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from '@/src/components/ui/AnimatedSection';

export default function CTASection() {
  const t = useTranslations('cta');
  return (
    <section
      className="bg-brand-bg dark:bg-brand-dark-bg relative overflow-hidden py-20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
      role="region"
      aria-label="Call to action"
    >
      <div className="bg-brand-gold/5 absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-brand-gold/5 absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl" />

      <AnimatedSection type="fadeUp" className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-brand-navy mb-6 font-serif text-2xl sm:mb-8 sm:text-3xl md:text-5xl dark:text-white">
          {t('title')}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl px-2 text-base leading-relaxed text-gray-600 md:mb-12 md:px-0 md:text-lg dark:text-gray-300">
          {t('subtitle')}
        </p>
        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/registration"
              className="bg-brand-gold text-brand-navy inline-block px-8 py-3.5 text-[11px] font-semibold tracking-wider uppercase shadow-lg transition-all hover:shadow-xl"
            >
              {t('registerNow')}
            </Link>
          </motion.div>
          <Link
            href="/contact"
            className="group text-brand-navy/80 hover:text-brand-navy flex items-center gap-2 transition-colors dark:text-white/90 dark:hover:text-white"
          >
            <span className="hover-underline-gold text-[10px] font-semibold tracking-wider uppercase">
              {t('contactUs')}
            </span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}
