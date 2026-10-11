'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Car } from 'lucide-react';
import { SiteVisitModal } from './SiteVisitModal';

export function MobileConversionDock(): JSX.Element {
  const pathname = usePathname() || '';
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState(false);

  // Derive current project name from path for targeted WhatsApp inquiries
  const projectName = (() => {
    if (pathname.includes('shivani-vatika-11th') || pathname.includes('shivani-vatika-11')) {
      return 'Shivani Vatika 11th';
    }
    if (pathname.includes('shivani-vatika')) return 'Shivani Vatika';
    if (pathname.includes('shyam-aangan')) return 'Shyam Aangan';
    if (pathname.includes('phulera')) return 'Phulera SmartCity';
    return 'Residential Plots';
  })();

  const waText = encodeURIComponent(
    `Namaste SVI Infra, please send me the official brochure and price list for ${projectName}.`
  );
  const waUrl = `https://wa.me/919218300589?text=${waText}`;

  return (
    <>
      <nav
        aria-label="Mobile quick actions"
        className="fixed right-0 bottom-0 left-0 z-50 flex h-[calc(3.75rem+env(safe-area-inset-bottom,12px))] w-full items-center justify-between border-t border-[#d4af37]/20 bg-[#080b11]/95 px-3 pt-1 pb-[max(12px,env(safe-area-inset-bottom,12px))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:hidden"
      >
        {/* 1. Call Advisor */}
        <a
          href="tel:+919218300589"
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 transition-colors active:bg-white/5 active:text-white"
          aria-label="Call Advisor"
        >
          <Phone size={18} className="text-[#d4af37]" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">Call Advisor</span>
        </a>

        {/* 2. WhatsApp Brochure */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 transition-colors active:bg-white/5 active:text-white"
          aria-label="WhatsApp Brochure"
        >
          <MessageCircle size={18} className="text-[#25D366]" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">WhatsApp</span>
        </a>

        {/* 3. Free Cab Visit */}
        <button
          type="button"
          onClick={() => setIsSiteVisitOpen(true)}
          className="flex min-h-[48px] flex-[1.2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a84c] px-2 py-2 font-bold text-[#080b11] shadow-md shadow-amber-500/20 active:scale-95"
          aria-label="Free Cab Visit"
        >
          <Car size={18} className="text-[#080b11]" />
          <span className="text-[11px] font-bold tracking-tight uppercase">Free Cab Visit</span>
        </button>
      </nav>

      {/* Slide-Up Booking Modal */}
      <SiteVisitModal
        isOpen={isSiteVisitOpen}
        onClose={() => setIsSiteVisitOpen(false)}
        prefilledProject={projectName}
      />
    </>
  );
}
