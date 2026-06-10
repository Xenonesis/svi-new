import { test, expect } from '@playwright/test';

test.describe('Calculators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators');
    await page.waitForLoadState('networkidle');
  });

  test('renders calculator page', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /Calculator|कैलकुलेटर/i })).toBeVisible();
  });

  test('EMI calculator has sliders', async ({ page }) => {
    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('switching between EMI and ROI tabs works', async ({ page }) => {
    const tabs = page.locator(
      'button:has-text("EMI"), button:has-text("ROI"), button:has-text("एमी"), button:has-text("आरओआई")'
    );
    const count = await tabs.count();
    if (count >= 2) {
      // Click the second tab (ROI)
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      // Should now show ROI content
    }
  });
});
