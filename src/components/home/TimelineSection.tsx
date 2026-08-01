'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'motion/react';
import { Map, Building, Ruler, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import TimelineStep from './TimelineStep';

const ICONS = [Map, Ruler, ShieldCheck, Building, CheckCircle2];

export default function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('timeline');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  // Static motion value for mobile — no JS scroll tracking needed
  const staticHeight = useMotionValue('100%');
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const steps = [
    { title: t('steps.landAcquisition.title'), desc: t('steps.landAcquisition.desc') },
    { title: t('steps.planningDesign.title'), desc: t('steps.planningDesign.desc') },
    { title: t('steps.approvalsRera.title'), desc: t('steps.approvalsRera.desc') },
    { title: t('steps.infrastructure.title'), desc: t('steps.infrastructure.desc') },
    { title: t('steps.delivery.title'), desc: t('steps.delivery.desc') },
  ];

  return (
    <section
      ref={containerRef}
      className="bg-brand-bg text-brand-navy dark:border-brand-gold/20 dark:bg-brand-dark-bg relative overflow-hidden border-b border-transparent py-14 sm:py-20 md:py-24 dark:text-white"
      role="region"
      aria-label="Development Timeline"
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="bg-brand-gold timeline-blob absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-brand-gold timeline-blob absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-10 text-center sm:mb-16 md:mb-20">
          <h4 className="text-brand-gold mb-3 text-xs font-semibold tracking-[0.2em] uppercase sm:mb-4 sm:text-sm md:text-base">
            {t('subtitle')}
          </h4>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl">{t('title')}</h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="bg-brand-navy/10 absolute top-0 bottom-0 left-8 w-[2px] md:left-1/2 md:-ml-[1px] dark:bg-white/10" />

          {/* On mobile: full-height static gold bar (no scroll tracking) */}
          {/* On desktop: scroll-driven animated gold bar */}
          <motion.div
            className="bg-brand-gold absolute top-0 left-8 w-[2px] md:left-1/2 md:-ml-[1px]"
            style={{ height: isMobile ? staticHeight : lineHeight, transformOrigin: 'top' }}
          />

          <div className="flex flex-col gap-12 md:gap-24">
            {steps.map((step, idx) => {
              const Icon = ICONS[idx];
              const isEven = idx % 2 === 0;
              return (
                <TimelineStep
                  key={idx}
                  icon={<Icon className="h-6 w-6" />}
                  title={step.title}
                  description={step.desc}
                  isEven={isEven}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
