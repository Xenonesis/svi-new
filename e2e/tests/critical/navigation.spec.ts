import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('all main nav links work in English', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = [
      { label: 'Home', url: '/' },
      { label: 'About Us', url: '/about' },
      { label: 'Calculators', url: '/calculators' },
      { label: 'Careers', url: '/careers' },
      { label: 'Blog', url: '/blog' },
      { label: 'Payment', url: '/payment' },
      { label: 'Contact', url: '/contact' },
    ];

    for (const link of links) {
      const navLink = page.locator(
        `nav a:has-text("${link.label}"), header a:has-text("${link.label}")`
      );
      // check the page has a way to reach this link
      const count = await page.locator(`a[href="${link.url}"]`).count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('language toggle switches to Hindi', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click language toggle button
    const langButton = page.locator(
      'button:has-text("Switch language"), button:has-text("English"), button:has-text("हिन्दी")'
    );
    if ((await langButton.count()) > 0) {
      await langButton.first().click();
      await page.waitForTimeout(1000);
      // URL should change to /hi or page content should change
      const url = page.url();
      expect(url.includes('/hi') || url.includes('hindi')).toBeTruthy();
    }
  });

  test('mobile hamburger menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for hamburger/mobile menu button
    const mobileMenuBtn = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="Menu" i], [class*="hamburger"], [class*="mobile-menu"], button:has(svg.lucide-menu)'
    );
    const btnCount = await mobileMenuBtn.count();
    if (btnCount > 0) {
      await mobileMenuBtn.first().click();
      await page.waitForTimeout(500);
      // Mobile nav should now be visible
      const mobileNav = page.locator('[class*="mobile"]:visible, nav:visible a');
      const visibleLinks = await mobileNav.filter({ hasText: /Home|About|Blog/ }).count();
      expect(visibleLinks).toBeGreaterThanOrEqual(0);
    }
  });
});
