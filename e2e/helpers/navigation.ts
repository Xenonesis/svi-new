import { Page, expect } from '@playwright/test';

/** Navigate to a page with locale support (en=no prefix, hi=/hi) */
export async function goto(page: Page, path: string, locale: 'en' | 'hi' = 'en') {
  const url = locale === 'hi' ? `/hi${path}` : path;
  await page.goto(url);
}

/** Check that a heading with text exists */
export async function expectHeading(page: Page, text: string, level: number = 1) {
  const h = page.locator(`h${level}`).filter({ hasText: text });
  await expect(h).toBeVisible();
}

/** Wait for page to be fully loaded */
export async function waitForPage(page: Page) {
  await page.waitForLoadState('networkidle');
}
