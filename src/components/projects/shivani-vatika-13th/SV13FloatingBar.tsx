'use client';

import { Phone, MessageSquare, Calendar } from 'lucide-react';

interface SV13FloatingBarProps {
  isHindi?: boolean;
  onBookSiteVisit: () => void;
}

export function SV13FloatingBar({ isHindi = false, onBookSiteVisit }: SV13FloatingBarProps) {
  return (
    <>
      {/* Desktop Floating Action Stack (Bottom Right) */}
      <div className="fixed right-6 bottom-6 z-40 hidden flex-col items-end gap-3 sm:flex">
        {/* Call Pill */}
        <a
          href="tel:+917300007643"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-900"
        >
          <Phone className="h-4 w-4 text-amber-400" />
          <span>Call: +91 73000 07643</span>
        </a>

        {/* Floating WhatsApp Bubble */}
        <a
          href={`https://wa.me/917300007643?text=${encodeURIComponent(
            'Hello SVI Infra, I am inquiring about Shivani Vatika 13th residential plots.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition-all hover:scale-110 hover:bg-emerald-500"
          aria-label="Chat on WhatsApp"
        >
          <MessageSquare className="h-6 w-6" />
        </a>
      </div>

      {/* Mobile Sticky Enquiry Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur-lg sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          {/* Call Now */}
          <a
            href="tel:+917300007643"
            className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-900 py-2 text-[11px] font-bold text-slate-200 transition-colors active:bg-slate-800"
          >
            <Phone className="h-4 w-4 text-amber-400" />
            <span className="mt-0.5">{isHindi ? 'कॉल करें' : 'Call Now'}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/917300007643?text=${encodeURIComponent(
              'Hello SVI Infra, I want details regarding Shivani Vatika 13th.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center rounded-xl bg-emerald-600 py-2 text-[11px] font-bold text-white shadow-sm transition-colors active:bg-emerald-700"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="mt-0.5">WhatsApp</span>
          </a>

          {/* Book Visit */}
          <button
            onClick={onBookSiteVisit}
            className="flex flex-col items-center justify-center rounded-xl bg-amber-400 py-2 text-[11px] font-bold text-slate-950 shadow-sm transition-colors active:bg-amber-300"
          >
            <Calendar className="h-4 w-4" />
            <span className="mt-0.5">{isHindi ? 'साइट विजिट' : 'Book Visit'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
