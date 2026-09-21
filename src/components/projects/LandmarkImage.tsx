'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Factory,
  Train,
  Package,
  Sparkles,
  Milestone,
  Building2,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import type { NearbyPlaceItem } from '@/src/data/projects';

const CATEGORY_ICONS: Record<string, typeof MapPin> = {
  industry: Factory,
  railway: Train,
  logistics: Package,
  temple: Sparkles,
  highway: Milestone,
  corridor: Building2,
  civic: GraduationCap,
};

interface LandmarkImageProps {
  src?: string;
  alt: string;
  category?: NearbyPlaceItem['category'];
  className?: string;
}

export default function LandmarkImage({
  src,
  alt,
  category,
  className = 'object-cover transition-transform duration-700 ease-out group-hover:scale-108',
}: LandmarkImageProps) {
  const [hasError, setHasError] = useState(false);
  const Icon = (category && CATEGORY_ICONS[category]) || MapPin;

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-[#070c16]">
        <Icon className="h-10 w-10 text-amber-400/40 transition-transform duration-500 group-hover:scale-110 group-hover:text-amber-400/70" />
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        onError={() => setHasError(true)}
        className={className}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
    </>
  );
}
