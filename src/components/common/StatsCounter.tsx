'use client';

import { useTranslations } from 'next-intl';
import { memo, useEffect, useRef, useState } from 'react';

interface StatProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatItem = memo(function StatItem({ end, label, suffix = '', duration = 2000 }: StatProps) {
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const runAnimation = () => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  useEffect(() => {
    // Intersection Observer for desktop scroll trigger
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) runAnimation();
      },
      { threshold: 0.05, rootMargin: '0px' }
    );

    if (nodeRef.current) observer.observe(nodeRef.current);

    // Fallback: on mobile the section may already be visible on load —
    // fire after 400ms if not yet triggered by observer
    const fallback = setTimeout(() => {
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight) runAnimation();
      }
    }, 400);

    return () => {
      if (nodeRef.current) observer.unobserve(nodeRef.current);
      clearTimeout(fallback);
    };
  }, [end, duration]);

  return (
    <div ref={nodeRef} className="p-5 text-center md:p-8">
      <div className="text-brand-gold mb-3 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">
        {count}
        {suffix}
      </div>
      <div className="text-[10px] font-semibold tracking-[0.15em] text-gray-400 uppercase sm:text-xs">
        {label}
      </div>
    </div>
  );
});

export default function StatsCounter() {
  const t = useTranslations('stats');
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-2 gap-4 divide-white/10 md:grid-cols-4 md:gap-8 md:divide-x">
        <StatItem end={5000} suffix="+" label={t('propertiesSold')} />
        <StatItem end={5000} suffix="+" label={t('happyClients')} />
        <StatItem end={15} suffix="+" label={t('yearsExperience')} />
        <StatItem end={100} suffix="%" label={t('successRate')} />
      </div>
    </div>
  );
}
