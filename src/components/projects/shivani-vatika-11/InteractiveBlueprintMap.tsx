'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import type { PlotData, PlotStatus } from '@/src/data/shivaniVatika11Plots';
import { BLUEPRINT_ZONES, ZONE_PLOT_RANGES } from '@/src/data/sv11BlueprintZones';
import type { BlueprintZone } from '@/src/data/sv11BlueprintZones';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InteractiveBlueprintMapProps {
  plots: PlotData[];
  activeSectorId: string | null;
  onZoneClick: (block: string) => void;
  onZoneHover: (id: string | null) => void;
  isHindi?: boolean;
}

interface ZoneStats {
  total: number;
  available: number;
  booked: number;
  reserved: number;
}

interface TooltipState {
  zoneId: string;
  x: number;
  y: number;
}

// ─── Status color tokens ───────────────────────────────────────────────────────

const STATUS_FILL: Record<PlotStatus, string> = {
  AVAILABLE: '#22c55e',
  BOOKED: '#ef4444',
  RESERVED: '#f59e0b',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildZoneStats(plots: PlotData[], zoneId: string): ZoneStats {
  const plotNos = new Set(ZONE_PLOT_RANGES[zoneId] ?? []);
  const zoneRelevant = plots.filter((p) => plotNos.has(p.plotNo));
  return {
    total: zoneRelevant.length,
    available: zoneRelevant.filter((p) => p.status === 'AVAILABLE').length,
    booked: zoneRelevant.filter((p) => p.status === 'BOOKED').length,
    reserved: zoneRelevant.filter((p) => p.status === 'RESERVED').length,
  };
}

/** Convert flat polygon % coords to SVG points string in a 100×100 viewBox */
function polygonPoints(coords: number[]): string {
  const pts: string[] = [];
  for (let i = 0; i < coords.length; i += 2) {
    pts.push(`${coords[i]},${coords[i + 1]}`);
  }
  return pts.join(' ');
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function ZoneTooltip({
  zone,
  stats,
  x,
  y,
  isHindi,
}: {
  zone: BlueprintZone;
  stats: ZoneStats;
  x: number;
  y: number;
  isHindi: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute z-30 min-w-[180px] rounded-xl border border-white/15 bg-[#0c1019]/95 p-3 shadow-2xl backdrop-blur-md"
      style={{ left: x + 12, top: y - 10, transform: 'translateY(-50%)' }}
    >
      {/* Zone name */}
      <p className="mb-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
        {isHindi ? zone.labelHi : zone.label}
      </p>

      {/* Status breakdown */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {isHindi ? 'उपलब्ध' : 'Available'}
          </span>
          <span className="text-xs font-bold text-white">{stats.available}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            {isHindi ? 'बुक' : 'Booked'}
          </span>
          <span className="text-xs font-bold text-white">{stats.booked}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {isHindi ? 'आरक्षित' : 'Reserved'}
          </span>
          <span className="text-xs font-bold text-white">{stats.reserved}</span>
        </div>
      </div>

      {zone.block !== 'Park' && (
        <p className="mt-2.5 border-t border-white/10 pt-2 text-[10px] text-[#d4af37]">
          {isHindi ? 'क्लिक करें → ग्रिड में देखें' : 'Click → Explore in grid'}
        </p>
      )}
    </div>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function MapLegend({ isHindi }: { isHindi: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
      {(['AVAILABLE', 'BOOKED', 'RESERVED'] as PlotStatus[]).map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-300">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_FILL[s] }} />
          {isHindi
            ? s === 'AVAILABLE'
              ? 'उपलब्ध'
              : s === 'BOOKED'
                ? 'बुक'
                : 'आरक्षित'
            : s === 'AVAILABLE'
              ? 'Available'
              : s === 'BOOKED'
                ? 'Booked'
                : 'Reserved'}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MIN_ZOOM = 0.85;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.35;

export function InteractiveBlueprintMap({
  plots,
  activeSectorId,
  onZoneClick,
  onZoneHover,
  isHindi = false,
}: InteractiveBlueprintMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);

  // ── Zoom helpers ─────────────────────────────────────────────────────────

  const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => clamp(parseFloat((z + delta).toFixed(2))));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ── Wheel zoom ───────────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom((z) => clamp(parseFloat((z + delta).toFixed(2))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Pointer drag-pan ─────────────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  // ── Touch pinch-zoom ─────────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchDist.current;
      setZoom((z) => clamp(parseFloat((z * ratio).toFixed(2))));
      pinchDist.current = dist;
    }
  };

  const onTouchEnd = () => {
    pinchDist.current = null;
  };

  // ── Zone interaction ─────────────────────────────────────────────────────

  const handleZoneMouseEnter = (e: React.MouseEvent<SVGElement>, zoneId: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredZone(zoneId);
    setTooltip({
      zoneId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    onZoneHover(zoneId);
  };

  const handleZoneMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((t) => (t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : t));
  };

  const handleZoneMouseLeave = () => {
    setHoveredZone(null);
    setTooltip(null);
    onZoneHover(null);
  };

  const handleZoneClick = (zone: BlueprintZone) => {
    if (zone.block !== 'Park') onZoneClick(zone.block);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-col gap-0">
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080b11] shadow-2xl"
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Toolbar */}
        <div className="absolute top-0 right-0 left-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0c1019]/90 px-3 py-2.5 backdrop-blur-md">
          <MapLegend isHindi={isHindi} />

          <div className="flex items-center gap-1.5">
            {/* Pan hint */}
            <span className="hidden items-center gap-1 text-[10px] text-gray-500 sm:flex">
              <Move className="h-3 w-3" />
              {isHindi ? 'ड्रैग करें' : 'Drag to pan'}
            </span>

            {/* Zoom controls */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/60 p-0.5">
              <button
                type="button"
                onClick={() => zoomBy(-ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset view"
                className="px-2 py-1 font-mono text-[11px] text-gray-300 hover:text-white"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => zoomBy(ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset pan and zoom"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Zoomable / pannable canvas */}
        <div
          ref={canvasRef}
          className="relative min-h-[400px] w-full pt-12 pb-3 select-none sm:min-h-[520px]"
        >
          <div
            className="flex origin-center items-center justify-center p-4 transition-transform duration-150 ease-out will-change-transform"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
          >
            {/* Blueprint image + SVG overlay wrapper */}
            <div className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-xl border border-white/5 bg-white/5">
              {/* Blueprint image */}
              <Image
                src="/Shivani Vatika 11/master-plan-layout.webp"
                alt="Shivani Vatika 11th Master Plan Layout Blueprint"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-contain"
                draggable={false}
              />

              {/* SVG zone overlay — 100×100 viewBox maps directly to % coords */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                style={{ pointerEvents: 'none' }}
              >
                <defs>
                  {/* Gold pulsing outline for active/hovered zone */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {BLUEPRINT_ZONES.map((zone) => {
                  const isHovered = hoveredZone === zone.id || activeSectorId === zone.id;
                  const stats = buildZoneStats(plots, zone.id);
                  const availPct = stats.total > 0 ? stats.available / stats.total : 1;
                  // Status-tinted fill: available→green, partial→amber, full-booked→red
                  const statusColor =
                    stats.total === 0
                      ? zone.color
                      : availPct === 1
                        ? STATUS_FILL.AVAILABLE
                        : availPct === 0
                          ? STATUS_FILL.BOOKED
                          : STATUS_FILL.RESERVED;

                  const fillColor = isHovered ? zone.hoverColor : statusColor;
                  const fillOpacity = isHovered ? 0.45 : 0.22;
                  const strokeColor = isHovered ? '#d4af37' : zone.color;
                  const strokeWidth = isHovered ? 0.6 : 0.3;
                  const filter = isHovered ? 'url(#glow)' : undefined;

                  const commonProps = {
                    fill: fillColor,
                    fillOpacity,
                    stroke: strokeColor,
                    strokeWidth,
                    style: {
                      pointerEvents: 'all' as const,
                      cursor: zone.block !== 'Park' ? 'pointer' : 'default',
                      transition: 'fill-opacity 0.2s ease, stroke-width 0.2s ease',
                    },
                    filter,
                    onMouseEnter: (e: React.MouseEvent<SVGElement>) =>
                      handleZoneMouseEnter(e, zone.id),
                    onMouseMove: handleZoneMouseMove,
                    onMouseLeave: handleZoneMouseLeave,
                    onClick: () => handleZoneClick(zone),
                  };

                  if (zone.shape === 'polygon') {
                    return (
                      <polygon key={zone.id} points={polygonPoints(zone.coords)} {...commonProps} />
                    );
                  }

                  // rect: [x, y, w, h]
                  const [rx, ry, rw, rh] = zone.coords;
                  return (
                    <rect
                      key={zone.id}
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      rx={0.8}
                      {...commonProps}
                    />
                  );
                })}
              </svg>

              {/* Zone label badges (absolute % positioned, visible at normal zoom) */}
              {BLUEPRINT_ZONES.map((zone) => {
                const isHovered = hoveredZone === zone.id || activeSectorId === zone.id;
                if (!isHovered) return null;
                // Compute badge center from zone coords
                const [cx, cy] =
                  zone.shape === 'rect'
                    ? [zone.coords[0] + zone.coords[2] / 2, zone.coords[1] + zone.coords[3] / 2]
                    : (() => {
                        const xs = zone.coords.filter((_, i) => i % 2 === 0);
                        const ys = zone.coords.filter((_, i) => i % 2 !== 0);
                        return [
                          xs.reduce((a, b) => a + b, 0) / xs.length,
                          ys.reduce((a, b) => a + b, 0) / ys.length,
                        ];
                      })();
                return (
                  <div
                    key={`badge-${zone.id}`}
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/60 bg-[#0c1019]/90 px-2.5 py-0.5 text-[9px] font-bold tracking-wider whitespace-nowrap text-[#d4af37] uppercase shadow-lg backdrop-blur-sm"
                    style={{ left: `${cx}%`, top: `${cy}%` }}
                  >
                    {isHindi ? zone.labelHi : zone.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip &&
          (() => {
            const zone = BLUEPRINT_ZONES.find((z) => z.id === tooltip.zoneId);
            if (!zone) return null;
            const stats = buildZoneStats(plots, tooltip.zoneId);
            return (
              <ZoneTooltip
                zone={zone}
                stats={stats}
                x={tooltip.x}
                y={tooltip.y}
                isHindi={isHindi}
              />
            );
          })()}

        {/* Footer */}
        <div className="flex items-center justify-center border-t border-white/5 bg-[#0c1019]/90 px-3 py-2 text-[10px] text-gray-500">
          {isHindi
            ? 'ज़ोन पर क्लिक करें → प्लॉट ग्रिड में जाएं • ड्रैग करें → मैप घुमाएं • स्क्रॉल / पिंच → ज़ूम'
            : 'Click zone → jump to plot grid  •  Drag → pan  •  Scroll / pinch → zoom'}
        </div>
      </div>
    </div>
  );
}
