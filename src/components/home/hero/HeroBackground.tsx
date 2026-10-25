'use client';

import Image from 'next/image';
import type { HeroImage } from '../HeroSection';

interface HeroBackgroundProps {
  images: HeroImage[];
  currentHeroIndex: number;
  isMobile?: boolean;
  // Kept for backwards compatibility if callers or tests pass motion values
  backgroundY?: unknown;
  heroScale?: unknown;
}

export default function HeroBackground({
  images,
  currentHeroIndex,
  isMobile = false,
}: HeroBackgroundProps) {
  const currentImage = images[currentHeroIndex] ||
    images[0] || {
      src: '/images/hero1_new.webp',
      alt: 'SVI Infra Solutions',
    };

  return (
    <div className="absolute inset-0 z-0 bg-slate-900">
      <div
        key={currentHeroIndex}
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          isMobile ? 'scale-100' : 'animate-kenburns scale-100'
        }`}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          priority={currentHeroIndex === 0}
          fetchPriority={currentHeroIndex === 0 ? 'high' : 'low'}
          loading={currentHeroIndex === 0 ? 'eager' : 'lazy'}
          quality={isMobile ? 75 : 80}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className="object-cover object-center brightness-[1.04] contrast-[1.02]"
          placeholder={currentImage.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={currentImage.blurDataURL}
        />
      </div>

      {/* Light, vibrant architectural gradient overlays for high visibility */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-black/20" />
    </div>
  );
}
