'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

let cachedVisibility: boolean | null = null;
let inFlightPromise: Promise<boolean> | null = null;

export async function fetchLotteryVisibility(): Promise<boolean> {
  if (cachedVisibility !== null) return cachedVisibility;
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('value')
        .eq('key', 'lottery_page_visible')
        .maybeSingle();

      if (!error && data) {
        cachedVisibility = data.value === true || data.value === 'true';
      } else {
        cachedVisibility = false;
      }
      return cachedVisibility;
    } catch {
      return false;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

export function _resetLotteryVisibilityCacheForTesting(): void {
  cachedVisibility = null;
  inFlightPromise = null;
}

/**
 * useLotteryVisibility
 *
 * Reads the `lottery_page_visible` key from portal_settings with module-level
 * single-flight caching to prevent duplicate simultaneous Supabase queries.
 *
 * Returns:
 *   - `visible: boolean` — whether the lottery page/nav should show
 *   - `loading: boolean` — while the DB request is in flight
 *
 * Default is `false` (hidden) until the DB responds, so nothing
 * flashes before the value is known.
 */
export function useLotteryVisibility() {
  const [visible, setVisible] = useState(cachedVisibility ?? false);
  const [loading, setLoading] = useState(cachedVisibility === null);

  useEffect(() => {
    let cancelled = false;

    if (cachedVisibility !== null) {
      setVisible(cachedVisibility);
      setLoading(false);
      return;
    }

    fetchLotteryVisibility()
      .then((val) => {
        if (!cancelled) {
          setVisible(val);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisible(false);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { visible, loading };
}
