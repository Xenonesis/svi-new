'use client';

import { useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    // Only need to check once — parallax is removed on mobile
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Static fallback motion values for mobile (no spring computation)
  const staticY = useMotionValue('0%');
  const staticScale = useMotionValue(1);
  const staticOpacity = useMotionValue(1);

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.01 });
  const backgroundY = useTransform(smoothScroll, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(smoothScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(smoothScroll, [1, 0], [1, 1.05]);

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
    if (!isAutoPlaying || prefersReducedMotion) return;
    const timer = setInterval(() => {
      startTransition(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % images.length);
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, prefersReducedMotion, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevHeroSlide();
      else if (e.key === 'ArrowRight') nextHeroSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextHeroSlide, prevHeroSlide]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[90svh] items-center justify-center overflow-hidden py-20 sm:min-h-[85vh] md:min-h-[900px] lg:py-32"
      role="region"
      aria-label={t('ariaHeroSection')}
    >
      <HeroBackground
        images={images}
        currentHeroIndex={currentHeroIndex}
        backgroundY={isMobile ? staticY : backgroundY}
        heroScale={isMobile ? staticScale : heroScale}
        isMobile={isMobile}
      />

      <HeroControls
        imagesCount={images.length}
        currentHeroIndex={currentHeroIndex}
        onNext={nextHeroSlide}
        onPrev={prevHeroSlide}
        onSelect={handleSelect}
      />

      <HeroContent heroOpacity={isMobile ? staticOpacity : heroOpacity} />

      <HeroStatCard />
    </section>
  );
}
