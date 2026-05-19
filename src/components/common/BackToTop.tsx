'use client';

import { useCallback, useEffect, useState } from 'react';

import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  // const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '400px';
    sentinel.style.left = '0';
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(([entry]) => setIsVisible(!entry.isIntersecting), {
      threshold: [0],
      rootMargin: '0px 0px 0px 0px',
    });
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      document.body.removeChild(sentinel);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className="bg-brand-navy dark:bg-brand-gold text-brand-gold dark:text-brand-navy fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'none' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
