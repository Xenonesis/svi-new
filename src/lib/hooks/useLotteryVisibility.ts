'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

/**
 * useLotteryVisibility
 *
 * Reads the `lottery_page_visible` key from portal_settings.
 * Returns:
 *   - `visible: boolean` — whether the lottery page/nav should show
 *   - `loading: boolean` — while the DB request is in flight
 *
 * Default is `false` (hidden) until the DB responds, so nothing
 * flashes before the value is known.
 */
export function useLotteryVisibility() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchVisibility = async () => {
      try {
        const { data, error } = await supabase
          .from('portal_settings')
          .select('value')
          .eq('key', 'lottery_page_visible')
          .maybeSingle();

        if (!cancelled) {
          if (!error && data) {
            // value is stored as jsonb, e.g. true / false
            setVisible(data.value === true);
          } else {
            // Key doesn't exist yet — treat as hidden
            setVisible(false);
          }
        }
      } catch {
        if (!cancelled) setVisible(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(fetchVisibility, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(handle);
      };
    } else {
      const timer = setTimeout(fetchVisibility, 1500);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, []);

  return { visible, loading };
}
