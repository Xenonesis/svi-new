'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { useTranslations } from 'next-intl';

interface HeroImage {
  src: string;
  alt: string;
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
    }, 5000);
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
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-20 md:min-h-[900px] lg:py-32"
      role="region"
      aria-label="Hero section"
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
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </motion.div>

      {/* Navigation arrows */}
      <button
        onClick={prevHeroSlide}
        className="absolute top-1/2 left-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white md:left-8"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextHeroSlide}
        className="absolute top-1/2 right-4 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white md:right-8"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide indicators */}
      <div
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3"
        role="tablist"
        aria-label="Hero slide navigation"
      >
        {images.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentHeroIndex(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            aria-selected={idx === currentHeroIndex}
            role="tab"
            animate={{
              width: idx === currentHeroIndex ? 28 : 10,
              backgroundColor: idx === currentHeroIndex ? '#c9a84c' : 'rgba(255,255,255,0.5)',
            }}
            transition={{ duration: 0.3 }}
            className="h-2.5 rounded-full"
          />
        ))}
      </div>

      {/* Hero content with parallax opacity */}
      <motion.div
        className="z-30 container mx-auto flex flex-col items-center px-5 text-center drop-shadow-2xl sm:px-8 md:px-4"
        style={{ opacity: heroOpacity }}
      >
        <span className="text-brand-gold animate-hero-1 mb-6 inline-block text-[10px] font-semibold tracking-[0.2em] uppercase opacity-80">
          {t('badge')}
        </span>

        <h1 className="animate-hero-2 mb-8 font-serif text-4xl leading-[1.1] text-white sm:text-5xl md:text-7xl">
          {t('title')}
          <br />
          <span
            className="text-gradient-gold animate-bg-pan inline-block italic"
            style={{
              backgroundSize: '200% 200%',
              backgroundImage:
                'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
            }}
          >
            {t('titleAccent')}
          </span>
        </h1>

        <p className="animate-hero-3 mb-10 max-w-2xl px-2 text-center text-sm leading-relaxed text-white/90 md:text-xl">
          {t('subtitle')}
        </p>

        <div className="animate-hero-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/projects/current"
              className="shimmer bg-brand-gold text-brand-navy inline-block px-8 py-3.5 text-[11px] font-semibold tracking-wider uppercase shadow-lg transition-shadow hover:shadow-xl"
            >
              {t('cta')}
            </Link>
          </motion.div>
          <Link
            href="/registration"
            className="group flex items-center gap-2.5 text-white/90 transition-colors hover:text-white"
          >
            <span className="hover-underline-gold text-[10px] font-semibold tracking-wider uppercase">
              {t('invest')}
            </span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="animate-hero-5 absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase">{t('scroll')}</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
