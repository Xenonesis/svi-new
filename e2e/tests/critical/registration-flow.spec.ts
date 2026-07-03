import { test, expect } from '@playwright/test';
import { goto } from '../../helpers/navigation';

test.describe('Registration Flow', () => {
  test('should fill out and validate the registration form', async ({ page }) => {
    // 1. Navigate to the registration page
    await goto(page, '/registration');
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

    // Wait for the dynamic select options to load
    await page.waitForTimeout(1000);

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
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();

    // Click submit
    await submitBtn.click();

    // Since we submitted the form, check if the payment modal is triggered or if we are redirected.
    // The registration form triggers a payment modal on success. Let's wait for that modal to show.
    const paymentModalHeader = page.locator('text=/SCAN & PAY/i');
    await expect(paymentModalHeader).toBeVisible({ timeout: 10000 });
  });
});
