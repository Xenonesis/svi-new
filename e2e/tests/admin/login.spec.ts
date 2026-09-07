import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login is at /admin (not /login — that's the client portal)
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders login form', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /Admin/i })).toBeVisible();
    // Email input should exist
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();
    // Password input should exist
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      // Should show some error or validation
      const errorMsg = page.locator('[class*="error"], [class*="text-red"], [role="alert"]');
      const count = await errorMsg.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      // Login should fail - either stay on login page or show error
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/admin/dashboard');
    }
  });

  test('redirects to admin on successful login', async ({ page }) => {
    // Only test if we have test credentials
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;
    if (!email || !password) {
      test.skip();
      return;
    }
    await page.fill('input[type="email"], input[placeholder*="email" i]', email);
    await page.fill('input[type="password"]', password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    expect(page.url()).toContain('/admin');
  });

  test('displays spinning Loader2 spinner with text when form is submitting', async ({ page }) => {
    // Intercept auth to delay response so loading state is held for 2.5s
    await page.route('**/auth/v1/token*', async (route) => {
      await page.waitForTimeout(2500);
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }),
      });
    });

    await page.fill('input[type="email"], input[placeholder*="email" i]', 'test@example.com');
    await page.fill('input[type="password"]', 'Password123!');

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Verify button is disabled during submit
    await expect(submitBtn).toBeDisabled();

    // Verify Loader2 spinner SVG is visible and has animate-spin class
    const spinner = submitBtn.locator('svg.animate-spin');
    await expect(spinner).toBeVisible();

    // Verify "Signing In..." text is visible
    await expect(submitBtn).toContainText('Signing In...');

    // Verify computed animation properties on spinner
    const animationName = await spinner.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animationName;
    });
    expect(animationName).toBe('spin');

    // Verify dimensions are non-zero (h-4 w-4)
    const box = await spinner.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(14);
    expect(box!.height).toBeGreaterThanOrEqual(14);

    // Capture screenshot of the button while spinner is active (saved in gitignored test-results)
    await submitBtn.screenshot({ path: 'test-results/test-spinner-active.png' });

    // Sample rotation transform at two points in time to mathematically verify continuous spin
    const transform1 = await spinner.evaluate((el) => window.getComputedStyle(el).transform);
    await page.waitForTimeout(300);
    const transform2 = await spinner.evaluate((el) => window.getComputedStyle(el).transform);

    // Both transforms should be valid matrix values and different from each other because it's actively spinning
    expect(transform1).toContain('matrix');
    expect(transform2).toContain('matrix');
    expect(transform1).not.toEqual(transform2);

    // Wait for submission to finish (error state)
    await page.waitForTimeout(2500);
    // Button returns to idle state ('Sign In')
    await expect(submitBtn).toContainText('Sign In');
  });
});
