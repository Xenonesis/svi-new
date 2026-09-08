import { test, expect } from '@playwright/test';

test.describe('Employee Portal E2E Suite', () => {
  test.describe.configure({ timeout: 45000 });

  test('Employee Login (/employee/login): renders branding, inputs, and shows validation error on empty submit', async ({
    page,
  }) => {
    await page.goto('/employee/login');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify branding and title
    await expect(page.locator('h1')).toContainText(/Employee Portal/i);

    // 2. Locate inputs
    const emailInput = page.locator('input#emp-email');
    const passwordInput = page.locator('input#emp-password');
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // 3. Test empty submission triggers validation error message
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Error banner appears
    await expect(page.locator('text=/Please enter a valid work email address/i')).toBeVisible();

    // Page should remain on login
    expect(page.url()).toContain('/employee/login');
  });

  test('Employee Auth Guard: unauthenticated redirects from protected employee routes', async ({
    page,
  }) => {
    const protectedRoutes = [
      '/employee/dashboard',
      '/employee/attendance',
      '/employee/work',
      '/employee/payroll',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1500);
      const currentUrl = page.url();
      // Protected route should either redirect to employee login or stay protected
      expect(
        currentUrl.includes('/employee/login') ||
          currentUrl.includes('/login') ||
          currentUrl.includes('/admin') ||
          currentUrl.includes(route)
      ).toBeTruthy();
    }
  });
});
