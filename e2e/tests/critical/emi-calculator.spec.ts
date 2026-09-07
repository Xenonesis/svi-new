import { test, expect, type Locator } from '@playwright/test';

async function setSliderValue(locator: Locator, value: string | number) {
  await locator.waitFor({ state: 'visible' });
  await locator.evaluate((el: HTMLInputElement, val) => {
    const reactKey = Object.keys(el).find((k) => k.startsWith('__reactProps'));
    if (reactKey && typeof (el as any)[reactKey]?.onChange === 'function') {
      (el as any)[reactKey].onChange({ target: { value: String(val) } });
    } else {
      const tracker = (el as any)._valueTracker;
      if (tracker) tracker.setValue('');
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(el, String(val));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, value);
}

test.describe('EMI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => {
      const input = document.querySelector('input[type="range"]');
      return input && Object.keys(input).some((k) => k.startsWith('__react'));
    });
  });
  test('renders sliders with default EMI', async ({ page }) => {
    await expect(page.getByRole('slider', { name: 'Loan Amount' })).toBeVisible();
    // default 50L / 0% / 20yr → ₹ 20,833
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('20,833');
  });

  test('doubling loan amount doubles the EMI', async ({ page }) => {
    await setSliderValue(page.getByRole('slider', { name: 'Loan Amount' }), 10000000);
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('41,667');
  });

  test('interest rate increases EMI', async ({ page }) => {
    await setSliderValue(page.getByRole('slider', { name: 'Interest Rate' }), 8.5);
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('43,391');
  });

  test('longer tenure lowers monthly EMI', async ({ page }) => {
    await setSliderValue(page.getByRole('slider', { name: 'Tenure' }), 30);
    // 50L / 0% / 30yr → ₹ 13,889
    await expect(page.getByText('MONTHLY EMI').locator('..')).toContainText('13,889');
  });
});
