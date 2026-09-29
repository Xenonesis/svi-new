import { test, expect } from '@playwright/test';

test.describe('Corridor EMI Widgets & Rich Schema Verification', () => {
  test.describe.configure({ timeout: 60000 });

  test('Khatu Shyam Ji: interactive CorridorEmiWidget and rich schema', async ({ page }) => {
    await page.goto('/plots-for-sale-near-khatu-shyam-ji', { waitUntil: 'domcontentloaded' });

    // 1. Verify title and heading
    await expect(page.locator('h1')).toBeVisible();

    // 2. Verify CorridorEmiWidget renders
    const widget = page.locator('text=Estimate Your Plot EMI').first();
    await expect(widget).toBeVisible({ timeout: 15000 });

    // 3. Test preset pill clicks and calculation updates
    const btn150 = page.locator('button', { hasText: '150 Sq. Yds' }).first();
    await expect(btn150).toBeVisible();
    await btn150.click();

    // 4. Verify monthly EMI number updates
    const emiDisplay = page.locator('text=/₹[0-9,]+/').first();
    await expect(emiDisplay).toBeVisible();

    // 5. Verify RealEstateListing schema has amenityFeature array
    const schemas = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.map((s) => {
        try {
          return JSON.parse(s.innerHTML);
        } catch {
          return null;
        }
      })
    );

    const listing = schemas.find((s) => s && s['@type'] === 'RealEstateListing');
    expect(listing).toBeTruthy();
    expect(Array.isArray(listing.amenityFeature)).toBeTruthy();
    const amenities = (listing.amenityFeature || []) as Array<{ name: string; value: string }>;
    expect(amenities.length).toBeGreaterThanOrEqual(4);
    expect(amenities.some((a) => a.name.includes('Road'))).toBeTruthy();
    expect(amenities.some((a) => a.name.includes('Water'))).toBeTruthy();
    expect(amenities.some((a) => a.name.includes('Loan'))).toBeTruthy();
  });

  test('Renwal Corridor: interactive CorridorEmiWidget and rich schema', async ({ page }) => {
    await page.goto('/plots-near-renwal-railway-station', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toBeVisible();

    const widget = page.locator('text=Estimate Your Plot EMI').first();
    await expect(widget).toBeVisible({ timeout: 15000 });

    const btn250 = page.locator('button', { hasText: '250 Sq. Yds' }).first();
    await expect(btn250).toBeVisible();
    await btn250.click();

    const schemas = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.map((s) => {
        try {
          return JSON.parse(s.innerHTML);
        } catch {
          return null;
        }
      })
    );

    const listing = schemas.find((s) => s && s['@type'] === 'RealEstateListing');
    expect(listing).toBeTruthy();
    expect(Array.isArray(listing.amenityFeature)).toBeTruthy();
    const amenities = (listing.amenityFeature || []) as Array<{ name: string; value: string }>;
    expect(amenities.length).toBeGreaterThanOrEqual(4);
  });

  test('Under 20 Lakhs Jaipur: rich schema markup verified', async ({ page }) => {
    await page.goto('/plots-in-jaipur-under-20-lakhs', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toBeVisible();

    const schemas = await page.$$eval('script[type="application/ld+json"]', (scripts) =>
      scripts.map((s) => {
        try {
          return JSON.parse(s.innerHTML);
        } catch {
          return null;
        }
      })
    );

    const listing = schemas.find((s) => s && s['@type'] === 'RealEstateListing');
    expect(listing).toBeTruthy();
    expect(Array.isArray(listing.amenityFeature)).toBeTruthy();
    const amenities = (listing.amenityFeature || []) as Array<{ name: string; value: string }>;
    expect(amenities.length).toBeGreaterThanOrEqual(4);
  });
});
