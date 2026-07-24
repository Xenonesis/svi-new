'use client';
import { motion, MotionValue, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { HeroImage } from '../HeroSection';

interface HeroBackgroundProps {
  images: HeroImage[];
  currentHeroIndex: number;
  backgroundY: MotionValue<string>;
  heroScale: MotionValue<number>;
}

export default function HeroBackground({
  images,
  currentHeroIndex,
  backgroundY,
  heroScale,
}: HeroBackgroundProps) {
  return (
    <motion.div
      className="bg-brand-navy absolute inset-0 z-0"
      style={{ y: backgroundY, scale: heroScale, willChange: 'transform' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentHeroIndex}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeInOut' },
            scale: { duration: 10, ease: 'linear' },
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentHeroIndex].src}
            alt={images[currentHeroIndex].alt}
            fill
            priority={true}
            quality={90}
            sizes="100vw"
            className="object-cover"
            placeholder={images[currentHeroIndex].blurDataURL ? 'blur' : 'empty'}
            blurDataURL={images[currentHeroIndex].blurDataURL}
          />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[#0b0c10]/70" />
    </motion.div>
  );
}
