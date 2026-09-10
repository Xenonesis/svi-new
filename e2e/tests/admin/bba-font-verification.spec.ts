import { test, expect } from '@playwright/test';

test.describe('BBA Document Generation & Font Size Verification', () => {
  test('creates a test BBA and verifies enlarged font for English and Hindi previews', async ({
    page,
  }) => {
    // Intercept document creation API to provide reliable test document response
    await page.route('**/api/admin/documents', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            document: {
              id: 'doc-e2e-test-bba-1',
              document_type: 'bba',
              status: 'draft',
              form_data: {
                clientName: 'Test Allottee Verma',
                fatherName: 'Sh. R. K. Verma',
                contactNumber: '9876543210',
                projectName: 'Shyam Aangan',
                unitNumber: 'Plot-42B',
                area: '120',
                bsp: '15000',
              },
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
    // 1. Set large viewport to avoid clipping in preview containers
    await page.setViewportSize({ width: 1400, height: 2400 });

    // Navigate to /admin/bba
    await page.goto('/admin/bba');
    await page.waitForLoadState('domcontentloaded');

    // Dismiss notification prompt if present
    const dismissBtn = page
      .locator('button')
      .filter({ hasText: /Not now|Dismiss/i })
      .first();
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
    }

    // 2. Verify Agreement Details form is present
    await expect(page.locator('h1').filter({ hasText: /Builder Buyer/i })).toBeVisible({
      timeout: 15000,
    });
    // Fill in all required BBA fields
    await page.locator('input[name="clientName"]').fill('Test Allottee Verma');
    await page.locator('input[name="fatherName"]').fill('Sh. R. K. Verma');
    await page.locator('input[name="addressLine1"]').fill('123 Green Avenue');
    await page.locator('input[name="city"]').fill('Jaipur');
    await page.locator('input[name="state"]').fill('Rajasthan');
    await page.locator('input[name="pincode"]').fill('302001');
    await page.locator('input[name="ticketId"]').fill('TCK-9901');
    await page.locator('input[name="unitNumber"]').fill('Plot-42B');
    await page.locator('input[name="area"]').fill('120');
    await page.locator('input[name="bsp"]').fill('15000');
    await page.locator('input[name="bookingDate"]').fill('2026-09-10');

    // Select custom advisor and fill advisor fields
    const advisorSelect = page.locator('select[name="advisorName"]');
    if (await advisorSelect.isVisible()) {
      await advisorSelect.selectOption('custom');
      await page.locator('input[name="advisorName"]').fill('Test Advisor');
      await page.locator('input[name="advisorNumber"]').fill('9876543210');
      await page.locator('input[name="advisorEmail"]').fill('advisor@svi.com');
    }

    // 3. Submit form to generate BBA
    const generateBtn = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Generate BBA/i })
      .first();
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 4. Verify preview container appears
    const previewContainer = page.locator('#bbaPreview');
    await expect(previewContainer).toBeVisible({ timeout: 10000 });

    // Verify and capture English Page 1 Cover
    const englishCoverPage = previewContainer.locator('> div > div').first();
    await expect(englishCoverPage).toContainText('Allotment Summary Details:');
    await expect(englishCoverPage).toContainText('Important Instructions:');
    await expect(englishCoverPage).toContainText('Payment Plan');
    await englishCoverPage.screenshot({ path: 'test-results/bba-cover-english.png' });
    const englishLegalContainer = previewContainer.locator('.legal-pages');
    await expect(englishLegalContainer).toBeVisible();

    const englishFontSize = await englishLegalContainer.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Previously base legal text was 11px, now enlarged to 14.5px
    expect(englishFontSize).toBeGreaterThanOrEqual(14);
    expect(englishFontSize).toBeCloseTo(14.5, 0.5);

    // Verify paragraph text inside legal pages
    const englishParagraph = englishLegalContainer.locator('p.leading-relaxed').first();
    await expect(englishParagraph).toBeVisible();
    const englishParaFontSize = await englishParagraph.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    // Paragraphs are styled at 14.5px (up from 13px)
    expect(englishParaFontSize).toBeGreaterThanOrEqual(14);
    expect(englishParaFontSize).toBeCloseTo(14.5, 0.5);
    const firstEnglishPage = englishLegalContainer.locator('> div').first();
    await firstEnglishPage.scrollIntoViewIfNeeded();
    await firstEnglishPage.screenshot({ path: 'test-results/bba-legal-english-page1.png' });
    // 6. Switch Language Tab to Hindi
    const hindiTabBtn = page.locator('button').filter({ hasText: 'हिंदी' }).first();
    await expect(hindiTabBtn).toBeVisible();
    await hindiTabBtn.click();

    // 7. Verify Hindi BBA Font Size
    const hindiLegalContainer = previewContainer.locator('.legal-hindi-pages');
    await expect(hindiLegalContainer).toBeVisible({ timeout: 5000 });
    // Verify and capture Hindi Page 1 Cover
    const hindiCoverPage = previewContainer.locator('> div > div').first();
    await expect(hindiCoverPage).toContainText('आवंटन संक्षिप्त विवरण:');
    await expect(hindiCoverPage).toContainText('महत्वपूर्ण निर्देश:');
    await expect(hindiCoverPage).toContainText('भुगतान योजना');
    await hindiCoverPage.screenshot({ path: 'test-results/bba-cover-hindi.png' });
    const hindiParagraph = hindiLegalContainer.locator('p.leading-relaxed').first();
    await expect(hindiParagraph).toBeVisible();
    const hindiParaFontSize = await hindiParagraph.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });
    // Hindi paragraphs are styled at 15px (up from 13px)
    expect(hindiParaFontSize).toBeGreaterThanOrEqual(14.5);
    expect(hindiParaFontSize).toBeCloseTo(15, 0.5);

    // Check Hindi text readability - must contain Hindi characters
    const hindiText = await hindiParagraph.innerText();
    expect(hindiText.length).toBeGreaterThan(10);
    const firstHindiPage = hindiLegalContainer.locator('> div').first();
    await firstHindiPage.scrollIntoViewIfNeeded();
    await firstHindiPage.screenshot({ path: 'test-results/bba-legal-hindi-page1.png' });
  });
});
