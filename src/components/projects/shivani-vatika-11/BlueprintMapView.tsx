'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Building2,
  Trees,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface BlueprintMapViewProps {
  onSwitchToGrid?: (blockFilter?: string) => void;
  isHindi?: boolean;
}

interface SectorInfo {
  id: string;
  name: string;
  nameHi: string;
  badge: string;
  badgeHi: string;
  specs: string;
  specsHi: string;
  highlight: string;
  highlightHi: string;
  blockTarget: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTORS: SectorInfo[] = [
  {
    id: 'commercial',
    name: 'Commercial Frontage',
    nameHi: 'कमर्शियल फ्रंट',
    badge: '160 Ft Highway',
    badgeHi: '160 फीट हाईवे',
    specs: '12 Prime Retail Shops (Shop-1 to Shop-12) | 120-144 Sq.Yd.',
    specsHi: '12 प्राइम दुकानें (Shop-1 से Shop-12) | 120-144 वर्ग गज',
    highlight: 'Maximum footfall visibility along state mega-highway',
    highlightHi: 'स्टेट हाईवे पर अधिकतम विजिबिलिटी व कमर्शियल वैल्यू',
    blockTarget: 'Commercial',
    icon: Building2,
  },
  {
    id: 'a-block',
    name: 'A-Block Premium',
    nameHi: 'ए-ब्लॉक प्रीमियम',
    badge: '50 Demarcated Units',
    badgeHi: '50 सीमांकित यूनिट्स',
    specs: "Plots A-1 to A-50 | Compact 80 Gaj (20'x36') Form Factor",
    specsHi: "प्लॉट A-1 से A-50 | 80 गज (20'x36') कॉम्पैक्ट साइज",
    highlight: 'East/West facing plots along 30 ft paved internal lanes',
    highlightHi: '30 फीट पेवर रोड पर पूर्व/पश्चिम मुखी प्लॉट्स',
    blockTarget: 'A-Block',
    icon: Sparkles,
  },
  {
    id: 'main-avenue',
    name: 'Main Avenue Spine',
    nameHi: 'मेन एवेन्यू स्पाइन',
    badge: '40 Ft Grand Entrance',
    badgeHi: '40 फीट मुख्य द्वार',
    specs: 'Plots 1 to 40 | 100 Gaj to 150 Gaj Standard Duplex Layouts',
    specsHi: 'प्लॉट 1 से 40 | 100 गज से 150 गज स्टैंडर्ड डुप्लेक्स',
    highlight: 'Central boulevard with direct access to gated entrance',
    highlightHi: 'गेटेड एंट्री से सीधी कनेक्टिविटी वाली मुख्य रोड',
    blockTarget: 'Residential',
    icon: Compass,
  },
  {
    id: 'green-park',
    name: 'Green Parks & Open Space',
    nameHi: 'ग्रीन पार्क्स एवं खुला क्षेत्र',
    badge: 'Demarcated Greenery',
    badgeHi: 'सुंदर हरित क्षेत्र',
    specs: 'Multiple landscaped parks surrounded by residential plots',
    specsHi: 'आवासीय प्लॉट्स से घिरे सुंदर एवं विकसित पार्क्स',
    highlight: 'Park-facing premium inventory offering maximum fresh air & serenity',
    highlightHi: 'पार्क फेसिंग प्लॉट्स - स्वच्छ हवा और शांत वातावरण',
    blockTarget: 'Residential',
    icon: Trees,
  },
];

export function BlueprintMapView({
  onSwitchToGrid,
  isHindi = false,
}: BlueprintMapViewProps): React.JSX.Element {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const clampZoom = (next: number): number => Math.min(Math.max(next, 1), 2.5);

  return (
    <div className="flex flex-col gap-6">
      {/* Blueprint Visual Canvas Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080b11] shadow-2xl">
        {/* Top Control Overlay: Title + Zoom controls + PDF Link */}
        <div className="absolute top-0 right-0 left-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0c1019]/80 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#d4af37]" />
            <span className="text-xs font-semibold tracking-wider text-white uppercase">
              {isHindi ? 'सोसाइटी मास्टर मैप लेआउट' : 'Approved Master Plan Blueprint'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/60 p-0.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => clampZoom(Number((z - 0.25).toFixed(2))))}
                disabled={zoomLevel <= 1}
                aria-label="Zoom out"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                aria-label="Reset zoom"
                className="px-2 py-1 font-mono text-[11px] text-gray-300 hover:text-white"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => clampZoom(Number((z + 0.25).toFixed(2))))}
                disabled={zoomLevel >= 2.5}
                aria-label="Zoom in"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Master Blueprint PDF Download Link */}
            <a
              href="/Shivani%20Vatika%2011/master-plan-layout.pdf"
              download="Shivani-Vatika-11-Master-Plan-Layout.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Master Blueprint PDF"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1.5 text-xs font-medium text-[#d4af37] transition-all hover:border-[#d4af37] hover:bg-[#d4af37]/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isHindi ? 'डाउनलोड ब्लूप्रिंट PDF' : 'Download Blueprint PDF'}
              </span>
              <span className="sm:hidden">PDF</span>
            </a>
          </div>
        </div>

        {/* Blueprint Visual Area with Scroll/Pan & Scale */}
        <div className="relative min-h-[440px] w-full overflow-auto pt-14 pb-4">
          <div
            className="flex min-w-[700px] origin-top-left items-center justify-center p-4 transition-transform duration-200 ease-out sm:origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-xl border border-white/5 bg-black/40">
              <Image
                src="/Shivani%20Vatika%2011/master-plan-layout.webp"
                alt="Shivani Vatika 11th Master Plan Layout Blueprint"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-contain"
              />

              {/* Highway Banner Overlay */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full border border-amber-500/30 bg-black/75 px-4 py-1 text-[11px] font-semibold tracking-wider text-[#d4af37] uppercase shadow-lg backdrop-blur-sm">
                160 Ft State Highway Frontage
              </div>

              {/* Main Entrance Marker */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 rounded-md border border-white/20 bg-[#0c1019]/90 px-2.5 py-0.5 text-[10px] font-medium text-gray-300">
                40 Ft Main Boulevard Entrance
              </div>
            </div>
          </div>
        </div>

        {/* Footer Hint Bar */}
        <div className="flex items-center justify-between border-t border-white/5 bg-[#0c1019]/90 px-4 py-2.5 text-[11px] text-gray-400">
          <span>
            {isHindi
              ? 'टिप: अधिक विवरण देखने के लिए ज़ूम करें या नीचे सेक्टर कार्ड चुनें'
              : 'Tip: Use zoom controls to inspect unit dimensions, or click sector cards below.'}
          </span>
          <button
            type="button"
            onClick={() => onSwitchToGrid?.()}
            className="inline-flex items-center gap-1 font-medium text-[#d4af37] hover:underline"
          >
            <span>
              {isHindi ? 'सभी 230 प्लॉट्स ग्रिड में देखें' : 'View all 230 plots in Grid'}
            </span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Sector Hotspot Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
            {isHindi ? 'टाउनशिप सेक्टर्स व हॉटस्पॉट्स' : 'Township Sectors & Highlights'}
          </h3>
          <span className="text-xs text-gray-400">
            {isHindi ? 'त्वरित फ़िल्टर' : 'Click sector to explore in grid'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const isHovered = activeSector === sector.id;

            return (
              <div
                key={sector.id}
                onMouseEnter={() => setActiveSector(sector.id)}
                onMouseLeave={() => setActiveSector(null)}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  isHovered
                    ? '-translate-y-0.5 border-[#d4af37]/60 bg-[#0c1019] shadow-lg shadow-[#d4af37]/5'
                    : 'border-white/10 bg-[#0c1019]/80 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#d4af37]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white transition-colors group-hover:text-[#d4af37]">
                          {isHindi ? sector.nameHi : sector.name}
                        </h4>
                        <span className="text-[10px] text-gray-400">
                          {isHindi ? sector.badgeHi : sector.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-medium text-gray-300">
                    {isHindi ? sector.specsHi : sector.specs}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                    {isHindi ? sector.highlightHi : sector.highlight}
                  </p>
                </div>

                <div className="mt-4 border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={() => onSwitchToGrid?.(sector.blockTarget)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-gray-200 transition-all hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 hover:text-[#d4af37]"
                  >
                    <span>{isHindi ? 'ग्रिड में देखें' : 'Explore in Grid'}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
