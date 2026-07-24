'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ArrowUpRight } from 'lucide-react';

const ContactMap = dynamic(() => import('@/src/components/contact/ContactMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  ),
});

export default function ContactMapWrapper() {
  const [showMap, setShowMap] = useState(false);

  if (!showMap) {
    return (
      <button
        onClick={() => setShowMap(true)}
        className="group relative flex h-[400px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[#1a2744] transition-all duration-500 hover:bg-[#243560]"
      >
        {/* Subtle dot pattern background */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative flex flex-col items-center gap-4">
          {/* Icon circle */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 ring-1 ring-[#d4af37]/20 transition-all duration-300 group-hover:bg-[#d4af37]/15 group-hover:ring-[#d4af37]/30">
            <MapPin size={24} className="text-[#d4af37]" strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.15em] text-white/90 uppercase">Load Map</p>
            <p className="mt-1 text-[11px] text-white/40">Click to view our office location</p>
          </div>

          {/* Arrow */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-[#d4af37]/20">
            <ArrowUpRight size={13} className="text-[#d4af37]" strokeWidth={2.5} />
          </div>
        </div>
      </button>
    );
  }

  return <ContactMap />;
}
