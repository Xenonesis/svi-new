'use client';

import { useState } from 'react';
import { motion, MotionValue } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, MapPin, Building, Banknote } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface HeroContentProps {
  heroOpacity: MotionValue<number>;
}

export default function HeroContent({ heroOpacity }: HeroContentProps) {
  const t = useTranslations('hero');
  const router = useRouter();

  const [location, setLocation] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/projects/current?location=${location}&type=${propertyType}&budget=${budget}`);
  };

  return (
    <motion.div
      className="z-30 container mx-auto flex w-full flex-col items-start px-4 text-left drop-shadow-2xl sm:px-8 md:px-16"
      style={{ opacity: heroOpacity }}
    >
      <div className="w-full max-w-5xl">
        <span className="text-brand-gold animate-hero-1 mb-4 inline-block text-xs font-bold tracking-[0.2em] uppercase opacity-90 sm:mb-8 sm:text-base sm:tracking-[0.3em]">
          {t('badge')}
        </span>

        <h1 className="animate-hero-2 mb-6 font-serif text-[2.4rem] leading-[1.05] text-white min-[380px]:text-5xl sm:mb-8 sm:text-6xl md:text-8xl">
          <span className="inline">{t('title')}</span> <br />
          <span className="text-brand-gold inline-block pr-4 italic">
            <span className="inline">{t('titleAccent')}</span>
          </span>
        </h1>

        <p className="animate-hero-3 mb-8 max-w-xl text-sm leading-relaxed font-light text-white/80 sm:mb-10 sm:text-base md:text-xl">
          {t('subtitle')}
        </p>

        <div className="animate-hero-4 mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/projects/current"
              onClick={() => {
                import('@vercel/analytics').then(({ track }) => track('hero_cta_click'));
              }}
              className="bg-brand-gold text-brand-navy inline-flex h-14 items-center justify-center px-10 text-[11px] font-bold tracking-[0.15em] uppercase shadow-lg transition-colors hover:bg-white"
            >
              {t('cta')}
            </Link>
          </motion.div>
          <Link
            href="/registration"
            className="group hover:text-brand-gold flex items-center gap-3 text-white/80 transition-colors"
          >
            <span className="hover-underline-gold text-[11px] font-bold tracking-[0.15em] uppercase">
              {t('invest')}
            </span>
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-2"
            />
          </Link>
        </div>

        {/* Quick Search Widget */}
        <form
          onSubmit={handleSearch}
          className="hover:shadow-3xl grid w-full max-w-4xl grid-cols-1 gap-4 rounded-2xl border border-white/20 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white/15 sm:grid-cols-3 md:p-6 lg:grid-cols-4"
        >
          {/* Location Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-white/80 uppercase">
              <MapPin size={14} className="text-brand-gold" /> Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/50 appearance-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-md transition-all outline-none focus:ring-2"
            >
              <option value="all" className="text-gray-900">
                All Locations
              </option>
              <option value="jaipur" className="text-gray-900">
                Jaipur - Ajmer Highway
              </option>
              <option value="phulera" className="text-gray-900">
                Phulera Smart City
              </option>
              <option value="noida" className="text-gray-900">
                Noida Express
              </option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-white/80 uppercase">
              <Building size={14} className="text-brand-gold" /> Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/50 appearance-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-md transition-all outline-none focus:ring-2"
            >
              <option value="all" className="text-gray-900">
                All Categories
              </option>
              <option value="plots" className="text-gray-900">
                JDA Approved Plots
              </option>
              <option value="townships" className="text-gray-900">
                Gated Townships
              </option>
              <option value="commercial" className="text-gray-900">
                Commercial Hubs
              </option>
            </select>
          </div>

          {/* Budget Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-white/80 uppercase">
              <Banknote size={14} className="text-brand-gold" /> Budget Range
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="focus:border-brand-gold focus:ring-brand-gold/50 appearance-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-md transition-all outline-none focus:ring-2"
            >
              <option value="all" className="text-gray-900">
                Any Budget
              </option>
              <option value="under25" className="text-gray-900">
                Under ₹ 25 Lakhs
              </option>
              <option value="25to50" className="text-gray-900">
                ₹ 25L - ₹ 50 Lakhs
              </option>
              <option value="50plus" className="text-gray-900">
                ₹ 50 Lakhs+
              </option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-brand-gold text-brand-navy flex h-[46px] w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
            >
              <Search size={14} />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
