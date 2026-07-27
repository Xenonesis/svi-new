'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

interface StatConfig {
  end: number;
  suffix: string;
  label: string;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export default function StatsCounter() {
  const t = useTranslations('stats');

  const stats: StatConfig[] = [
    { end: 5000, suffix: '+', label: t('propertiesSold') },
    { end: 5000, suffix: '+', label: t('happyClients') },
    { end: 15, suffix: '+', label: t('yearsExperience') },
    { end: 100, suffix: '%', label: t('successRate') },
  ];

  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startValues = counts;
          const startTime = performance.now();

          function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);

            const next = stats.map((s) => Math.floor(eased * s.end));
            setCounts(next);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);

    // Fallback trigger for already-visible sections
    const fallback = setTimeout(() => {
      if (!hasAnimated.current && el.getBoundingClientRect().top < window.innerHeight) {
        hasAnimated.current = true;
        const startTime = performance.now();
        const duration = 2000;

        function animate(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOutQuart(progress);
          setCounts(stats.map((s) => Math.floor(eased * s.end)));
          if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
      }
    }, 400);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
    // Run once on mount
  }, []);

  return (
    <div ref={sectionRef} className="container mx-auto px-4 py-12 md:py-16">
      <div className="divide-brand-navy/10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 md:divide-x dark:divide-white/10">
        {stats.map((s, i) => (
          <div key={i} className="p-5 text-center md:p-8">
            <div className="text-brand-gold mb-3 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">
              {counts[i]}
              {s.suffix}
            </div>
            <div className="text-[10px] font-semibold tracking-[0.15em] text-gray-600 uppercase sm:text-xs dark:text-gray-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
