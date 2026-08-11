'use client';

import { motion, MotionValue, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { HeroImage } from '../HeroSection';

interface HeroBackgroundProps {
  images: HeroImage[];
  currentHeroIndex: number;
  backgroundY: MotionValue<string>;
  heroScale: MotionValue<number>;
  isMobile?: boolean;
}

export default function HeroBackground({
  images,
  currentHeroIndex,
  backgroundY,
  heroScale,
  isMobile = false,
}: HeroBackgroundProps) {
  const currentImage = images[currentHeroIndex] ||
    images[0] || {
      src: '/images/hero1.webp',
      alt: 'SVI Infra Solutions',
    };

  const inner = (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentHeroIndex}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: isMobile ? 1 : 1.04 }}
          exit={{ opacity: 0, scale: isMobile ? 1 : 1.04 }}
          transition={{
            opacity: { duration: 1.1, ease: 'easeInOut' },
            scale: { duration: isMobile ? 0 : 9, ease: 'linear' },
          }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            priority={true}
            fetchPriority="high"
            quality={isMobile ? 85 : 95}
            sizes="100vw"
            className="object-cover object-center brightness-[1.04] contrast-[1.02]"
            placeholder={currentImage.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={currentImage.blurDataURL}
          />
        </motion.div>
      </AnimatePresence>

      {/* Light, vibrant architectural gradient overlays for high visibility */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-black/20" />
    </>
  );

  if (isMobile) {
    return <div className="absolute inset-0 z-0 bg-slate-900">{inner}</div>;
  }

  return (
    <motion.div
      className="absolute inset-0 z-0 bg-slate-900"
      style={{ y: backgroundY, scale: heroScale, willChange: 'transform' }}
    >
      {inner}
    </motion.div>
  );
}
