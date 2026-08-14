import { test, expect } from '@playwright/test';
import { goto } from '../../helpers/navigation';

test.describe('Registration Flow', () => {
  test('should fill out and validate the registration form', async ({ page }) => {
    await goto(page, '/registration');
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.url()} - ${response.status()}`);
        try {
          const body = await response.json();
          console.log('API Body:', body);
        } catch (e) {
          // ignore
        }
      }
    });
    await expect(page.locator('h1')).toBeVisible();

    // 2. Fill in all required fields
    await page.locator('input#firstName').fill('Ajeet');
    await page.locator('input#lastName').fill('Kumar');
    await page.locator('input#mobileNo').fill('9876543210');
    await page.locator('input#email').fill('ajeet.kumar@example.com');
    await page.locator('input#soWoDo').fill('S/O Ramesh Kumar');
    await page.locator('input#dob').fill('1990-05-15');
    await page.locator('input#aadharNumber').fill('567890123456');
    await page.locator('input#panNumber').fill('ABCDE1234F');
    await page.locator('input#state').fill('Rajasthan');
    await page.locator('input#city').fill('Jaipur');
    await page.locator('input#address').fill('123, Vaishali Nagar, Jaipur');

    // Wait for the dynamic select options to load from the API
    // This is bulletproof: it waits until the second option actually exists in the DOM
    await expect(page.locator('select#advisorName option').nth(1)).toBeAttached({ timeout: 10000 });
    await expect(page.locator('select#project option').nth(1)).toBeAttached({ timeout: 10000 });

    // Select options
    await page.locator('select#advisorName').selectOption({ index: 1 });
    await page.locator('select#project').selectOption({ index: 1 });
    await page.locator('select#propertySize').selectOption({ index: 1 });
    await page.locator('select#propertyType').selectOption({ index: 1 });
    await page.locator('select#plotPreference').selectOption({ index: 1 });
    await page.locator('select#paymentPlan').selectOption({ index: 1 });
    await page.locator('select#paymentMode').selectOption({ index: 1 });

    await page.locator('input#schemeAmount').fill('2100');

    // 3. Solve the Captcha dynamically
    // Wait for the captcha container to render
    const captchaContainer = page.locator('div.flex.min-h-\\[46px\\]');
    await expect(captchaContainer).toBeVisible();

    // Get value of first span (a) and third span (b)
    const spans = captchaContainer.locator('span');
    const aText = await spans.nth(0).innerText();
    const bText = await spans.nth(2).innerText();

    const a = parseInt(aText, 10);
    const b = parseInt(bText, 10);
    const answer = a + b;

    // Type the answer into the captcha input
    await page.locator('input[placeholder="?"]').fill(answer.toString());

    // Verify there are no immediate validation errors before submitting
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // Allow React state to update from Captcha fill before clicking submit
    await page.waitForTimeout(500);

    // 1. Click submit on the initial form to open Review Screen
    await submitBtn.click();

    // Dump validation errors for debugging
    await page.waitForTimeout(2000);
    const validationErrors = await page
      .locator('.text-red-500, [role="alert"], .text-red-600, .text-red-400')
      .allTextContents();
    if (validationErrors.length > 0) {
      console.log('VALIDATION ERRORS FOUND:', validationErrors);
    }

    // 2. Wait for Review Screen and click "Continue to Payment"
    const continueBtn = page.locator('button', { hasText: /Continue to Payment/i }).first();
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // 3. Wait for Payment Modal
    const paymentModalHeader = page.locator('text=/SCAN & PAY/i');
    await expect(paymentModalHeader).toBeVisible({ timeout: 5000 });

    // 4. Click the final confirmation button inside the modal
    const finalSubmit = page.locator('.fixed.inset-0 button.bg-brand-gold').last();
    await expect(finalSubmit).toBeVisible({ timeout: 2000 });
    await finalSubmit.click();

    // 5. The registration form redirects to /thank-you?registered=1 on success.
    await page.waitForURL(/\/thank-you/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/thank-you/);
  });
});
