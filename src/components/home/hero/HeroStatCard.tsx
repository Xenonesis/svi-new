'use client';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export default function HeroStatCard() {
  const t = useTranslations('hero');

  return (
    <>
      {/* Asymmetric Floating Stat Card */}
      <motion.div
        className="animate-hero-5 absolute right-16 bottom-32 z-30 hidden lg:block"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <div className="group hover:border-brand-gold/50 border-brand-navy/10 relative max-w-[320px] border bg-white p-8 shadow-2xl transition-colors dark:border-white/20 dark:bg-[#0b0c10]">
          <h3 className="text-brand-gold mb-3 font-serif text-5xl leading-none">
            15<span className="text-3xl">+</span>
          </h3>
          <p className="text-brand-navy/70 text-sm leading-relaxed font-light dark:text-white/70">
            {t('statDescription')}
          </p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="animate-hero-5 absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
          {t('scroll')}
        </span>
        <div className="h-10 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </>
  );
}
