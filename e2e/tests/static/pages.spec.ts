import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  const pages = [
    { path: '/about', name: 'About' },
    { path: '/careers', name: 'Careers' },
    { path: '/privacy-policy', name: 'Privacy Policy' },
    { path: '/terms-conditions', name: 'Terms & Conditions' },
    { path: '/leadership', name: 'Leadership' },
    { path: '/projects/completed', name: 'Completed Projects' },
    { path: '/projects/current', name: 'Current Projects' },
    { path: '/lottery', name: 'Lottery' },
  ];

  for (const { path, name } of pages) {
    test(`${name} loads successfully`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Page should have a heading and not be a 404
      const h1 = page.locator('h1');
      const count = await h1.count();
      expect(count).toBeGreaterThanOrEqual(1);
      // No error page text
      const body = page.locator('body');
      const bodyText = await body.innerText();
      expect(bodyText).not.toContain('404');
      expect(bodyText).not.toContain('This page could not be found');
    });

    test(`${name} in Hindi loads successfully`, async ({ page }) => {
      await page.goto(`/hi${path}`);
      await page.waitForLoadState('networkidle');
      const h1 = page.locator('h1');
      const count = await h1.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});
