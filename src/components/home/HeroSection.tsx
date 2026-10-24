'use client';

import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import HeroBackground from './hero/HeroBackground';
import HeroControls from './hero/HeroControls';
import HeroContent from './hero/HeroContent';
import HeroStatCard from './hero/HeroStatCard';

export interface HeroImage {
  src: string;
  alt: string;
  blurDataURL?: string;
}

export default function HeroSection({ images }: { images: HeroImage[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const [isTouchOrSmall, setIsTouchOrSmall] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsTouchOrSmall(
        window.innerWidth < 1024 ||
          window.matchMedia('(pointer: coarse)').matches ||
          !window.matchMedia('(hover: hover)').matches
      );
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [_isPending, startTransition] = useTransition();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const t = useTranslations('hero');

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const nextHeroSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentHeroIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevHeroSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentHeroIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleSelect = useCallback((index: number) => {
    setIsAutoPlaying(false);
    setCurrentHeroIndex(index);
  }, []);
  useEffect(() => {
    const disableParallax = isTouchOrSmall || prefersReducedMotion;
    // Disable background autoplay on mobile/touch screens to preserve CPU, battery, and mobile bandwidth
    if (disableParallax || !isAutoPlaying) return;
    let timer: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      startTransition(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % images.length);
      });
      timer = setInterval(() => {
        startTransition(() => {
          setCurrentHeroIndex((prev) => (prev + 1) % images.length);
        });
      }, 8000);
    }, 10000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(timer);
    };
  }, [isTouchOrSmall, isAutoPlaying, prefersReducedMotion, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevHeroSlide();
      else if (e.key === 'ArrowRight') nextHeroSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextHeroSlide, prevHeroSlide]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextHeroSlide();
    } else if (isRightSwipe) {
      prevHeroSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <section
      ref={heroRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ paddingTop: 'calc(var(--header-height, 100px) + 2rem)' }}
      className="relative flex min-h-[90dvh] touch-pan-y items-center justify-center overflow-hidden pb-16 sm:min-h-[85vh] sm:pb-20 md:min-h-[900px] lg:pb-32"
      aria-label={t('ariaHeroSection')}
    >
      <HeroBackground
        images={images}
        currentHeroIndex={currentHeroIndex}
        isMobile={isTouchOrSmall || prefersReducedMotion}
      />
      <HeroControls
        imagesCount={images.length}
        currentHeroIndex={currentHeroIndex}
        onNext={nextHeroSlide}
        onPrev={prevHeroSlide}
        onSelect={handleSelect}
      />

      <HeroContent />

      <HeroStatCard />
    </section>
  );
}
