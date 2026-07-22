'use client';
import { motion, MotionValue } from 'motion/react';
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
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentHeroIndex ? 'z-0 opacity-100' : 'pointer-events-none -z-10 opacity-0'
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
    </motion.div>
  );
}
