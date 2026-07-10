'use client';

import { useEffect } from 'react';
import { onLCP, onCLS, onINP, onTTFB, onFCP, type Metric } from 'web-vitals';

type VitalName = 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP';

interface VitalPayload {
  name: VitalName;
  value: number;
  rating: string;
  id: string;
  navigationType?: string;
}

async function sendToAnalytics(metric: Metric) {
  const payload: VitalPayload = {
    name: metric.name as VitalName,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Log to console in dev for quick inspection
  if (process.env.NODE_ENV === 'development') {
    const color =
      metric.rating === 'good'
        ? '#22c55e'
        : metric.rating === 'needs-improvement'
          ? '#eab308'
          : '#ef4444';
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold`
    );
  }

  // Send to Vercel Analytics custom event (non-blocking)
  try {
    const { track } = await import('@vercel/analytics');
    track('web_vital', {
      metric_name: payload.name,
      metric_value: Math.round(payload.value),
      metric_rating: payload.rating,
    });
  } catch {
    // Vercel Analytics not available — silently skip
  }
}

/**
 * Real User Monitoring — measures Core Web Vitals in production.
 * Add once to root layout. Zero render output.
 *
 * Targets (from PERFORMANCE_PLAN.md):
 *   LCP  < 2000ms
 *   CLS  < 0.05
 *   INP  < 150ms
 *   TTFB < 150ms
 *   FCP  -50% from baseline
 */
export function WebVitals() {
  useEffect(() => {
    onLCP(sendToAnalytics);
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onFCP(sendToAnalytics);
  }, []);

  return null;
}
