import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AreaInfo } from '@/src/data/areas';

export interface AreaProjectPreview {
  name: string;
  slug?: string;
}

export interface AreaVisual {
  image: string;
  badge: { en: string; hi: string };
  projectsPreview: AreaProjectPreview[];
}

export const AREA_VISUALS: Record<string, AreaVisual> = {
  'khatu-shyam-highway': {
    image: '/Shivani Vatika 11/gate.webp',
    badge: { en: 'Sacred Growth Corridor', hi: 'पवित्र तीर्थ कॉरिडोर' },
    projectsPreview: [{ name: 'Shivani Vatika 11th', slug: 'shivani-vatika-11th' }],
  },
  'nayla-jaipur': {
    image: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    badge: { en: 'Premier Residential', hi: 'प्रीमियर आवासीय' },
    projectsPreview: [{ name: 'Shivani Vatika', slug: 'shivani-vatika' }],
  },
  'tonk-road-jaipur': {
    image: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    badge: { en: 'Premier Residential', hi: 'प्रीमियर आवासीय' },
    projectsPreview: [{ name: 'Shivani Vatika', slug: 'shivani-vatika' }],
  },
  'phulera-smart-city': {
    image: '/images/landmarks/phulera-dmic.webp',
    badge: { en: 'DMIC Mega Hub', hi: 'DMIC मेगा हब' },
    projectsPreview: [{ name: 'Shivani Residency' }],
  },
};

export const DEFAULT_AREA_VISUAL: AreaVisual = {
  image: '/images/project1.png',
  badge: { en: 'Prime Corridor', hi: 'प्रमुख कॉरिडोर' },
  projectsPreview: [],
};

export interface AreaCardProps {
  area: AreaInfo;
  isHindi?: boolean;
  visual?: AreaVisual;
}

export function AreaCard({
  area,
  isHindi = false,
  visual: customVisual,
}: AreaCardProps): React.JSX.Element {
  const visual = customVisual || AREA_VISUALS[area.slug] || DEFAULT_AREA_VISUAL;
  const title = isHindi && area.metaTitleHi ? area.metaTitleHi : area.name;
  const subtitle = isHindi && area.metaDescriptionHi ? area.metaDescriptionHi : area.title;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-slate-800/80 dark:bg-[#0f172a]/90">
      {/* Visual Image Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900 sm:h-64">
        <Image
          src={visual.image}
          alt={area.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
            <MapPin className="h-3 w-3 text-amber-400" />
            {isHindi ? visual.badge.hi : visual.badge.en}
          </span>
        </div>

        {/* Name overlaid on image bottom */}
        <div className="absolute right-4 bottom-4 left-4 text-white">
          <h3 className="font-serif text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="line-clamp-2 text-xs font-semibold text-amber-600 sm:text-sm dark:text-amber-400">
          {subtitle}
        </p>

        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
          {area.description}
        </p>

        {/* Highlights Checklist */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            {isHindi ? 'मुख्य विशेषताएं' : 'Key Advantages'}
          </h4>
          <ul className="mt-3 space-y-2.5">
            {area.highlights.slice(0, 3).map((highlight: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span className="line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Associated Projects Preview */}
        {visual.projectsPreview.length > 0 && (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              {isHindi ? 'टाउनशिप प्रोजेक्ट्स' : 'Associated Projects'}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visual.projectsPreview.map((proj, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
                >
                  {proj.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spacer to push CTA to bottom */}
        <div className="mt-auto pt-6">
          <Link
            href={`/areas/${area.slug}`}
            className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/15 py-3 text-xs font-bold text-slate-900 transition-all duration-200 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 sm:text-sm dark:text-amber-300 dark:hover:text-slate-950"
          >
            <span>{isHindi ? 'पूरा क्षेत्र गाइड देखें' : 'Explore Area Guide'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
