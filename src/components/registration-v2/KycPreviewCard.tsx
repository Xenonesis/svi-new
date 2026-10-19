'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, User, MapPin, FileCheck, BadgeCheck } from 'lucide-react';
import { isValidPan } from './schemeCalculator';
import type { KycPreviewCardProps } from './types';

export type { KycPreviewCardProps };

export function KycPreviewCard({
  fullName,
  photoFile,
  panCardFile,
  aadharNumber,
  panNumber,
  city,
  district,
  state,
  className = '',
}: KycPreviewCardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Manage object URL for photo preview with safe cleanup
  useEffect(() => {
    if (!photoFile) {
      setPhotoUrl(null);
      return;
    }

    let url: string | null = null;
    try {
      if (
        typeof window !== 'undefined' &&
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
      ) {
        url = URL.createObjectURL(photoFile);
        setPhotoUrl(url);
      }
    } catch {
      setPhotoUrl(null);
    }

    return () => {
      if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Safe ignore
        }
      }
    };
  }, [photoFile]);

  // Aadhaar masking: •••• •••• 1234
  const cleanAadhaar = (aadharNumber || '').replace(/\D/g, '');
  const last4 = cleanAadhaar.slice(-4);
  const maskedAadhaar =
    cleanAadhaar.length >= 4
      ? `•••• •••• ${last4}`
      : cleanAadhaar.length > 0
        ? `•••• •••• ${cleanAadhaar}`
        : '•••• •••• ••••';

  // PAN uppercase & live validation
  const upperPan = (panNumber || '').trim().toUpperCase();
  const panValid = isValidPan(upperPan);
  const displayPan = upperPan || '••••••••••';

  // Location display
  // Location display (City, District, State) with smart deduplication
  const upperCity = city?.trim().toUpperCase();
  const upperDistrict = district?.trim().toUpperCase();
  const upperState = state?.trim().toUpperCase();

  // Smart deduplication: If district contains the city name (e.g. "GURUGRAM (GURGAON)" contains "GURGAON"),
  // or city is identical/subset of district, do not repeat it.
  const isCityRedundant = Boolean(
    upperCity &&
    upperDistrict &&
    (upperDistrict.includes(upperCity) ||
      upperDistrict
        .replace(/[()]/g, ' ')
        .split(/\s+/)
        .some((part) => part && part === upperCity))
  );

  const isDistrictRedundant = Boolean(upperDistrict && upperCity && upperCity === upperDistrict);

  const locParts = [
    !isCityRedundant ? upperCity : null,
    !isDistrictRedundant ? upperDistrict : null,
    upperState,
  ].filter(Boolean);

  // Fallback if both got filtered out
  if (locParts.length === 1 && (upperCity || upperDistrict)) {
    locParts.unshift(upperDistrict || upperCity);
  }
  const locationText = locParts.length > 0 ? locParts.join(', ') : 'LOCATION NOT SET';

  // Display Name
  const trimmedName = (fullName || '').trim().toUpperCase();
  const displayName = trimmedName || 'APPLICANT NAME';

  return (
    <div
      role="region"
      aria-label="Digital Applicant KYC Identity Pass"
      className={`relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-br from-[#070a12] via-[#0d121d] to-[#070a12] p-5 text-white shadow-2xl ring-1 ring-amber-500/10 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent sm:p-6 ${className}`}
    >
      {/* Card Content */}
      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Header: SVI Infra Branding & Official Digital Seal */}
        <div className="border-b border-amber-500/20 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-500/50 bg-amber-500/15 shadow-[0_0_8px_rgba(212,175,55,0.2)]">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-400/90 uppercase">
                SVI INFRA SOLUTIONS
              </p>
            </div>

            {/* Official Digital Seal */}
            <div
              className="inline-flex shrink-0 items-center gap-1 overflow-hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300 uppercase shadow-[0_0_8px_rgba(212,175,55,0.15)] backdrop-blur-md"
              title="Official Digital Security Seal"
            >
              <ShieldCheck className="h-2.5 w-2.5 text-amber-300" aria-hidden="true" />
              <span>DIGITAL SEAL</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <h3 className="font-serif text-xs font-bold tracking-wider text-slate-100 uppercase sm:text-sm">
              PRIORITY ALLOTMENT PASS
            </h3>
            <span className="font-mono text-[9px] font-semibold tracking-widest text-amber-400/80 uppercase">
              PRE-ALLOTMENT
            </span>
          </div>
        </div>

        {/* Center: Applicant Photo, Name, and Location */}
        <div className="flex items-start gap-4">
          {/* Passport Photo Frame */}
          <div className="border-brand-gold/50 relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-slate-900 shadow-md sm:h-28 sm:w-24">
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div
                data-testid="kyc-avatar-fallback"
                className="flex flex-col items-center justify-center gap-1 text-slate-400"
              >
                <User className="h-9 w-9 text-slate-400/80" aria-hidden="true" />
                <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                  PHOTO
                </span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 ring-inset" />
          </div>

          {/* Identity Metadata */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
              <BadgeCheck className="h-3 w-3 text-amber-400" aria-hidden="true" />
              PRIORITY ALLOTTEE
            </span>

            <h4 className="truncate font-sans text-base font-bold tracking-wide text-white uppercase sm:text-lg">
              {displayName}
            </h4>

            {/* City & State Location Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
              <span className="truncate font-medium">{locationText}</span>
            </div>

            {/* Document upload badges */}
            {(photoFile || panCardFile) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {photoFile && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-2.5 w-2.5" /> PHOTO READY
                  </span>
                )}
                {panCardFile && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                    <FileCheck className="h-2.5 w-2.5" /> PAN DOC ATTACHED
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Numbers Grid */}
        <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-white/10 bg-black/50 p-3.5 backdrop-blur-sm sm:grid-cols-2">
          {/* Masked Aadhaar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                AADHAAR NUMBER
              </span>
              {cleanAadhaar.length === 12 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  12 DIGITS
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-semibold tracking-widest text-slate-100 sm:text-sm">
              {maskedAadhaar}
            </p>
          </div>

          {/* PAN Number & Live Verification Checkmark */}
          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PAN NUMBER
              </span>
              {panValid && (
                <span
                  data-testid="pan-verified-badge"
                  className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" /> VERIFIED
                </span>
              )}
            </div>
            <p className="font-mono text-xs font-semibold tracking-wider text-slate-100 sm:text-sm">
              {displayPan}
            </p>
          </div>
        </div>
        {/* Footer: Official Seal & Verification Disclaimer */}
        <div className="border-brand-gold/20 flex items-center justify-between border-t pt-3 text-[10px]">
          <div className="text-brand-gold flex items-center gap-1.5 font-bold tracking-wider uppercase">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>OFFICIAL VERIFIED APPLICANT</span>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-slate-400/80 uppercase">
            PASS-ID: SVI-{last4 || '2026'}
          </span>
        </div>
      </div>
    </div>
  );
}
