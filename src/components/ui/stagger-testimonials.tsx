'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const SQRT_5000 = Math.sqrt(5000);
const TOTAL = 20;
const VISIBLE_RANGE = 3; // render positions -3..+3 (7 cards visible)

const testimonialImages = [
  '/images/testimonials/client_male_1.png',
  '/images/testimonials/client_male_2.png',
  '/images/testimonials/client_female_1.png',
  '/images/testimonials/client_male_3.png',
  '/images/testimonials/client_female_2.png',
  '/images/testimonials/client_male_1.png',
  '/images/testimonials/client_male_2.png',
  '/images/testimonials/client_male_3.png',
  '/images/testimonials/client_female_3.png',
  '/images/testimonials/client_female_1.png',
];

const testimonials = Array.from({ length: TOTAL }, (_, i) => ({
  id: i % 10,
  imgSrc: testimonialImages[i % 10],
}));

interface TestimonialCardProps {
  position: number;
  testimonial: (typeof testimonials)[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;
  const t = useTranslations('testimonials');

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        'absolute top-1/2 left-1/2 cursor-pointer border-2 p-8 transition-all duration-300 ease-out',
        isCenter
          ? 'bg-brand-gold text-brand-navy border-brand-gold z-10'
          : 'text-brand-navy dark:bg-brand-dark-surface dark:border-brand-dark-border hover:border-brand-gold/50 z-0 border-gray-200 bg-white dark:text-gray-100'
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? '0px 8px 0px 4px var(--color-brand-dark-border)'
          : '0px 0px 0px 0px transparent',
      }}
    >
      <span
        className="dark:bg-brand-dark-border absolute block origin-top-right rotate-45 bg-gray-200"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <div
        className="dark:bg-brand-dark-bg relative mb-4 h-14 w-12 bg-gray-100"
        style={{ boxShadow: '3px 3px 0px var(--color-brand-bg)' }}
      >
        <Image
          src={testimonial.imgSrc}
          alt={`${t(`list.t${testimonial.id}.by`).split(',')[0]}`}
          fill
          sizes="48px"
          className="object-cover object-top grayscale transition-all duration-300 hover:grayscale-0"
        />
      </div>
      <h3
        className={cn(
          'font-serif text-base font-medium sm:text-xl',
          isCenter ? 'text-brand-navy' : 'text-brand-navy dark:text-gray-100'
        )}
      >
        &ldquo;{t(`list.t${testimonial.id}.text`)}&rdquo;
      </h3>
      <p
        className={cn(
          'absolute right-8 bottom-8 left-8 mt-2 text-sm italic',
          isCenter ? 'text-brand-navy/80' : 'text-gray-500 dark:text-gray-400'
        )}
      >
        - {t(`list.t${testimonial.id}.by`).split(',')[0]}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const t = useTranslations('testimonials');
  const [cardSize, setCardSize] = useState(365);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMove = useCallback((steps: number) => {
    setRotationOffset((prev) => (prev + steps + TOTAL) % TOTAL);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)');
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-play — skip when user prefers reduced motion
  useEffect(() => {
    if (reducedMotion) return;
    autoPlayRef.current = setInterval(() => {
      setRotationOffset((prev) => (prev + 1 + TOTAL) % TOTAL);
    }, 3000);
    return () => clearInterval(autoPlayRef.current);
  }, [reducedMotion]);

  const centerOffset = TOTAL % 2 === 0 ? TOTAL / 2 : (TOTAL - 1) / 2;

  return (
    <section className="bg-brand-bg dark:bg-brand-dark-bg relative overflow-hidden py-24">
      <div className="container mx-auto mb-16 px-4 text-center">
        <h2 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-white">
          {t('title')}
        </h2>
        <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>
      <div className="relative w-full overflow-hidden" style={{ height: 600 }}>
        {testimonials.map((testimonial, index) => {
          // Compute position using rotation offset (stable keys, no array mutations)
          const visualIndex = (index - rotationOffset + TOTAL) % TOTAL;
          const position = visualIndex - centerOffset;

          // Only render cards in the visible window — 7 out of 20
          if (Math.abs(position) > VISIBLE_RANGE) return null;

          return (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          );
        })}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            onClick={() => handleMove(-1)}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors',
              'dark:bg-brand-dark-surface dark:border-brand-dark-border text-brand-navy hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy border-2 border-gray-200 bg-white dark:text-gray-100',
              'focus-visible:ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
            aria-label={t('ariaPrevious')}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => handleMove(1)}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors',
              'dark:bg-brand-dark-surface dark:border-brand-dark-border text-brand-navy hover:bg-brand-gold hover:text-brand-navy hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy border-2 border-gray-200 bg-white dark:text-gray-100',
              'focus-visible:ring-brand-gold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
            aria-label={t('ariaNext')}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};
