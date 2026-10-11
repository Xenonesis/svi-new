/**
 * SVG overlay zone definitions for the Shivani Vatika 11 blueprint map.
 * Coordinates are percentage-based (0–100) relative to the image bounds,
 * matching `master-plan-layout.webp` (aspect-ratio 16/10).
 *
 * Zones are intentionally sector-level (not per-plot) so they remain
 * clickable at any zoom level and degrade gracefully on mobile.
 */

import type { PlotBlock } from './shivaniVatika11Plots';

export type ZoneShape = 'rect' | 'polygon';

export interface BlueprintZone {
  /** Unique zone identifier, matches SECTOR id in BlueprintMapView */
  id: string;
  label: string;
  labelHi: string;
  /** Which plot block this zone corresponds to */
  block: PlotBlock | 'Park';
  shape: ZoneShape;
  /**
   * For 'rect': [x, y, width, height] as percentages
   * For 'polygon': flat [x1,y1, x2,y2, …] pairs as percentages
   */
  coords: number[];
  /** Tailwind/hex color used for zone fill (semi-transparent via fillOpacity) */
  color: string;
  /** Slightly brighter color for hover/active state */
  hoverColor: string;
}

/**
 * 4 macro-zones mapped from visual inspection of master-plan-layout.webp.
 * All coordinates are % of [imageWidth, imageHeight].
 *
 * Layout reference (the actual webp is ~16:10):
 *   - Top 12%: title / header text only
 *   - Left diagonal strip (bottom-left): 160 Ft Highway + commercial shops
 *   - Upper-right quadrant: A-Block plots (labeled SHIVANI VATIKA-11th A-BLOCK)
 *   - Center-left grid: Main residential plots 1–168
 *   - Small rectangles: park/open-space pockets interspersed
 */
export const BLUEPRINT_ZONES: BlueprintZone[] = [
  {
    id: 'commercial',
    label: 'Commercial Frontage',
    labelHi: 'कमर्शियल फ्रंट',
    block: 'Commercial',
    shape: 'polygon',
    // Diagonal highway strip along bottom-left edge
    coords: [
      2,
      60, // top-left of diagonal
      32,
      58, // top-right diagonal start
      48,
      73, // top-right diagonal end
      48,
      98, // bottom-right
      2,
      98, // bottom-left
    ],
    color: '#f59e0b',
    hoverColor: '#fbbf24',
  },
  {
    id: 'a-block',
    label: 'A-Block Premium',
    labelHi: 'ए-ब्लॉक प्रीमियम',
    block: 'A-Block',
    shape: 'rect',
    // Right quadrant: A-1 to A-50 cluster
    coords: [62, 8, 35, 82],
    color: '#6366f1',
    hoverColor: '#818cf8',
  },
  {
    id: 'main-avenue',
    label: 'Main Avenue Spine',
    labelHi: 'मेन एवेन्यू स्पाइन',
    block: 'Residential',
    shape: 'rect',
    // Center-left grid: residential plots 1–168
    coords: [10, 8, 52, 58],
    color: '#22c55e',
    hoverColor: '#4ade80',
  },
  {
    id: 'green-park',
    label: 'Green Parks & Open Space',
    labelHi: 'ग्रीन पार्क्स एवं खुला क्षेत्र',
    block: 'Park',
    shape: 'rect',
    // Approximate park pockets (center-right and dispersed)
    coords: [10, 65, 52, 28],
    color: '#10b981',
    hoverColor: '#34d399',
  },
];

/** Plot number ranges that belong to each zone block (for stats aggregation) */
export const ZONE_PLOT_RANGES: Record<string, string[]> = {
  commercial: Array.from({ length: 12 }, (_, i) => `Shop-${i + 1}`),
  'a-block': Array.from({ length: 50 }, (_, i) => `A-${i + 1}`),
  'main-avenue': [
    ...Array.from({ length: 40 }, (_, i) => String(i + 1)),
    '1A',
    '2A',
    '3A',
    '4A',
    '5A',
    '6A',
    '7A',
    '8A',
    '9A',
  ],
  'green-park': [], // parks have no sellable plots
};
