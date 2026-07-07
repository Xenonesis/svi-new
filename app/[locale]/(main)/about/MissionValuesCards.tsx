'use client';

import { motion } from 'motion/react';
import { Target, Heart, Lightbulb, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MissionValuesCards() {
  const t = useTranslations('pages.about');

  const VALUES = [
    { icon: <Target />, title: t('integrity'), desc: t('integrityDesc') },
    { icon: <Heart />, title: t('customerCentricity'), desc: t('customerCentricityDesc') },
    { icon: <Lightbulb />, title: t('innovation'), desc: t('innovationDesc') },
    { icon: <Award />, title: t('excellence'), desc: t('excellenceDesc') },
  ];

  return (
    <section className="text-brand-navy dark:bg-brand-dark-surface/30 relative bg-gray-50/50 py-16 md:py-24 dark:text-white">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-[0.03] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 text-center">
          <h4 className="text-brand-gold mb-4 text-xs font-bold tracking-[0.3em] uppercase">
            {t('corePrinciples')}
          </h4>
          <h2 className="text-brand-navy mb-8 font-serif text-4xl dark:text-white">
            {t('missionValues')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px', amount: 0.05 }}
              transition={{ delay: idx * 0.08 }}
              className="hover:border-brand-gold dark:border-brand-dark-border dark:bg-brand-dark-bg/60 border border-gray-200/80 bg-white p-6 text-center transition-colors sm:p-8 md:p-10"
            >
              <div className="bg-brand-gold/10 text-brand-gold mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full">
                {val.icon}
              </div>
              <h3 className="text-brand-navy mb-4 font-serif text-xl dark:text-gray-100">
                {val.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
