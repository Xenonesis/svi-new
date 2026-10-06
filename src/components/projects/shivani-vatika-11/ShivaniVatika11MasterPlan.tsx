'use client';

import React, { useState } from 'react';
import type { PlotData, PlotBlock } from '@/src/data/shivaniVatika11Plots';
import { SHIVANI_VATIKA_11_PLOTS } from '@/src/data/shivaniVatika11Plots';
import { useLivePlotStatus } from '@/src/lib/hooks/useLivePlotStatus';
import { PlotMatrixGrid } from './PlotMatrixGrid';
import { BlueprintMapView } from './BlueprintMapView';
import { PlotDetailDrawer } from './PlotDetailDrawer';
import { SiteVisitModal } from '@/src/components/layout/SiteVisitModal';
import { Map, LayoutGrid, CheckCircle2, ShieldAlert, Clock, Sparkles } from 'lucide-react';

export interface ShivaniVatika11MasterPlanProps {
  isHindi?: boolean;
}

export function ShivaniVatika11MasterPlan({
  isHindi = false,
}: ShivaniVatika11MasterPlanProps): React.JSX.Element {
  const { plots, loading, bookedCount, availableCount, reservedCount } =
    useLivePlotStatus(SHIVANI_VATIKA_11_PLOTS);

  const [activeView, setActiveView] = useState<'blueprint' | 'grid'>('blueprint');
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [siteVisitPlot, setSiteVisitPlot] = useState<PlotData | null>(null);
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState<boolean>(false);

  const handleSwitchToGrid = (block?: PlotBlock | string): void => {
    setSelectedBlock(block ?? 'All');
    setActiveView('grid');
  };

  return (
    <section
      id="master-plan-section"
      className="relative w-full border-y border-white/10 bg-[#080b11] py-14 text-white sm:py-20"
    >
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#d4af37]/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isHindi ? 'लाइव ऑलॉटमेंट सिंक्रोनाइज़ेशन' : 'Live Allotment Synchronization'}
            </span>
          </div>

          <h2 className="font-heading mt-4 text-2xl font-bold tracking-tight text-[#d4af37] sm:text-3xl md:text-4xl">
            {isHindi
              ? 'इंटरएक्टिव मास्टर प्लान एवं लाइव प्लॉट उपलब्धता'
              : 'Interactive Master Plan & Live Plot Availability'}
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-gray-300 sm:text-base">
            {isHindi
              ? '230 सीमांकित आवासीय एवं व्यावसायिक यूनिट्स की रियल-टाइम स्थिति देखें एवं तुरंत आरक्षण करें।'
              : 'Explore 230 demarcated residential & commercial units with real-time Supabase allotment sync and instant reservation.'}
          </p>

          {/* Live KPI Metric Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            {/* Total Units */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c1019] px-3.5 py-2 text-xs font-medium text-gray-200 shadow-sm">
              <span className="text-gray-400">{isHindi ? 'कुल यूनिट्स:' : 'Total Units:'}</span>
              <span className="font-bold text-white">230</span>
            </div>

            {/* Available */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-400 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isHindi ? 'उपलब्ध:' : 'Available:'}</span>
              <span className="font-bold">{loading ? '...' : availableCount}</span>
            </div>

            {/* Booked */}
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-400 shadow-sm">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{isHindi ? 'बुक:' : 'Booked:'}</span>
              <span className="font-bold">{loading ? '...' : bookedCount}</span>
            </div>

            {/* Reserved */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-400 shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{isHindi ? 'आरक्षित:' : 'Reserved:'}</span>
              <span className="font-bold">{loading ? '...' : reservedCount}</span>
            </div>
          </div>

          {/* Dual-View Mode Toggle Pills */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-white/10 bg-[#0c1019] p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveView('blueprint')}
              aria-label="Blueprint View"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                activeView === 'blueprint'
                  ? 'bg-[#d4af37] text-[#080b11] shadow-md shadow-[#d4af37]/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>{isHindi ? 'ब्लूप्रिंट दृश्य (Blueprint View)' : 'Blueprint View'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('grid')}
              aria-label="Plot Grid Matrix"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                activeView === 'grid'
                  ? 'bg-[#d4af37] text-[#080b11] shadow-md shadow-[#d4af37]/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {isHindi
                  ? `प्लॉट ग्रिड मैट्रिक्स (${plots.length})`
                  : `Plot Grid Matrix (${plots.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* View Mode Canvas */}
        <div className="mt-10">
          {activeView === 'blueprint' ? (
            <BlueprintMapView onSwitchToGrid={handleSwitchToGrid} isHindi={isHindi} />
          ) : (
            <PlotMatrixGrid
              plots={plots}
              onSelectPlot={(plot) => setSelectedPlot(plot)}
              isHindi={isHindi}
              initialBlock={selectedBlock}
            />
          )}
        </div>
      </div>

      {/* Slide-Over Plot Details Drawer */}
      <PlotDetailDrawer
        plot={selectedPlot}
        onClose={() => setSelectedPlot(null)}
        onBookSiteVisit={(plot) => {
          setSiteVisitPlot(plot);
          setSelectedPlot(null);
          setIsSiteVisitOpen(true);
        }}
      />

      {/* Frictionless Free AC Cab Site Visit Booking Modal */}
      <SiteVisitModal
        isOpen={isSiteVisitOpen}
        onClose={() => {
          setIsSiteVisitOpen(false);
          setSiteVisitPlot(null);
        }}
        prefilledProject="Shivani Vatika 11th"
        prefilledPlot={siteVisitPlot?.plotNo}
      />
    </section>
  );
}
