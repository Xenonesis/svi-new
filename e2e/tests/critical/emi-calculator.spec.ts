import { test, expect } from '@playwright/test';

test.describe('EMI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators');
    await page.waitForLoadState('networkidle');
  });

  test('renders sliders with default EMI', async ({ page }) => {
    await expect(page.getByRole('slider', { name: 'Loan Amount' })).toBeVisible();
    // default 50L / 0% / 20yr → ₹ 20,833
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('20,833');
  });

  test('doubling loan amount doubles the EMI', async ({ page }) => {
    await page.getByRole('slider', { name: 'Loan Amount' }).fill('10000000');
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('41,667');
  });

  test('interest rate increases EMI', async ({ page }) => {
    await page.getByRole('slider', { name: 'Interest Rate' }).fill('8.5');
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('43,391');
  });

  test('longer tenure lowers monthly EMI', async ({ page }) => {
    await page.getByRole('slider', { name: 'Tenure' }).fill('30');
    // 50L / 0% / 30yr → ₹ 13,889
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('13,889');
  });
});
