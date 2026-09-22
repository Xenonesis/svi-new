'use client';

import { useState } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface InventoryPulseWidgetProps {
  properties: Array<{ name: string; slug: string }>;
}

export function InventoryPulseWidget({ properties }: InventoryPulseWidgetProps) {
  const [selectedProperty, setSelectedProperty] = useState(
    properties[0]?.name || 'Shreeji Valley - Phase 1'
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090e17]/80 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Project Inventory Pulse</h3>
            <p className="text-xs text-gray-400">Allotment & booking status</p>
          </div>
        </div>

        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          aria-label="Select Project"
          className="focus:border-brand-gold/40 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-xs text-gray-200 focus:outline-none"
        >
          {properties.length > 0 ? (
            properties.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))
          ) : (
            <option value="Shreeji Valley - Phase 1">Shreeji Valley - Phase 1</option>
          )}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Total Units: <strong className="text-white">60</strong>
          </span>
          <span className="text-brand-gold text-xs font-medium">78% Occupancy</span>
        </div>

        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="bg-brand-gold" style={{ width: '65%' }} title="Allotted: 39 Units" />
          <div className="bg-amber-400" style={{ width: '13%' }} title="Reserved: 8 Units" />
          <div className="bg-emerald-500" style={{ width: '22%' }} title="Available: 13 Units" />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="bg-brand-gold h-2 w-2 rounded-full" />
            <span>Allotted (39)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Reserved (8)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available (13)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
        <span className="text-gray-400">Need new allotment letter?</span>
        <Link
          href="/admin/allotment-letter"
          className="text-brand-gold flex items-center gap-1 font-medium hover:underline"
        >
          <span>Create Allotment</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
