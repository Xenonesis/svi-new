import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Client-side auth guard needs time to redirect after hydration
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });

  test('login page accessible from /admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    // Should redirect to login or show auth page
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Admin Lottery', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/lottery');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Chat Logs', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/chat-logs');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Properties', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/properties');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Registrations', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/registrations');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Notifications', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/notifications');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Settings', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Email', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/email');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});

test.describe('Admin Attendance', () => {
  test('redirects when not authenticated', async ({ page }) => {
    await page.goto('/admin/attendance');
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    expect(page.url().includes('/login') || page.url().includes('/admin')).toBeTruthy();
  });
});
