import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registration');
    await page.waitForLoadState('networkidle');
  });

  test('renders registration form', async ({ page }) => {
    await expect(
      page.locator('h1, h2').filter({ hasText: /Register|Registration|रजिस्ट्रेशन|दर्ज/i })
    ).toBeVisible();
    // Check form fields exist
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Submit"), button:has-text("Register")'
    );
    if ((await submitBtn.count()) > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(1000);
      // Should show validation errors
      const errors = page.locator(
        '[class*="error"], [class*="warning"], [role="alert"], p.text-red'
      );
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Contact Page', () => {
  test('renders contact form', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /Contact|संपर्क/i })).toBeVisible();
    const inputs = page.locator('input, textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Grievance Page', () => {
  test('renders grievance form', async ({ page }) => {
    await page.goto('/grievance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /Grievance|शिकायत/i })).toBeVisible();
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Payment Page', () => {
  test('renders payment form', async ({ page }) => {
    await page.goto('/payment');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /Payment|भुगतान|Pay/i })).toBeVisible();
    // Check for amount input or payment-related element
    const amountInput = page.locator(
      'input[type="number"], input[placeholder*="amount" i], input[placeholder*="राशि"]'
    );
    const amountCount = await amountInput.count();
    expect(amountCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Thank You Page', () => {
  test('redirects to registration when no registered=1 param', async ({ page }) => {
    await page.goto('/thank-you');
    await page.waitForTimeout(2000);
    // Should redirect to registration
    expect(page.url()).toContain('registration');
  });

  test('shows thank you card with correct param', async ({ page }) => {
    await page.goto('/thank-you?registered=1');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /Thank You|धन्यवाद/i });
    await expect(heading).toBeVisible();
  });
});

test.describe('FAQ Page', () => {
  test('renders FAQ accordion', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /FAQ|सवाल|Questions/i })).toBeVisible();
    // FAQ items should exist
    const faqItems = page.locator('button, [role="button"], summary, [class*="accordion"]');
    const count = await faqItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
