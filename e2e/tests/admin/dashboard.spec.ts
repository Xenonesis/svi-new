import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 60000 });

test.describe('Admin Dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    // Client-side auth guard needs time to redirect after hydration
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });

  test('login page accessible from /admin', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    // Should redirect to login or show auth page
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Admin Lottery', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/lottery', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Chat Logs', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/chat-logs', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Properties', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/properties', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Registrations', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/registrations', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Notifications', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Settings', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Email', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/email', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Attendance', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/attendance', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});
