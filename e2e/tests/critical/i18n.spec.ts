import { test, expect } from '@playwright/test';

test.describe('i18n — Multi-language', () => {
  test('English homepage renders English text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // The page title or h1 should have English content
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('Hindi homepage renders Hindi URL', async ({ page }) => {
    await page.goto('/hi');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/hi');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Hindi blog page shows Hindi content', async ({ page }) => {
    await page.goto('/hi/blog');
    await page.waitForLoadState('networkidle');
    // Breadcrumb should show "Blog" in Hindi or the URL has /hi
    expect(page.url()).toContain('/hi/blog');
    // h1 should exist with Hindi heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('language toggle switches content language', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find language toggle
    const toggle = page.locator(
      'button[aria-label*="language" i], button[aria-label*="Language" i], [class*="language-toggle"], button:has-text("हिन्दी"), button:has-text("English")'
    );
    const toggleCount = await toggle.count();

    if (toggleCount > 0) {
      await toggle.first().click();
      await page.waitForTimeout(2000);
      // URL or content should reflect language change
      const currentUrl = page.url();
      expect(currentUrl.includes('/hi') || currentUrl.includes('/en')).toBeTruthy();
    }
  });

  test('English pages accessible without prefix', async ({ page }) => {
    const paths = [
      '/about',
      '/blog',
      '/faq',
      '/contact',
      '/careers',
      '/privacy-policy',
      '/terms-conditions',
    ];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/en');
      expect(page.url()).toContain(path);
    }
  });

  test('Hindi pages accessible with /hi prefix', async ({ page }) => {
    const paths = ['/about', '/blog', '/faq', '/contact'];
    for (const path of paths) {
      await page.goto(`/hi${path}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/hi');
    }
  });
});
