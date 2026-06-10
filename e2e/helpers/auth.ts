import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@svi.com');
  await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/);
}
