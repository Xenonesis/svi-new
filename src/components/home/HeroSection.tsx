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
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden py-20 md:min-h-[900px] lg:py-32"
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
              quality={90}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Dynamic Dark Gradient + Aurora Mesh */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0b0c10]/90 via-[#0b0c10]/60 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent" />
        <div className="aurora-bg z-10" />
      </motion.div>

      {/* Navigation arrows */}
      <button
        onClick={prevHeroSlide}
        className="hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold absolute right-24 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all md:right-32 md:bottom-12"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        onClick={nextHeroSlide}
        className="hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold absolute right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all md:right-16 md:bottom-12"
        aria-label="Next slide"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      {/* Slide indicators - repositioned to left bottom */}
      <div
        className="absolute bottom-12 left-8 z-30 hidden gap-3 md:flex lg:left-16"
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
        className="z-30 container mx-auto flex w-full flex-col items-start px-8 text-left drop-shadow-2xl md:px-16"
        style={{ opacity: heroOpacity }}
      >
        <div className="max-w-3xl">
          <span className="text-brand-gold animate-hero-1 mb-8 inline-block text-xs font-bold tracking-[0.3em] uppercase opacity-90">
            {t('badge')}
          </span>

          <h1 className="animate-hero-2 mb-8 font-serif text-5xl leading-[1.05] text-white sm:text-6xl md:text-8xl">
            {t('title')}
            <br />
            <span
              className="text-gradient-gold animate-bg-pan inline-block pr-4 italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
              }}
            >
              {t('titleAccent')}
            </span>
          </h1>

          <p className="animate-hero-3 mb-12 max-w-xl text-base leading-relaxed font-light text-white/80 md:text-xl">
            {t('subtitle')}
          </p>

          <div className="animate-hero-4 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/projects/current"
                className="shimmer bg-brand-gold text-brand-navy inline-flex h-14 items-center justify-center px-10 text-[11px] font-bold tracking-[0.15em] uppercase shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]"
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
        <div className="group relative max-w-[320px] overflow-hidden border border-white/10 bg-black/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="from-brand-gold/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <h3 className="text-brand-gold mb-3 font-serif text-5xl leading-none">
            15<span className="text-3xl">+</span>
          </h3>
          <p className="text-sm leading-relaxed font-light text-white/70">
            Years of delivering uncompromising luxury, architectural excellence, and prime real
            estate investments.
          </p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="animate-hero-5 absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 md:hidden">
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
          {t('scroll')}
        </span>
        <div className="h-10 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
