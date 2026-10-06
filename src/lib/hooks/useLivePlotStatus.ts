'use client';

import { useState, useEffect } from 'react';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';
import { normalizeUnitNumber, parseCompoundUnitNumbers } from '@/src/data/shivaniVatika11Plots';
import { supabase } from '@/src/lib/supabase/client';

export const SHIVANI_VATIKA_11_PROPERTY_ID = 'e154bd4e-eecb-4dc0-ac44-b017cb61a6f0';

interface AllotmentRecord {
  unit_no?: string | null;
  status?: string | null;
}

export interface LivePlotStatusResult {
  plots: PlotData[];
  loading: boolean;
  bookedCount: number;
  availableCount: number;
  reservedCount: number;
}

export function useLivePlotStatus(baselinePlots: PlotData[]): LivePlotStatusResult {
  const [plots, setPlots] = useState<PlotData[]>(baselinePlots);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveAllotments(): Promise<void> {
      try {
        const { data, error } = await supabase
          .from('allotments')
          .select('unit_no, status')
          .eq('property_id', SHIVANI_VATIKA_11_PROPERTY_ID);

        if (error || !data || !isMounted) {
          if (isMounted) setLoading(false);
          return;
        }

        const statusMap = new Map<string, 'BOOKED' | 'RESERVED'>();
        const records = Array.isArray(data) ? (data as AllotmentRecord[]) : [];

        for (const row of records) {
          if (!row.unit_no) continue;

          const rawStatus = (row.status || '').toLowerCase().trim();
          let targetStatus: 'BOOKED' | 'RESERVED' | null = null;

          if (rawStatus === 'allotted' || rawStatus === 'registered') {
            targetStatus = 'BOOKED';
          } else if (rawStatus === 'pending') {
            targetStatus = 'RESERVED';
          }

          if (!targetStatus) continue;

          const units = parseCompoundUnitNumbers(row.unit_no);
          for (const u of units) {
            statusMap.set(normalizeUnitNumber(u), targetStatus);
          }
        }

        const updated = baselinePlots.map((plot) => {
          const normKey = normalizeUnitNumber(plot.plotNo);
          const override = statusMap.get(normKey);
          return override ? { ...plot, status: override } : plot;
        });

        if (isMounted) {
          setPlots(updated);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLiveAllotments();

    return () => {
      isMounted = false;
    };
  }, [baselinePlots]);

  const bookedCount = plots.filter((p) => p.status === 'BOOKED').length;
  const reservedCount = plots.filter((p) => p.status === 'RESERVED').length;
  const availableCount = plots.filter((p) => p.status === 'AVAILABLE').length;

  return {
    plots,
    loading,
    bookedCount,
    availableCount,
    reservedCount,
  };
}
