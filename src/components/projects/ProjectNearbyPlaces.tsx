import type { ComponentType } from 'react';
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
        badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
        timeBadge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
        glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      };
    case 'railway':
      return {
        badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
        iconBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
        timeBadge: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20',
        glow: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
      };
    case 'logistics':
      return {
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
        timeBadge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
        glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
      };
    case 'temple':
      return {
        badge: 'bg-amber-400/20 text-amber-800 dark:text-amber-300 border-amber-400/40',
        iconBg: 'bg-amber-400/15 text-amber-700 dark:bg-amber-400/25 dark:text-amber-300',
        timeBadge: 'bg-amber-400/15 text-amber-800 dark:text-amber-300 border-amber-400/30',
        glow: 'hover:border-amber-400/50 hover:shadow-amber-400/10',
      };
    case 'highway':
      return {
        badge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
        iconBg: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
        timeBadge: 'bg-slate-500/10 text-slate-800 dark:text-slate-300 border-slate-500/20',
        glow: 'hover:border-slate-500/40 hover:shadow-slate-500/10',
      };
    case 'corridor':
      return {
        badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
        timeBadge: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20',
        glow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      };
    case 'civic':
    default:
      return {
        badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
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
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-950/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:border-slate-800/80 dark:bg-[#0c121e]/90 ${accent.glow}`}
              >
                {/* Top Row: Icon + Category Badge */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {tag && (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${accent.badge}`}
                      >
                        {tag}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 font-serif text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                    {name}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </div>

                {/* Bottom Metric Pill */}
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      {distance && (
                        <span className="font-mono text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {distance}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${!distance ? 'font-mono text-base font-extrabold tracking-tight text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        <Clock className="h-3 w-3 text-amber-500" />
                        {time}
                      </span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950 dark:bg-slate-800 dark:text-slate-500">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Secondary Connectivity Strip */}
        {secondaryPlaces.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {secondaryPlaces.map((place, idx) => {
              const Icon = getCategoryIcon(place.category);
              const accent = getCategoryAccent(place.category);
              const name = isHindi ? place.nameHi : place.name;
              const tag = isHindi && place.tagHi ? place.tagHi : place.tag;
              const distance = isHindi && place.distanceHi ? place.distanceHi : place.distance;
              const time = isHindi && place.timeHi ? place.timeHi : place.time;
              const description = isHindi ? place.descriptionHi : place.description;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-xs transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#0c121e]/60 dark:hover:border-slate-700"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate font-serif text-sm font-bold text-slate-900 dark:text-white">
                        {name}
                      </h4>
                      {distance && (
                        <span className="shrink-0 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {distance}
                        </span>
                      )}
                    </div>
                    {tag && (
                      <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                        {tag} {time ? `• ${time}` : ''}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
