import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { AreaInfo } from '@/src/data/areas';

export interface AreaHeroBannerProps {
  area?: Pick<AreaInfo, 'name' | 'title' | 'description'>;
  name?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  badgeText?: string;
  isHindi?: boolean;
}

export function AreaHeroBanner({
  area,
  name: propName,
  title: propTitle,
  description: propDesc,
  imageSrc = '/images/project1.png',
  badgeText,
  isHindi = false,
}: AreaHeroBannerProps) {
  const name = area?.name ?? propName ?? '';
  const title = area?.title ?? propTitle ?? '';
  const description = area?.description ?? propDesc ?? '';
  const badge = badgeText || (isHindi ? 'विशेष स्थान' : 'Featured Location');

  return (
    <section className="relative h-[45vh] min-h-[350px] w-full pt-20">
      <Image src={imageSrc} alt={name || 'Area Banner'} fill className="object-cover" priority />
      <div className="from-brand-navy via-brand-navy/60 absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
        <div className="container mx-auto">
          <div className="bg-brand-gold text-brand-navy mb-3 inline-flex items-center gap-2 px-3 py-1 text-xs font-bold tracking-wider uppercase">
            <MapPin size={12} />
            {badge}
          </div>
          <h1 className="mb-2 font-serif text-3xl text-white md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AreaHeroBanner;
