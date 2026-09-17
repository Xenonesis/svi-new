import type { ComponentType } from 'react';
import Image from 'next/image';
import {
  Factory,
  Train,
  Package,
  Sparkles,
  Milestone,
  Building2,
  GraduationCap,
  Clock,
  Compass,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import type { NearbyPlaceItem } from '@/src/data/projects';

type ProjectNearbyPlacesProps = {
  nearbyPlaces?: NearbyPlaceItem[];
  isHindi?: boolean;
};

const getCategoryIcon = (
  category: NearbyPlaceItem['category']
): ComponentType<{ className?: string }> => {
  switch (category) {
    case 'industry':
      return Factory;
    case 'railway':
      return Train;
    case 'logistics':
      return Package;
    case 'temple':
      return Sparkles;
    case 'highway':
      return Milestone;
    case 'corridor':
      return Building2;
    case 'civic':
      return GraduationCap;
    default:
      return MapPin;
  }
};

const getCategoryAccent = (category: NearbyPlaceItem['category']) => {
  switch (category) {
    case 'industry':
      return {
        badge: 'bg-black/70 text-emerald-400 border-emerald-500/40',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
        timeBadge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
        glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      };
    case 'railway':
      return {
        badge: 'bg-black/70 text-sky-400 border-sky-500/40',
        iconBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
        timeBadge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
        glow: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
      };
    case 'logistics':
      return {
        badge: 'bg-black/70 text-amber-400 border-amber-500/40',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
        timeBadge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
        glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
      };
    case 'temple':
      return {
        badge: 'bg-black/70 text-amber-300 border-amber-400/50',
        iconBg: 'bg-amber-400/15 text-amber-700 dark:bg-amber-400/25 dark:text-amber-300',
        timeBadge: 'bg-amber-400/15 text-amber-800 dark:text-amber-300 border-amber-400/30',
        glow: 'hover:border-amber-400/50 hover:shadow-amber-400/10',
      };
    case 'highway':
      return {
        badge: 'bg-black/70 text-slate-200 border-slate-400/40',
        iconBg: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
        timeBadge: 'bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-500/20',
        glow: 'hover:border-slate-500/40 hover:shadow-slate-500/10',
      };
    case 'corridor':
      return {
        badge: 'bg-black/70 text-indigo-300 border-indigo-400/40',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
        timeBadge: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20',
        glow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      };
    case 'civic':
    default:
      return {
        badge: 'bg-black/70 text-teal-300 border-teal-400/40',
        iconBg: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
        timeBadge: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/20',
        glow: 'hover:border-teal-500/40 hover:shadow-teal-500/10',
      };
  }
};

export default function ProjectNearbyPlaces({ nearbyPlaces, isHindi }: ProjectNearbyPlacesProps) {
  if (!nearbyPlaces || nearbyPlaces.length === 0) return null;

  const featuredPlaces = nearbyPlaces.filter((p) => p.featured);
  const secondaryPlaces = nearbyPlaces.filter((p) => !p.featured);

  return (
    <section id="nearby-places" className="mt-20 w-full scroll-mt-24">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-8 md:flex-row md:items-end md:justify-between dark:border-slate-800/80">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
              <Compass className="h-3.5 w-3.5" />
              <span>
                {isHindi
                  ? 'रणनीतिक कनेक्टिविटी एवं नजदीकी स्थल'
                  : 'Strategic Connectivity & Nearby Landmarks'}
              </span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {isHindi
                ? 'औद्योगिक विकास, द्रुतगामी रेल एवं पावन तीर्थ का संगम'
                : 'Where Industry, Rapid Transit & Sacred Horizons Converge'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              {isHindi
                ? 'प्रमुख औद्योगिक क्षेत्रों, राष्ट्रीय वेयरहाउसिंग हब, रेलवे स्टेशन एवं पवित्र खाटू धाम तक त्वरित पहुँच — सुरक्षित निवेश और उच्च पूंजीगत लाभ।'
                : 'Immediate proximity to established state industrial zones, national warehousing hubs, railway transit, and the sacred Khatu Dham corridor.'}
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex dark:text-slate-400">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>{isHindi ? 'रियल टाइम ड्राइव टाइम' : 'Direct Highway Travel Times'}</span>
          </div>
        </div>

        {/* Primary Bento Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredPlaces.map((place, idx) => {
            const Icon = getCategoryIcon(place.category);
            const accent = getCategoryAccent(place.category);
            const name = isHindi ? place.nameHi : place.name;
            const tag = isHindi && place.tagHi ? place.tagHi : place.tag;
            const distance = isHindi && place.distanceHi ? place.distanceHi : place.distance;
            const time = isHindi && place.timeHi ? place.timeHi : place.time;
            const description = isHindi ? place.descriptionHi : place.description;
            return (
              <article
                key={idx}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-5 dark:border-slate-800/80 dark:bg-[#0c121e]/90 ${accent.glow}`}
              >
                <div>
                  {/* High-Resolution Landmark Image Header */}
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner sm:h-48 dark:bg-slate-800">
                    {place.image ? (
                      <>
                        <Image
                          src={place.image}
                          alt={name}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-10 w-10 text-slate-400" />
                      </div>
                    )}

                    {/* Top Category Badge Over Image */}
                    <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                      {tag && (
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${accent.badge}`}
                        >
                          {tag}
                        </span>
                      )}
                    </div>

                    {/* Bottom Distance / Time Pill Over Image */}
                    <div className="absolute right-3 bottom-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[11px] font-extrabold text-white shadow-lg backdrop-blur-md">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>{distance ? `${distance} • ${time}` : time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3.5 font-serif text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-amber-600 sm:text-xl dark:text-white dark:group-hover:text-amber-400">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{isHindi ? 'सीधा संपर्क मार्ग' : 'Direct Corridor Access'}</span>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950 dark:bg-slate-800 dark:text-slate-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Secondary Connectivity Strip */}
        {secondaryPlaces.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
              <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                {isHindi
                  ? 'क्षेत्रीय कनेक्टिविटी एवं नागरिक अवसंरचना'
                  : 'Regional Corridors & Civic Infrastructure'}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {secondaryPlaces.map((place, idx) => {
                const Icon = getCategoryIcon(place.category);
                const accent = getCategoryAccent(place.category);
                const name = isHindi ? place.nameHi : place.name;
                const tag = isHindi && place.tagHi ? place.tagHi : place.tag;
                const distance = isHindi && place.distanceHi ? place.distanceHi : place.distance;
                const time = isHindi && place.timeHi ? place.timeHi : place.time;
                const description = isHindi ? place.descriptionHi : place.description;

                return (
                  <article
                    key={idx}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-5 dark:border-slate-800/80 dark:bg-[#0c121e]/90 ${accent.glow}`}
                  >
                    <div>
                      {/* Landmark Image Header */}
                      <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner sm:h-40 dark:bg-slate-800">
                        {place.image ? (
                          <>
                            <Image
                              src={place.image}
                              alt={name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <Icon className="h-10 w-10 text-slate-400" />
                          </div>
                        )}

                        {/* Top Category Badge Over Image */}
                        <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                          {tag && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${accent.badge}`}
                            >
                              {tag}
                            </span>
                          )}
                        </div>

                        {/* Bottom Distance / Time Pill Over Image */}
                        <div className="absolute right-3 bottom-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-2.5 py-1 font-mono text-[11px] font-extrabold text-white shadow-lg backdrop-blur-md">
                            <Clock className="h-3 w-3 text-amber-400" />
                            {distance && <span>{distance}</span>}
                            {distance && time && <span className="text-white/40">•</span>}
                            {time && <span className="text-amber-300">{time}</span>}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="mt-4">
                        <h4 className="font-serif text-base font-bold text-slate-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                          {name}
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-[13px] dark:text-slate-300">
                          {description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status / Access Link */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{isHindi ? 'क्षेत्रीय कनेक्टिविटी' : 'Regional Connectivity'}</span>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950 dark:bg-slate-800 dark:text-slate-400">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
