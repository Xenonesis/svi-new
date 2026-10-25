'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BackToTop() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className="bg-brand-navy dark:bg-brand-gold text-brand-gold dark:text-brand-navy fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 md:right-8 md:bottom-56 md:h-12 md:w-12"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      aria-label={t('common.backToTop')}
    >
      <ArrowUp size={20} />
    </button>
  );
}
