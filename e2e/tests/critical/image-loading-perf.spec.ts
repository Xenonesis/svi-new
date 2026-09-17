import { test, expect, type Page } from '@playwright/test';

interface NetworkProfile {
  label: string;
  latency: number;
  downloadThroughput: number;
  uploadThroughput: number;
}

const PROFILES: NetworkProfile[] = [
  { label: 'WiFi (Unthrottled)', latency: 0, downloadThroughput: 0, uploadThroughput: 0 },
  {
    label: '4G Fast (20 Mbps)',
    latency: 20,
    downloadThroughput: 2_500_000,
    uploadThroughput: 1_250_000,
  },
  {
    label: 'Regular 4G (4 Mbps)',
    latency: 80,
    downloadThroughput: 500_000,
    uploadThroughput: 375_000,
  },
  {
    label: '3G Fast (1.6 Mbps)',
    latency: 150,
    downloadThroughput: 200_000,
    uploadThroughput: 94_000,
  },
  {
    label: '3G Slow (780 Kbps)',
    latency: 200,
    downloadThroughput: 97_500,
    uploadThroughput: 41_000,
  },
];

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
    console.warn(`  [WARN] CDP throttling unavailable for ${profile.label}`);
  }
}

test.describe('HoverZoomImage Loading Performance Across Networks', () => {
  for (const profile of PROFILES) {
    test(`Modal Preview Image Performance: ${profile.label}`, async ({ page }) => {
      test.setTimeout(60000);
      // 1. Setup network interception to capture image loads and timings
      const imageEvents: Array<{ url: string; size: number; duration: number }> = [];
      const pendingRequests = new Map<string, number>();

      page.on('request', (req) => {
        const url = req.url();
        if (url.match(/\.(webp|png|jpg|jpeg|avif)(\?.*)?$/i)) {
          pendingRequests.set(url, Date.now());
        }
      });

      page.on('response', async (res) => {
        const url = res.url();
        if (url.match(/\.(webp|png|jpg|jpeg|avif)(\?.*)?$/i)) {
          const startTime = pendingRequests.get(url) || Date.now();
          const duration = Date.now() - startTime;
          const headers = res.headers();
          const size = headers['content-length'] ? parseInt(headers['content-length'], 10) : 0;
          imageEvents.push({ url, size, duration });
        }
      });

      // 2. Navigate and wait for cards to be ready
      await page.goto('/projects/current', { waitUntil: 'domcontentloaded' });
      const card = page.locator('#project-shivani-vatika');
      await card.waitFor({ state: 'visible', timeout: 15000 });
      await card.scrollIntoViewIfNeeded();

      // 3. Now apply network throttle for the modal test
      await applyThrottle(page, profile);
      // Clear earlier image requests to only capture modal activity
      imageEvents.length = 0;

      const tClick = Date.now();
      await card.click();

      // Verify modal is displayed
      const modal = page.locator('.fixed.inset-0.z-50');
      await expect(modal).toBeVisible();

      // Wait for HoverZoomImage skeleton to disappear (aria-hidden="true")
      const skeletonHidden = modal.locator('[aria-hidden="true"]');
      await skeletonHidden.waitFor({ state: 'attached', timeout: 35000 });
      const spinnerDuration = Date.now() - tClick;

      // Extract image element details
      const modalImg = modal.locator('img[alt*="Shivani Vatika"]').first();
      await expect(modalImg).toBeVisible();
      const currentSrc = await modalImg.evaluate((el: HTMLImageElement) => el.currentSrc || el.src);
      const srcset = await modalImg.evaluate((el: HTMLImageElement) => el.srcset);
      const naturalWidth = await modalImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const naturalHeight = await modalImg.evaluate((el: HTMLImageElement) => el.naturalHeight);

      // Measure gallery next image slide transition
      const nextBtn = page.getByLabel('Next image');
      const nextSlideDuration = 0;
      if (await nextBtn.isVisible()) {
        const tNext = Date.now();
        await nextBtn.click();
        const nextSkeletonHidden = modal.locator('[aria-hidden="true"]');
        await nextSkeletonHidden.waitFor({ state: 'attached', timeout: 35000 });
      }

      console.log(`\n======================================================`);
      console.log(` Network Profile: ${profile.label}`);
      console.log(
        ` Modal Initial Image Load & Spinner Duration: ${(spinnerDuration / 1000).toFixed(2)}s`
      );
      if (nextSlideDuration > 0) {
        console.log(
          ` Gallery Next Slide Load & Spinner Duration: ${(nextSlideDuration / 1000).toFixed(2)}s`
        );
      }
      console.log(` Resolved Image Source: ${currentSrc}`);
      console.log(` Natural Dimensions: ${naturalWidth}x${naturalHeight}`);
      console.log(` Modal Images Transferred: ${imageEvents.length}`);
      for (const ev of imageEvents) {
        console.log(`   - ${(ev.size / 1024).toFixed(1)} KB in ${ev.duration}ms: ${ev.url}`);
      }
      console.log(`======================================================\n`);

      // Basic sanity assertions
      expect(spinnerDuration).toBeGreaterThan(0);
      expect(modalImg).toBeVisible();
    });
  }
});
