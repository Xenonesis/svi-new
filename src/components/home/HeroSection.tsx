'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

import { useTranslations } from 'next-intl';
import { TextReveal } from '@/src/components/motion/text-reveal';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

interface HeroImage {
  src: string;
  alt: string;
  blurDataURL?: string;
}

export default function HeroSection({ images }: { images: HeroImage[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [1, 0], [1, 1.08]);

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

  useEffect(() => {
    if (!isAutoPlaying || prefersReducedMotion) return;
    const timer = setInterval(() => {
      startTransition(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % images.length);
      });
    }, 6000); // slightly slower transitions for a luxurious pace
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
      {/* Parallax background with all hero images */}
      <motion.div
        className="bg-brand-navy absolute inset-0 z-0"
        style={{ y: backgroundY, scale: heroScale }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroIndex ? 'z-0 opacity-100' : '-z-10 opacity-0'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={idx === 0}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              quality={90}
              sizes="100vw"
              className="object-cover"
              placeholder={img.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={img.blurDataURL}
            />
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-[#0b0c10]/70" />
        <HeroCanvas />
      </motion.div>

      {/* Navigation arrows */}
      <button
        onClick={prevHeroSlide}
        className="hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold absolute right-16 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all sm:right-24 sm:bottom-8 sm:h-12 sm:w-12 md:right-32 md:bottom-12"
        aria-label={t('ariaPrevSlide')}
      >
        <ChevronLeft size={18} strokeWidth={1.5} className="sm:hidden" />
        <ChevronLeft size={20} strokeWidth={1.5} className="hidden sm:block" />
      </button>
      <button
        onClick={nextHeroSlide}
        className="hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold absolute right-4 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all sm:right-8 sm:bottom-8 sm:h-12 sm:w-12 md:right-16 md:bottom-12"
        aria-label={t('ariaNextSlide')}
      >
        <ChevronRight size={18} strokeWidth={1.5} className="sm:hidden" />
        <ChevronRight size={20} strokeWidth={1.5} className="hidden sm:block" />
      </button>

      {/* Slide indicators - repositioned to left bottom */}
      <div
        className="absolute bottom-20 left-4 z-30 flex gap-2 sm:bottom-12 sm:left-8 sm:gap-3 lg:left-16"
        role="tablist"
        aria-label={t('ariaSlideNav')}
      >
        {images.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentHeroIndex(idx);
            }}
            aria-label={t('ariaGoToSlide', { number: idx + 1 })}
            aria-selected={idx === currentHeroIndex}
            role="tab"
            animate={{
              width: idx === currentHeroIndex ? 36 : 12,
              backgroundColor: idx === currentHeroIndex ? '#d4af37' : 'rgba(255,255,255,0.4)',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-1 rounded-full"
          />
        ))}
      </div>

      {/* Hero content with parallax opacity - Left Aligned Asymmetrical */}
      <motion.div
        className="z-30 container mx-auto flex w-full flex-col items-start px-4 text-left drop-shadow-2xl sm:px-8 md:px-16"
        style={{ opacity: heroOpacity }}
      >
        <div className="max-w-3xl">
          <span className="text-brand-gold animate-hero-1 mb-4 inline-block text-xs font-bold tracking-[0.2em] uppercase opacity-90 sm:mb-8 sm:text-base sm:tracking-[0.3em]">
            {t('badge')}
          </span>

          <h1 className="animate-hero-2 mb-6 font-serif text-[2.4rem] leading-[1.05] text-white min-[380px]:text-5xl sm:mb-8 sm:text-6xl md:text-8xl">
            <TextReveal
              text={t('title')}
              as="span"
              split="word"
              stagger={0.06}
              blur={8}
              yOffset="30%"
              className="inline"
            />{' '}
            <br />
            <span className="text-brand-gold inline-block pr-4 italic">
              <TextReveal
                text={t('titleAccent')}
                as="span"
                split="word"
                stagger={0.06}
                delay={0.5}
                blur={8}
                yOffset="30%"
                className="inline"
              />
            </span>
          </h1>

          <p className="animate-hero-3 mb-8 max-w-xl text-sm leading-relaxed font-light text-white/80 sm:mb-12 sm:text-base md:text-xl">
            {t('subtitle')}
          </p>

          <div className="animate-hero-4 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/projects/current"
                onClick={() => {
                  import('@vercel/analytics').then(({ track }) => track('hero_cta_click'));
                }}
                className="bg-brand-gold text-brand-navy inline-flex h-14 items-center justify-center px-10 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:bg-white"
              >
                {t('cta')}
              </Link>
            </motion.div>
            <Link
              href="/registration"
              className="group hover:text-brand-gold flex items-center gap-3 text-white/80 transition-colors"
            >
              <span className="hover-underline-gold text-[11px] font-bold tracking-[0.15em] uppercase">
                {t('invest')}
              </span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-2"
              />
            </Link>
          </div>
        </div>
      </motion.div>

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
    </section>
  );
}
