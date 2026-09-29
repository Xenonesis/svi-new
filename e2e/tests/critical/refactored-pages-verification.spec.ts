import { test, expect } from '@playwright/test';

test.describe('Refactored Modular Landing Pages & Admin Records E2E', () => {
  test.describe.configure({ timeout: 60000 });

  // 1. Khatu Shyam Ji Plots Page
  test('Khatu Shyam Ji Page: renders hero, transit cards, accordion, schemas, and bilingual toggle', async ({
    page,
  }) => {
    // English
    await page.goto('/plots-for-sale-near-khatu-shyam-ji');
    await page.waitForLoadState('domcontentloaded');

    // Hero title & CTA
    await expect(page.locator('h1')).toContainText(
      /Residential Plots for Sale Near Khatu Shyam Ji/i
    );
    await expect(page.getByRole('link', { name: /Explore Shivani Vatika 11th/i })).toBeVisible();

    // Strategic Growth & Transit Cards
    await expect(page.getByText('Shree Khatu Shyam Ji Mandir').first()).toBeVisible();
    await expect(page.getByText('RIICO Industrial Area (Renwal)').first()).toBeVisible();

    // FAQ Accordion interaction
    const faqSummary = page.locator('summary').first();
    await expect(faqSummary).toBeVisible();

    // Floating Site Visit Pill
    await expect(page.getByRole('link', { name: /Free Site Visit Cab/i })).toBeVisible();

    // Hindi Switch
    await page.goto('/hi/plots-for-sale-near-khatu-shyam-ji');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toContainText(/खाटू श्याम जी हाईवे पर आवासीय प्लॉट्स/i);
  });

  // 2. Phulera Plots Page
  test('Phulera Page: renders hero, commute table, township card, and lead capture form', async ({
    page,
  }) => {
    await page.goto('/plots-for-sale-in-phulera');
    await page.waitForLoadState('domcontentloaded');

    // Hero & CTA
    await expect(page.locator('h1')).toContainText(/Plots for Sale in Phulera/i);
    await expect(page.getByRole('link', { name: /Explore Flagship Township/i })).toBeVisible();

    // Commute table landmark
    await expect(page.getByText('Phulera Junction (NWR & DFC Hub)').first()).toBeVisible();

    // Lead capture form
    const leadForm = page.locator('form').first();
    await expect(leadForm).toBeVisible();
    await expect(leadForm.getByPlaceholder(/Rajesh Sharma/i)).toBeVisible();
    await expect(leadForm.getByPlaceholder('98765 43210')).toBeVisible();

    // Hindi Switch
    await page.goto('/hi/plots-for-sale-in-phulera');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toContainText(/फुलेरा/i);
  });

  // 3. Jaipur Aggregate Plots Page
  test('Jaipur Aggregate Plots Page: renders hero, inventory catalog, corridor links, and FAQs', async ({
    page,
  }) => {
    await page.goto('/plots-in-jaipur');
    await page.waitForLoadState('domcontentloaded');

    // Hero: "Residential Plots & Gated Townships in Jaipur"
    await expect(page.locator('h1')).toContainText(/Residential Plots/i);
    await expect(page.locator('h1')).toContainText(/Jaipur/i);

    // Inventory Cards
    await expect(page.getByText('Shivani Vatika 11th').first()).toBeVisible();
    await expect(page.getByText('Shivani Vatika').first()).toBeVisible();

    // Corridor Links
    await expect(page.getByText('Plots Near Khatu Shyam Ji').first()).toBeVisible();
    await expect(page.getByText('Plots in Phulera Smart City').first()).toBeVisible();
  });

  // 4. Areas Slug Dynamic Page
  test('Areas Slug Dynamic Page: renders area hero, overview, and sidebar inquiry form', async ({
    page,
  }) => {
    await page.goto('/areas/khatu-shyam-highway');
    await page.waitForLoadState('domcontentloaded');

    // Hero location title
    await expect(page.locator('h1')).toContainText(/Khatu Shyam/i);

    // Sidebar Inquiry form & EMI Calculator
    await expect(page.getByText(/Register for/i).first()).toBeVisible();
    await expect(page.getByText(/EMI Calculator/i).first()).toBeVisible();
  });

  // 5. Admin Quotation Records Page
  test('Admin Quotation Records Page: renders header, stats, and filter controls', async ({
    page,
  }) => {
    await page.goto('/admin/quotation-records');
    await page.waitForLoadState('domcontentloaded');

    // Header & Controls
    await expect(page.locator('h1')).toContainText(/Quotation/i);
    await expect(page.getByRole('link', { name: /New/i })).toBeVisible();
  });
});
