'use client';
import { motion, MotionValue } from 'motion/react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TextReveal } from '@/src/components/motion/text-reveal';

interface HeroContentProps {
  heroOpacity: MotionValue<number>;
}

export default function HeroContent({ heroOpacity }: HeroContentProps) {
  const t = useTranslations('hero');

  return (
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
            stagger={0}
            blur={0}
            yOffset="0%"
            duration={0.15}
            className="inline"
          />{' '}
          <br />
          <span className="text-brand-gold inline-block pr-4 italic">
            <TextReveal
              text={t('titleAccent')}
              as="span"
              split="word"
              stagger={0}
              delay={0}
              blur={0}
              yOffset="0%"
              duration={0.15}
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
  );
}
