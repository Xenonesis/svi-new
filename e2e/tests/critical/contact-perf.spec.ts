import { test, expect, type Page } from '@playwright/test';

/* ── Network Profiles ──────────────────────────────────────── */
// All throughput values in **bytes per second** (Chrome CDP format).
// 1 Mbps = 1_000_000 bps = 125_000 Bps
interface NetworkProfile {
  label: string;
  latency: number; // ms
  downloadThroughput: number; // Bps (0 = unlimited)
  uploadThroughput: number; // Bps (0 = unlimited)
}

const PROFILES: NetworkProfile[] = [
  { label: 'WiFi', latency: 0, downloadThroughput: 0, uploadThroughput: 0 },
  { label: '4G Fast', latency: 20, downloadThroughput: 2_500_000, uploadThroughput: 1_250_000 },
  { label: 'Regular 4G', latency: 80, downloadThroughput: 500_000, uploadThroughput: 375_000 },
  { label: '3G Fast', latency: 150, downloadThroughput: 200_000, uploadThroughput: 94_000 },
  { label: '3G Slow', latency: 200, downloadThroughput: 97_500, uploadThroughput: 41_000 },
];

interface Vitals {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  jsBytes: number;
  cssBytes: number;
  imgBytes: number;
  fontBytes: number;
  totalBytes: number;
  loadTime: number;
}

/* ── Helpers ───────────────────────────────────────────────── */

async function applyThrottle(page: Page, profile: NetworkProfile) {
  try {
    const session = await page.context().newCDPSession(page);
    await session.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: profile.latency,
      downloadThroughput: profile.downloadThroughput,
      uploadThroughput: profile.uploadThroughput,
    });
  } catch {
    // CDP not available — run unthrottled
    console.warn('  ⚠  CDP throttling unavailable');
  }
}

async function collectVitals(page: Page): Promise<Vitals> {
  // Gather Web Vitals
  const vitals = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;

    const paints = performance.getEntriesByType('paint');
    const fcpEntry = paints.find((e) => e.name === 'first-contentful-paint');

    // LCP via PerformanceObserver (buffered)
    const lcp = new Promise<number>((resolve) => {
      const timer = setTimeout(() => resolve(0), 4000);
      try {
        const obs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length) {
            clearTimeout(timer);
            resolve(entries[entries.length - 1].startTime);
            obs.disconnect();
          }
        });
        obs.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        clearTimeout(timer);
        resolve(0);
      }
    });

    // CLS via PerformanceObserver (buffered)
    const cls = new Promise<number>((resolve) => {
      const timer = setTimeout(() => resolve(0), 4000);
      try {
        let val = 0;
        const obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!(e as any).hadRecentInput) val += (e as any).value;
          }
        });
        obs.observe({ type: 'layout-shift', buffered: true });
        // CLS is finalized after page unload, but we capture what we have
        setTimeout(() => {
          clearTimeout(timer);
          resolve(val);
          obs.disconnect();
        }, 3000);
      } catch {
        clearTimeout(timer);
        resolve(0);
      }
    });

    return Promise.all([lcp, cls]).then(([lcpVal, clsVal]) => ({
      ttfb: nav?.responseStart ?? 0,
      fcp: fcpEntry?.startTime ?? 0,
      lcp: lcpVal,
      cls: clsVal,
    }));
  });

  // TBT — sum of long task durations above 50ms
  const tbt = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      const timer = setTimeout(() => resolve(0), 3000);
      try {
        let val = 0;
        const obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            val += Math.max(0, e.duration - 50);
          }
        });
        obs.observe({ type: 'longtask', buffered: true });
        setTimeout(() => {
          clearTimeout(timer);
          resolve(val);
          obs.disconnect();
        }, 3000);
      } catch {
        clearTimeout(timer);
        resolve(0);
      }
    });
  });

  // Resource transfer sizes via PerformanceObserver
  const bytes = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let jsBytes = 0,
      cssBytes = 0,
      imgBytes = 0,
      fontBytes = 0;

    for (const r of resources) {
      const size = r.transferSize ?? r.encodedBodySize ?? 0;
      const url = r.name;
      if (url.endsWith('.js') || url.includes('/_next/static/chunks/')) jsBytes += size;
      else if (url.endsWith('.css')) cssBytes += size;
      else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)/i)) imgBytes += size;
      else if (url.match(/\.(woff2?|ttf|otf|eot)/i)) fontBytes += size;
    }

    return {
      jsBytes,
      cssBytes,
      imgBytes,
      fontBytes,
      totalBytes: jsBytes + cssBytes + imgBytes + fontBytes,
    };
  });

  // Total page load time
  const loadTime = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return nav ? nav.loadEventEnd - nav.startTime : 0;
  });

  return { ...vitals, tbt, ...bytes, loadTime };
}

function rating(value: number, good: number, poor: number): string {
  if (value <= good) return '✅';
  if (value <= poor) return '⚠️';
  return '❌';
}

/* ── Tests ─────────────────────────────────────────────────── */

for (const profile of PROFILES) {
  test(`contact page under ${profile.label}`, async ({ page, browserName }) => {
    test.setTimeout(60_000);

    // Apply network throttle BEFORE navigation
    await applyThrottle(page, profile);

    // Navigate
    const startTime = Date.now();
    await page.goto('/contact', { waitUntil: 'networkidle' });
    const navEnd = Date.now() - startTime;

    // Give LCP/CLS time to settle
    await page.waitForTimeout(profile.latency > 100 ? 3000 : 1500);

    const v = await collectVitals(page);

    // ── LOG ────────────────────────────────────
    console.log(`\n📶  ${profile.label}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  🏁 TTFB:     ${v.ttfb.toFixed(0)}ms   ${rating(v.ttfb, 800, 1800)}`);
    console.log(`  🎨 FCP:      ${v.fcp.toFixed(0)}ms   ${rating(v.fcp, 1800, 3000)}`);
    console.log(`  🖼️ LCP:      ${v.lcp.toFixed(0)}ms   ${rating(v.lcp, 2500, 4000)}`);
    console.log(`  📐 CLS:      ${v.cls.toFixed(3)}     ${rating(v.cls, 0.1, 0.25)}`);
    console.log(`  ⏱️ TBT:      ${v.tbt.toFixed(0)}ms   ${rating(v.tbt, 200, 600)}`);
    console.log(`  ⏳ Load:     ${navEnd.toFixed(0)}ms`);
    console.log(`  📦 JS:       ${(v.jsBytes / 1024).toFixed(0)} KB`);
    console.log(`  🎨 CSS:      ${(v.cssBytes / 1024).toFixed(0)} KB`);
    console.log(`  🖼️ Images:   ${(v.imgBytes / 1024).toFixed(0)} KB`);
    console.log(`  🔤 Fonts:    ${(v.fontBytes / 1024).toFixed(0)} KB`);
    console.log(`  📊 Total:    ${(v.totalBytes / 1024).toFixed(0)} KB`);
    console.log(`  🌐 ${browserName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Soft assertions — fail only beyond "poor" boundary
    expect(v.ttfb).toBeLessThan(1800);
    expect(v.fcp).toBeLessThan(3500);
    expect(v.lcp).toBeLessThan(4000);
    expect(v.cls).toBeLessThan(0.25);

    // Page rendered
    await expect(page.locator('h1').first()).toBeVisible();
  });
}
