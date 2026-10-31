'use client';

import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface SV13HeroSectionProps {
  isHindi?: boolean;
  onBookSiteVisit: () => void;
  onDownloadBrochure: () => void;
}

export function SV13HeroSection({
  isHindi = false,
  onBookSiteVisit,
  onDownloadBrochure,
}: SV13HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-slate-950 text-white">
      {/* Background Hero Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Shivani Vatika 11/gate.webp"
          alt="Shivani Vatika 13th - Grand Entrance Gate"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.45] transition-transform duration-1000 ease-out hover:scale-105"
        />
        {/* Layered Vignette and Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
      </div>

      {/* Decorative Golden Accent Lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-4 pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Top Badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {isHindi ? '60 विशिष्ट आवासीय भूखंड' : '60 Residential Plots • Boutique Township'}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{isHindi ? 'सांभर फुलेरा, राजस्थान' : 'Sambhar–Phulera, Rajasthan'}</span>
            </div>
          </div>

          {/* Project Title */}
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            SHIVANI VATIKA <span className="text-amber-400">13TH</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 font-sans text-xl font-medium tracking-wide text-amber-200/90 sm:text-2xl">
            {isHindi
              ? 'प्रीमियम आवासीय प्लॉट्स • सुखद भविष्य की शुरुआत'
              : 'Premium Residential Plots'}
          </p>

          {/* Tagline */}
          <blockquote className="mt-3 border-l-2 border-amber-400/80 pl-4 text-base text-slate-300 italic sm:text-lg">
            &ldquo;
            {isHindi ? 'आपकी नई कहानी यहीं से शुरू होती है।' : 'Your Next Chapter Starts Here.'}
            &rdquo;
          </blockquote>

          {/* Key Metric Highlights */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-white/10 py-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">
                {isHindi ? 'कुल प्लॉट्स' : 'Total Plots'}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">60</p>
              <span className="text-[11px] text-amber-400">
                {isHindi ? 'रेजिडेंशियल यूनिट्स' : 'Gated Demarcated'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">
                {isHindi ? 'आंतरिक सड़क' : 'Road Width'}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">30 Ft</p>
              <span className="text-[11px] text-emerald-400">
                {isHindi ? 'चौड़ी सड़कें' : 'Wide Internal Roads'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">
                {isHindi ? 'मासिक किस्त' : 'Installment Plan'}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">₹9,999</p>
              <span className="text-[11px] text-amber-400">
                {isHindi ? '40 महीनों के लिए' : 'For 40 Months'}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">
                {isHindi ? 'दस्तावेजीकरण' : 'Registry'}
              </p>
              <p className="mt-1 text-2xl font-bold text-white">100%</p>
              <span className="text-[11px] text-sky-400">
                {isHindi ? 'दाखिल-खारिज सहित' : 'Clear & Transparent'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* CTA 1: Explore Project */}
            <a
              href="#overview"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 hover:shadow-amber-400/30"
            >
              <span>{isHindi ? 'प्रोजेक्ट देखें' : 'Explore Project'}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            {/* CTA 2: Download Brochure */}
            <button
              onClick={onDownloadBrochure}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>{isHindi ? 'ब्रोशर डाउनलोड करें' : 'Download Brochure'}</span>
            </button>

            {/* CTA 3: Book Site Visit */}
            <button
              onClick={onBookSiteVisit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 text-sm font-semibold text-amber-300 backdrop-blur-md transition-all hover:bg-amber-400/20"
            >
              <Calendar className="h-4 w-4" />
              <span>{isHindi ? 'साइट विजिट बुक करें' : 'Book Site Visit'}</span>
            </button>
          </div>

          {/* Value Assurance Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>
                {isHindi ? 'आधिकारिक एसवीआई इंफ्रा गारंटी' : 'Official SVI Infra Project'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>
                {isHindi ? 'मुफ्त एसी कैब साइट विजिट' : 'Complimentary Doorstep Cab Visit'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-sky-400" />
              <span>
                {isHindi ? 'फुलेरा जंक्शन के नजदीक' : 'Near Phulera DMIC Logistics Corridor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
