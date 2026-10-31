'use client';

import { useState, useRef, useId } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
  X,
  Phone,
  Calendar,
} from 'lucide-react';
import {
  SHIVANI_VATIKA_13_PLOTS,
  SV13PlotData,
  SV13PlotStatus,
} from '@/src/data/shivaniVatika13Plots';

interface SV13MasterPlanSectionProps {
  isHindi?: boolean;
  onBookPlot?: (plot: SV13PlotData) => void;
}

export function SV13MasterPlanSection({ isHindi = false, onBookPlot }: SV13MasterPlanSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<SV13PlotData | null>(null);
  const [filter, setFilter] = useState<'ALL' | SV13PlotStatus | 'PARK' | 'CORNER'>('ALL');
  const [hoveredPlot, setHoveredPlot] = useState<SV13PlotData | null>(null);
  const filterPatternId = useId();

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const filteredPlots = SHIVANI_VATIKA_13_PLOTS.filter((plot) => {
    if (filter === 'ALL') return true;
    if (filter === 'PARK') return plot.facing === 'Park Facing';
    if (filter === 'CORNER') return plot.facing === 'Corner';
    return plot.status === filter;
  });

  const availableCount = SHIVANI_VATIKA_13_PLOTS.filter((p) => p.status === 'AVAILABLE').length;
  const bookedCount = SHIVANI_VATIKA_13_PLOTS.filter((p) => p.status === 'BOOKED').length;
  const reservedCount = SHIVANI_VATIKA_13_PLOTS.filter((p) => p.status === 'RESERVED').length;

  // Grid arrangement for 60 plots across 4 parallel rows (15 plots per row)
  // Row 1 (Plots 1 to 15, North Facing)
  // 30 FT Road
  // Row 2 (Plots 16 to 30, South Facing)
  // Landscaped Park & Temple Center (between row 2 and 3)
  // Row 3 (Plots 31 to 45, North Facing)
  // 30 FT Road
  // Row 4 (Plots 46 to 60, South Facing)

  return (
    <section id="master-plan" className="relative scroll-mt-20 bg-slate-900 py-20 text-white">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Compass className="h-3.5 w-3.5" />
            {isHindi
              ? '60 आवासीय भूखंडों का मास्टर प्लान'
              : 'Original 60-Plot Architectural Master Plan'}
          </div>
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {isHindi ? 'शिवानी वाटिका 13th साइट लेआउट' : 'Interactive Township Master Plan'}
          </h2>
          <p className="mt-4 text-base text-slate-300 md:text-lg">
            {isHindi
              ? '30 फीट चौड़ी आंतरिक सड़कें, सुव्यवस्थित आवासीय प्लॉट्स, केंद्रीय लैंडस्केप पार्क एवं भव्य मंदिर के साथ सम्पूर्ण टाउनशिप।'
              : 'Precision architectural plan showcasing 60 demarcated residential plots, 30 ft wide internal roads, landscaped park, and community temple.'}
          </p>
        </div>

        {/* Status Counters & Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-800/80 p-4 backdrop-blur-md">
          {/* Counters */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{isHindi ? 'उपलब्ध:' : 'Available:'}</span>
              <span className="font-bold">{availableCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-medium text-rose-400">
              <ShieldCheck className="h-4 w-4" />
              <span>{isHindi ? 'बुक किया गया:' : 'Booked:'}</span>
              <span className="font-bold">{bookedCount}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-400">
              <Clock className="h-4 w-4" />
              <span>{isHindi ? 'आरक्षित:' : 'Reserved:'}</span>
              <span className="font-bold">{reservedCount}</span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isHindi ? 'सभी (60)' : 'All Plots (60)'}
            </button>
            <button
              onClick={() => setFilter('AVAILABLE')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filter === 'AVAILABLE'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isHindi ? 'केवल उपलब्ध' : 'Available'}
            </button>
            <button
              onClick={() => setFilter('PARK')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filter === 'PARK'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isHindi ? 'पार्क फेसिंग' : 'Park Facing'}
            </button>
            <button
              onClick={() => setFilter('CORNER')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filter === 'CORNER'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {isHindi ? 'कॉर्नर प्लॉट्स' : 'Corner'}
            </button>
          </div>
        </div>

        {/* Master Plan Viewer Container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl"
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                {isHindi ? 'लाइव इंटरएक्टिव 60-प्लॉट मैप' : 'Live Interactive Blueprint'}
              </span>
              <span className="hidden text-xs text-slate-400 sm:inline">
                ({isHindi ? 'प्लॉट विवरण देखने के लिए क्लिक करें' : 'Click any plot for details'})
              </span>
            </div>

            {/* Zoom & Fullscreen Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Reset Zoom"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300 transition-colors hover:bg-amber-400/20"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* SVG Canvas with Zoom & Pan */}
          <div className="relative min-h-[560px] w-full overflow-x-auto overflow-y-hidden p-6 select-none sm:p-10">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
              }}
              className="mx-auto flex min-w-[920px] justify-center"
            >
              <svg
                viewBox="0 0 1100 680"
                className="w-full max-w-[1050px] drop-shadow-xl"
                style={{ height: 'auto' }}
              >
                <defs>
                  <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <pattern
                    id={filterPatternId}
                    width="12"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 0,12 l 12,-12 M -3,3 l 6,-6 M 9,15 l 6,-6"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                {/* Outer Township Boundary Wall */}
                <rect
                  x="20"
                  y="20"
                  width="1060"
                  height="640"
                  rx="16"
                  fill="#0b1120"
                  stroke="#d4af37"
                  strokeWidth="3"
                  strokeDasharray="12 6"
                />

                {/* Boundary Wall Label */}
                <text
                  x="550"
                  y="12"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  letterSpacing="2"
                >
                  SECURE GATED BOUNDARY WALL - SHIVANI VATIKA 13TH
                </text>

                {/* 30 FT Main Entry Gate */}
                <g id="main-gate" transform="translate(480, 635)">
                  <rect
                    x="0"
                    y="0"
                    width="140"
                    height="30"
                    rx="6"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <text
                    x="70"
                    y="19"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    30 FT MAIN ENTRANCE
                  </text>
                  <polygon points="70, -4 64, 4 76, 4" fill="#38bdf8" />
                </g>

                {/* Internal Road 1 (Between Row 1 & Row 2) */}
                <rect x="50" y="160" width="1000" height="50" fill="url(#roadGradient)" rx="4" />
                <line
                  x1="60"
                  y1="185"
                  x2="1040"
                  y2="185"
                  stroke="#facc15"
                  strokeWidth="2"
                  strokeDasharray="12 8"
                />
                <text
                  x="550"
                  y="190"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="1.5"
                >
                  30 FT WIDE INTERNAL ROAD
                </text>

                {/* Central Amenities Zone: Landscaped Park & Temple */}
                <g id="central-park" transform="translate(50, 310)">
                  <rect
                    x="0"
                    y="0"
                    width="560"
                    height="75"
                    rx="10"
                    fill="#14532d"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  <text
                    x="280"
                    y="32"
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize="15"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    🌳 LANDSCAPED COMMUNITY GREEN PARK (KIDS PLAY & WALKWAY)
                  </text>
                  <text x="280" y="54" textAnchor="middle" fill="#bbf7d0" fontSize="11">
                    Walking Trail • Lush Flora • Jogging Track • Open Green Seating
                  </text>
                </g>

                {/* Grand Community Temple Zone */}
                <g id="temple-zone" transform="translate(630, 310)">
                  <rect
                    x="0"
                    y="0"
                    width="420"
                    height="75"
                    rx="10"
                    fill="#78350f"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text
                    x="210"
                    y="32"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="15"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    🛕 COMMUNITY TEMPLE COMPLEX
                  </text>
                  <text x="210" y="54" textAnchor="middle" fill="#fef3c7" fontSize="11">
                    Sacred Sanctum • Peaceful Meditation • Daily Evening Aarti
                  </text>
                </g>

                {/* Internal Road 2 (Between Row 3 & Row 4) */}
                <rect x="50" y="475" width="1000" height="50" fill="url(#roadGradient)" rx="4" />
                <line
                  x1="60"
                  y1="500"
                  x2="1040"
                  y2="500"
                  stroke="#facc15"
                  strokeWidth="2"
                  strokeDasharray="12 8"
                />
                <text
                  x="550"
                  y="505"
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="1.5"
                >
                  30 FT WIDE INTERNAL ROAD
                </text>

                {/* 60 Numbered Plots Layout */}
                {/* Row 1: Plots 1 to 15 (y: 50, height: 95) */}
                {SHIVANI_VATIKA_13_PLOTS.slice(0, 15).map((plot, idx) => {
                  const x = 50 + idx * 66.6;
                  const isMatch = filteredPlots.some((p) => p.plotNo === plot.plotNo);
                  const isHovered = hoveredPlot?.plotNo === plot.plotNo;
                  const isSelected = selectedPlot?.plotNo === plot.plotNo;

                  let fillColor = '#064e3b'; // Available (Dark emerald)
                  let strokeColor = '#10b981';
                  if (plot.status === 'BOOKED') {
                    fillColor = '#881337'; // Booked (Dark Rose)
                    strokeColor = '#f43f5e';
                  } else if (plot.status === 'RESERVED') {
                    fillColor = '#78350f'; // Reserved (Amber)
                    strokeColor = '#f59e0b';
                  }

                  if (isHovered || isSelected) {
                    strokeColor = '#facc15';
                    fillColor = '#1e293b';
                  }

                  return (
                    <g
                      key={`plot-${plot.plotNo}`}
                      transform={`translate(${x}, 50)`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedPlot(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      opacity={isMatch ? 1 : 0.25}
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="63.6"
                        height="92"
                        rx="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered || isSelected ? 3 : 1.5}
                      />
                      <text
                        x="33.3"
                        y="35"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        #{plot.plotNo}
                      </text>
                      <text x="33.3" y="52" textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        {plot.sizeSqYd} Yds
                      </text>
                      <text
                        x="33.3"
                        y="70"
                        textAnchor="middle"
                        fill={plot.status === 'AVAILABLE' ? '#6ee7b7' : '#fda4af'}
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {plot.status === 'AVAILABLE' ? 'AVAIL' : plot.status}
                      </text>
                    </g>
                  );
                })}

                {/* Row 2: Plots 16 to 30 (y: 220, height: 75) */}
                {SHIVANI_VATIKA_13_PLOTS.slice(15, 30).map((plot, idx) => {
                  const x = 50 + idx * 66.6;
                  const isMatch = filteredPlots.some((p) => p.plotNo === plot.plotNo);
                  const isHovered = hoveredPlot?.plotNo === plot.plotNo;
                  const isSelected = selectedPlot?.plotNo === plot.plotNo;

                  let fillColor = '#064e3b';
                  let strokeColor = '#10b981';
                  if (plot.status === 'BOOKED') {
                    fillColor = '#881337';
                    strokeColor = '#f43f5e';
                  } else if (plot.status === 'RESERVED') {
                    fillColor = '#78350f';
                    strokeColor = '#f59e0b';
                  }

                  if (isHovered || isSelected) {
                    strokeColor = '#facc15';
                    fillColor = '#1e293b';
                  }

                  return (
                    <g
                      key={`plot-${plot.plotNo}`}
                      transform={`translate(${x}, 220)`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedPlot(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      opacity={isMatch ? 1 : 0.25}
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="63.6"
                        height="72"
                        rx="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered || isSelected ? 3 : 1.5}
                      />
                      <text
                        x="33.3"
                        y="30"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        #{plot.plotNo}
                      </text>
                      <text x="33.3" y="46" textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        {plot.sizeSqYd} Yds
                      </text>
                      <text
                        x="33.3"
                        y="62"
                        textAnchor="middle"
                        fill={plot.status === 'AVAILABLE' ? '#6ee7b7' : '#fda4af'}
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {plot.status === 'AVAILABLE' ? 'AVAIL' : plot.status}
                      </text>
                    </g>
                  );
                })}

                {/* Row 3: Plots 31 to 45 (y: 395, height: 70) */}
                {SHIVANI_VATIKA_13_PLOTS.slice(30, 45).map((plot, idx) => {
                  const x = 50 + idx * 66.6;
                  const isMatch = filteredPlots.some((p) => p.plotNo === plot.plotNo);
                  const isHovered = hoveredPlot?.plotNo === plot.plotNo;
                  const isSelected = selectedPlot?.plotNo === plot.plotNo;

                  let fillColor = '#064e3b';
                  let strokeColor = '#10b981';
                  if (plot.status === 'BOOKED') {
                    fillColor = '#881337';
                    strokeColor = '#f43f5e';
                  } else if (plot.status === 'RESERVED') {
                    fillColor = '#78350f';
                    strokeColor = '#f59e0b';
                  }

                  if (isHovered || isSelected) {
                    strokeColor = '#facc15';
                    fillColor = '#1e293b';
                  }

                  return (
                    <g
                      key={`plot-${plot.plotNo}`}
                      transform={`translate(${x}, 395)`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedPlot(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      opacity={isMatch ? 1 : 0.25}
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="63.6"
                        height="68"
                        rx="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered || isSelected ? 3 : 1.5}
                      />
                      <text
                        x="33.3"
                        y="28"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        #{plot.plotNo}
                      </text>
                      <text x="33.3" y="44" textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        {plot.sizeSqYd} Yds
                      </text>
                      <text
                        x="33.3"
                        y="58"
                        textAnchor="middle"
                        fill={plot.status === 'AVAILABLE' ? '#6ee7b7' : '#fda4af'}
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {plot.status === 'AVAILABLE' ? 'AVAIL' : plot.status}
                      </text>
                    </g>
                  );
                })}

                {/* Row 4: Plots 46 to 60 (y: 535, height: 85) */}
                {SHIVANI_VATIKA_13_PLOTS.slice(45, 60).map((plot, idx) => {
                  const x = 50 + idx * 66.6;
                  const isMatch = filteredPlots.some((p) => p.plotNo === plot.plotNo);
                  const isHovered = hoveredPlot?.plotNo === plot.plotNo;
                  const isSelected = selectedPlot?.plotNo === plot.plotNo;

                  let fillColor = '#064e3b';
                  let strokeColor = '#10b981';
                  if (plot.status === 'BOOKED') {
                    fillColor = '#881337';
                    strokeColor = '#f43f5e';
                  } else if (plot.status === 'RESERVED') {
                    fillColor = '#78350f';
                    strokeColor = '#f59e0b';
                  }

                  if (isHovered || isSelected) {
                    strokeColor = '#facc15';
                    fillColor = '#1e293b';
                  }

                  return (
                    <g
                      key={`plot-${plot.plotNo}`}
                      transform={`translate(${x}, 535)`}
                      className="cursor-pointer transition-all duration-150"
                      onClick={() => setSelectedPlot(plot)}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      opacity={isMatch ? 1 : 0.25}
                    >
                      <rect
                        x="1.5"
                        y="1.5"
                        width="63.6"
                        height="82"
                        rx="4"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered || isSelected ? 3 : 1.5}
                      />
                      <text
                        x="33.3"
                        y="32"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        #{plot.plotNo}
                      </text>
                      <text x="33.3" y="48" textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        {plot.sizeSqYd} Yds
                      </text>
                      <text
                        x="33.3"
                        y="66"
                        textAnchor="middle"
                        fill={plot.status === 'AVAILABLE' ? '#6ee7b7' : '#fda4af'}
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {plot.status === 'AVAILABLE' ? 'AVAIL' : plot.status}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Site Plan Legend */}
          <div className="border-t border-white/10 bg-slate-900/90 p-5 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-emerald-400 bg-emerald-700" />
                <span>{isHindi ? 'उपलब्ध भूखंड (Available)' : 'Available Plots'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-rose-400 bg-rose-800" />
                <span>{isHindi ? 'बुक किया गया (Booked)' : 'Booked Plots'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-amber-400 bg-amber-800" />
                <span>{isHindi ? 'आरक्षित (Reserved)' : 'Reserved'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-8 rounded border border-slate-600 bg-slate-800" />
                <span>{isHindi ? '30 फीट चौड़ी सड़कें' : '30 Ft Internal Roads'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-green-400 bg-green-700" />
                <span>{isHindi ? 'लैंडस्केप पार्क' : 'Landscaped Park'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-yellow-400 bg-amber-700" />
                <span>{isHindi ? 'मंदिर परिसर' : 'Community Temple'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded border border-sky-400 bg-sky-600" />
                <span>{isHindi ? 'मेन गेट (30 फीट)' : '30 Ft Main Gate'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Plot Detail Modal / Drawer */}
        {selectedPlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/30 bg-slate-900 p-6 text-white shadow-2xl sm:p-8">
              <button
                onClick={() => setSelectedPlot(null)}
                className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                <Sparkles className="h-3 w-3" />
                {isHindi
                  ? `प्लॉट #${selectedPlot.plotNo} विवरण`
                  : `Plot #${selectedPlot.plotNo} Details`}
              </div>

              <h3 className="font-serif text-2xl font-bold text-white">
                {isHindi
                  ? `प्लॉट संख्या #${selectedPlot.plotNo}`
                  : `Residential Plot #${selectedPlot.plotNo}`}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Shivani Vatika 13th • Sambhar–Phulera, Rajasthan
              </p>

              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    selectedPlot.status === 'AVAILABLE'
                      ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : selectedPlot.status === 'BOOKED'
                        ? 'border border-rose-500/40 bg-rose-500/10 text-rose-400'
                        : 'border border-amber-500/40 bg-amber-500/10 text-amber-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {selectedPlot.status}
                </span>
                {selectedPlot.highlight && (
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                    {selectedPlot.highlight}
                  </span>
                )}
              </div>

              {/* Specification Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-slate-800/60 p-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400">{isHindi ? 'प्लॉट साइज:' : 'Plot Size:'}</span>
                  <p className="mt-0.5 font-bold text-white">{selectedPlot.sizeSqYd} Sq. Yards</p>
                </div>
                <div>
                  <span className="text-slate-400">
                    {isHindi ? 'आयाम (Dimensions):' : 'Dimensions:'}
                  </span>
                  <p className="mt-0.5 font-bold text-white">{selectedPlot.dimensions}</p>
                </div>
                <div>
                  <span className="text-slate-400">{isHindi ? 'दिशा (Facing):' : 'Facing:'}</span>
                  <p className="mt-0.5 font-bold text-white">{selectedPlot.facing}</p>
                </div>
                <div>
                  <span className="text-slate-400">{isHindi ? 'सड़क चौड़ाई:' : 'Road Width:'}</span>
                  <p className="mt-0.5 font-bold text-white">{selectedPlot.roadWidth}</p>
                </div>
              </div>

              {/* Installment Pricing Highlight */}
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-amber-700/15 p-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                      {isHindi ? 'आसान मासिक किस्त' : 'Flexible Monthly Installment'}
                    </span>
                    <p className="mt-1 text-2xl font-black text-white">
                      ₹9,999 <span className="text-xs font-normal text-slate-300">/ Month</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">
                      {isHindi ? 'किस्त अवधि' : 'Tenure'}
                    </span>
                    <p className="text-sm font-bold text-amber-300">40 Months</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    const plot = selectedPlot;
                    setSelectedPlot(null);
                    if (onBookPlot) onBookPlot(plot);
                    else {
                      const el = document.getElementById('enquiry');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
                >
                  <Calendar className="h-4 w-4" />
                  {isHindi
                    ? `प्लॉट #${selectedPlot.plotNo} बुक / साइट विजिट`
                    : `Enquire for Plot #${selectedPlot.plotNo}`}
                </button>
                <a
                  href={`https://wa.me/917300007643?text=${encodeURIComponent(
                    `Hello SVI Infra, I am interested in Shivani Vatika 13th Plot #${selectedPlot.plotNo} (${selectedPlot.sizeSqYd} sq yds). Please share details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/25"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
