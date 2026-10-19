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
  const hasLocation = Boolean(city?.trim() || state?.trim());
  const locationText = hasLocation
    ? [city?.trim().toUpperCase(), state?.trim().toUpperCase()].filter(Boolean).join(', ')
    : 'LOCATION NOT SET';

  // Display Name
  const trimmedName = (fullName || '').trim().toUpperCase();
  const displayName = trimmedName || 'APPLICANT NAME';

  return (
    <div
      role="region"
      aria-label="Digital Applicant KYC Identity Pass"
      className={`border-brand-gold/40 ring-brand-gold/20 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b0c10] p-5 text-white shadow-2xl ring-1 backdrop-blur-xl sm:p-6 ${className}`}
    >
      {/* Subtle Geometric Security Mesh Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-10"
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Header: SVI Infra Branding & Official Hologram */}
        <div className="border-brand-gold/20 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="border-brand-gold/50 bg-brand-gold/15 flex h-8 w-8 items-center justify-center rounded-lg border shadow-[0_0_10px_rgba(212,175,55,0.25)]">
              <ShieldCheck className="text-brand-gold h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
                SVI INFRA SOLUTIONS
              </p>
              <h3 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase sm:text-sm">
                PRIORITY ALLOTMENT PASS
              </h3>
            </div>
          </div>

          {/* Official Security Seal */}
          <div
            className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold relative flex items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(212,175,55,0.15)] backdrop-blur-md"
            title="Official Digital Security Seal"
          >
            <ShieldCheck className="text-brand-gold h-3 w-3" aria-hidden="true" />
            <span>DIGITAL SEAL</span>
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
            <span className="bg-brand-gold/15 text-brand-gold-light inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              <BadgeCheck className="text-brand-gold h-3 w-3" aria-hidden="true" />
              PRIORITY ALLOTTEE
            </span>

            <h4 className="truncate font-sans text-base font-bold tracking-wide text-white uppercase sm:text-lg">
              {displayName}
            </h4>

            {/* City & State Location Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="text-brand-gold h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{locationText}</span>
            </div>

            {/* Document upload badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {photoFile && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> PHOTO READY
                </span>
              )}
              {panCardFile && (
                <span className="inline-flex items-center gap-1 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
                  <FileCheck className="h-2.5 w-2.5" /> PAN DOC ATTACHED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security Numbers Grid */}
        <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm sm:grid-cols-2">
          {/* Masked Aadhaar */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              AADHAAR NUMBER
            </span>
            <p className="font-mono text-xs font-semibold tracking-widest text-slate-100 sm:text-sm">
              {maskedAadhaar}
            </p>
          </div>

          {/* PAN Number & Live Verification Checkmark */}
          <div className="space-y-0.5">
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
