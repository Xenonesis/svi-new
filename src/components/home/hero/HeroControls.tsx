'use client';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeroControlsProps {
  imagesCount: number;
  currentHeroIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelect: (index: number) => void;
}

export default function HeroControls({
  imagesCount,
  currentHeroIndex,
  onNext,
  onPrev,
  onSelect,
}: HeroControlsProps) {
  const t = useTranslations('hero');

  return (
    <>
      {/* Navigation arrows */}
      <button
        onClick={onPrev}
        className="hover:border-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold absolute right-16 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-md transition-all sm:right-24 sm:bottom-8 sm:h-12 sm:w-12 md:right-32 md:bottom-12"
        aria-label={t('ariaPrevSlide')}
      >
        <ChevronLeft size={18} strokeWidth={1.5} className="sm:hidden" />
        <ChevronLeft size={20} strokeWidth={1.5} className="hidden sm:block" />
      </button>
      <button
        onClick={onNext}
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
        {Array.from({ length: imagesCount }).map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => onSelect(idx)}
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
    </>
  );
}
