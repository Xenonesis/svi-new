'use client';

import React from 'react';
import { ShieldCheck, Users, PhoneCall, MessageCircle } from 'lucide-react';

export interface TrustBannerV2Props {
  variant?: 'top' | 'bottom' | 'compact';
  className?: string;
  phone?: string;
  allotteesCount?: string;
}

export function TrustBannerV2({
  variant = 'top',
  className = '',
  phone = '+91 9216014579',
  allotteesCount = '1,200+',
}: TrustBannerV2Props) {
  const cleanPhone = phone.replace(/\s+/g, '');
  const waPhone = cleanPhone.replace('+', '');
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    'Hello SVI Infra Solutions, I need assistance with the registration form.'
  )}`;

  return (
    <div
      role="region"
      aria-label="Trust and Verification Banner"
      className={`border-brand-gold/30 relative overflow-hidden rounded-2xl border bg-slate-950/95 px-4 py-3 text-slate-100 shadow-xl backdrop-blur-md sm:px-6 sm:py-3.5 dark:bg-[#0b0c10]/95 ${className}`}
    >
      {/* Subtle Luxury Ambient Gold Glow */}
      <div
        className="bg-brand-gold/15 pointer-events-none absolute -top-12 -right-12 h-32 w-48 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div
        className="bg-brand-gold/10 pointer-events-none absolute -bottom-10 -left-10 h-28 w-40 rounded-full blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
        {/* 1. SVI Verified Scheme Badge */}
        <div className="flex items-center gap-2.5">
          <span className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <ShieldCheck
              className="text-brand-gold h-4 w-4 shrink-0 stroke-[2.2]"
              aria-hidden="true"
            />
            <span>SVI Verified Scheme</span>
          </span>
        </div>

        {/* 2. Registered Allottees Stat */}
        <div className="flex items-center gap-2 text-center text-xs text-slate-300 sm:text-sm">
          <Users className="text-brand-gold/90 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-brand-gold-light font-extrabold text-white">
              {allotteesCount}
            </strong>{' '}
            Registered Allottees in Noida &amp; Jaipur Expressway
          </span>
        </div>

        {/* 3. Direct Helpdesk Shortcut */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`tel:${cleanPhone}`}
            aria-label={`Call SVI Helpdesk at ${phone}`}
            className="border-brand-gold/30 hover:border-brand-gold hover:text-brand-gold focus:ring-brand-gold/50 inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-slate-100 transition-all hover:bg-slate-800 focus:ring-2 focus:outline-hidden sm:text-sm"
          >
            <PhoneCall className="text-brand-gold h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Need Help? {phone}</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with SVI Helpdesk on WhatsApp"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-emerald-400 transition-all hover:border-emerald-500 hover:bg-emerald-900/50 hover:text-emerald-300 focus:ring-2 focus:ring-emerald-500/50 focus:outline-hidden"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default TrustBannerV2;
