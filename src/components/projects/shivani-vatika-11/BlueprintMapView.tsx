'use client';

import { useState } from 'react';
import { Download, ArrowRight, Building2, Trees, Compass, Sparkles } from 'lucide-react';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';
import { InteractiveBlueprintMap } from './InteractiveBlueprintMap';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlueprintMapViewProps {
  /** Fired when user clicks a zone or "Explore in Grid" – switches to grid view */
  onSwitchToGrid?: (blockFilter?: string) => void;
  /** Live plot data from useLivePlotStatus – drives status overlays */
  plots?: PlotData[];
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
  /** Matches BlueprintZone block value for zone-highlight sync */
  blockTarget: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ─── Static sector metadata ───────────────────────────────────────────────────

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
    blockTarget: 'commercial',
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
    blockTarget: 'a-block',
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
    blockTarget: 'main-avenue',
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
    blockTarget: 'green-park',
    icon: Trees,
  },
];

/** Maps sector blockTarget → PlotBlock for the grid filter */
const BLOCK_TARGET_MAP: Record<string, string> = {
  commercial: 'Commercial',
  'a-block': 'A-Block',
  'main-avenue': 'Residential',
  'green-park': 'Residential',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BlueprintMapView({
  onSwitchToGrid,
  plots = [],
  isHindi = false,
}: BlueprintMapViewProps) {
  /** The zone id currently highlighted (from card hover or map zone hover) */
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);

  const handleZoneClick = (blockTarget: string) => {
    const plotBlock = BLOCK_TARGET_MAP[blockTarget] ?? blockTarget;
    onSwitchToGrid?.(plotBlock);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* PDF download link row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#d4af37]" />
          <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            {isHindi ? 'इंटरएक्टिव मास्टर मैप' : 'Interactive Master Plan'}
          </span>
        </div>
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

      {/* Interactive map */}
      <InteractiveBlueprintMap
        plots={plots}
        activeSectorId={activeSectorId}
        onZoneClick={handleZoneClick}
        onZoneHover={setActiveSectorId}
        isHindi={isHindi}
      />

      {/* Sector cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
            {isHindi ? 'टाउनशिप सेक्टर्स व हॉटस्पॉट्स' : 'Township Sectors & Highlights'}
          </h3>
          <span className="text-xs text-gray-400">
            {isHindi ? 'सेक्टर चुनें → मैप हाइलाइट' : 'Hover sector → map highlight'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const isActive = activeSectorId === sector.id;

            return (
              <div
                key={sector.id}
                onMouseEnter={() => setActiveSectorId(sector.id)}
                onMouseLeave={() => setActiveSectorId(null)}
                className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  isActive
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
                    onClick={() =>
                      onSwitchToGrid?.(BLOCK_TARGET_MAP[sector.blockTarget] ?? sector.blockTarget)
                    }
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

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-500">
        <span>
          {isHindi
            ? 'टिप: मैप पर ज़ोन क्लिक करें या नीचे सेक्टर कार्ड चुनें'
            : 'Tip: Click a zone on the map or use sector cards below.'}
        </span>
        <button
          type="button"
          onClick={() => onSwitchToGrid?.()}
          className="inline-flex items-center gap-1 font-medium text-[#d4af37] hover:underline"
        >
          <span>{isHindi ? 'सभी 230 प्लॉट्स ग्रिड में देखें' : 'View all 230 plots in Grid'}</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
