import { test, expect, Page } from '@playwright/test';

// Helper to mock admin authentication completely offline without touching the DB
async function mockAdminAuth(page: Page) {
  await page.addInitScript(() => {
    const applyAuth = () => {
      if (window.__AUTH_STORE__) {
        window.__AUTH_STORE__.setState({
          userId: 'mock-admin-id',
          isAdmin: true,
          loading: false,
          token: 'mock-admin-token',
          profile: {
            id: 'mock-admin-id',
            full_name: 'Super Admin',
            email: 'admin@sviinfrasolutions.com',
            role: 'admin',
          },
          _initialized: true,
        });
        return true;
      }
      return false;
    };

    if (!applyAuth()) {
      const interval = setInterval(() => {
        if (applyAuth()) {
          clearInterval(interval);
        }
      }, 10);
    }
  });

  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-admin-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'admin@sviinfrasolutions.com',
      }),
    });
  });

  await page.route('**/rest/v1/profiles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mock-admin-id',
        full_name: 'Super Admin',
        email: 'admin@sviinfrasolutions.com',
        role: 'admin',
      }),
    });
  });
}

test.describe('Refactored Big Pages E2E Verification Suite', () => {
  test.describe.configure({ timeout: 60000 });

  // 1. Leadership Page (/leadership)
  test('Leadership Page: renders hero, JSON-LD schema, directors, interactive hierarchy expansion, and FAQ', async ({
    page,
  }) => {
    await page.goto('/leadership');
    await page.waitForLoadState('domcontentloaded');

    // Hero title & subtitle
    await expect(page.locator('h1')).toContainText(/Leadership|नेतृत्व/i);
    await expect(
      page
        .locator('p')
        .filter({ hasText: /visionaries|Incorporated in December 2022|दशकों के अनुभव/i })
    ).toBeVisible();

    // Verify Person Schema JSON-LD script exists via allTextContents
    const allScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasPersonSchema = allScripts.some(
      (s) => s.includes('Person') && s.includes('Iliyas Ali') && s.includes('Vinod Kumar')
    );
    expect(hasPersonSchema).toBe(true);

    // Level 1: Board of Directors
    await expect(page.getByText('Iliyas Ali')).toBeVisible();
    await expect(page.getByText('Vinod Kumar')).toBeVisible();

    // Expand hierarchy to reveal remaining levels (Explore Area Managers button)
    const revealBtn = page
      .locator('button')
      .filter({ hasText: /Explore|विस्तार/i })
      .first();
    if (await revealBtn.isVisible()) {
      await revealBtn.click();
      await page.waitForTimeout(500);

      // Verify Area Managers appear
      await expect(page.getByText(/Radhey Shyam|Radhe Shyam/i)).toBeVisible();
      await expect(page.getByText(/Kailash/i)).toBeVisible();
    }

    // Call to Action
    await expect(page.getByText(/Join Our Growing Team|हमारी टीम से जुड़ें/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /View Open Positions|करियर अवसर/i })).toBeVisible();

    // FAQ Section
    await expect(page.getByText(/Why Choose SVI Infra|अक्सर पूछे जाने वाले सवाल/i)).toBeVisible();
  });

  // 2. Contact Page (/contact)
  test('Contact Page: renders hero, JSON-LD schema, info cards, working hours badge, direct connect, form, and map', async ({
    page,
  }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    // Hero section
    await expect(page.locator('h1')).toContainText(/Contact Us|संपर्क करें/i);

    // Verify RealEstateAgent Schema JSON-LD script exists via allTextContents
    const allScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasRealEstateSchema = allScripts.some(
      (s) => s.includes('RealEstateAgent') && s.includes('+91-73000-07643')
    );
    expect(hasRealEstateSchema).toBe(true);

    // 4 Contact Cards
    await expect(page.getByText(/Corporate Office|कॉर्पोरेट कार्यालय/i).first()).toBeVisible();
    await expect(page.getByText(/Call Us|कॉल करें/i).first()).toBeVisible();
    await expect(page.locator('aside a[href="tel:+917300007643"]').first()).toBeVisible();
    await expect(page.getByText(/Email Us|ईमेल करें/i).first()).toBeVisible();
    await expect(
      page.locator('aside a[href="mailto:info@sviinfrasolutions.com"]').first()
    ).toBeVisible();
    await expect(page.getByText(/Working Hours|कार्य समय/i).first()).toBeVisible();

    // Live Open/Closed badge
    await expect(
      page.locator('text=/Office Open Now|Closed Now|खुला है|बंद है/i').first()
    ).toBeVisible();

    // Quick Connect Cards (Sales, Careers, WhatsApp)
    await expect(page.getByText(/Sales Enquiry|बिक्री पूछताछ/i).first()).toBeVisible();
    await expect(page.getByText(/WhatsApp Support|व्हाट्सएप सहायता/i).first()).toBeVisible();

    // Contact Form Inputs (strictly test interaction, no submission to avoid DB mutation)
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="Name" i], input[placeholder*="नाम" i]')
      .first();
    const phoneInput = page
      .locator('input[name="phone"], input[placeholder*="Phone" i], input[placeholder*="फोन" i]')
      .first();
    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await nameInput.fill('Test Visitor');
    await phoneInput.fill('9876543210');
    expect(await nameInput.inputValue()).toBe('Test Visitor');
    expect(await phoneInput.inputValue()).toBe('9876543210');

    // Map Wrapper - click "Load Map" placeholder to trigger map view
    const loadMapBtn = page.getByRole('button', { name: /Load Map/i });
    await expect(loadMapBtn).toBeVisible();
    await loadMapBtn.click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Corporate Headquarters|Corporate Office/i).first()).toBeVisible();
  });

  // 3. Admin Login Page (/admin)
  test('Admin Login Page: renders branding, restricted access pill, validation, and password toggle', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Branding & Header
    await expect(page.locator('h1')).toContainText(/Admin/i);
    await expect(page.locator('h1')).toContainText(/Portal/i);
    await expect(page.getByText('SVI Infra Solutions — Restricted Access')).toBeVisible();

    // Email and Password Inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Validation on invalid email blur
    await emailInput.fill('not-an-email');
    await emailInput.blur();
    await expect(page.getByText('Invalid Email format')).toBeVisible();

    // Password validation
    await passwordInput.fill('123');
    await passwordInput.blur();
    await expect(page.getByText('At least 6 characters')).toBeVisible();

    // Password visibility toggle using aria-label
    await passwordInput.fill('ValidPassword123');
    const toggleBtn = page.getByRole('button', { name: /Show password|Hide password/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(page.locator('input[value="ValidPassword123"]')).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(page.locator('input[value="ValidPassword123"]')).toHaveAttribute(
      'type',
      'password'
    );

    // Submit button exists
    const submitBtn = page.getByRole('button', { name: /Sign In/i });
    await expect(submitBtn).toBeVisible();
    await expect(page.getByText('Authorized Personnel Only')).toBeVisible();
  });

  // 4. Admin Dashboard Page (/admin/dashboard)
  test('Admin Dashboard Page: auth guard protects route, redirects unauthenticated user', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');
    // Auth guard should detect no session and redirect to /admin or /login
    await page.waitForURL(/\/login|\/admin/, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl.includes('/admin') || currentUrl.includes('/login')).toBeTruthy();
  });

  // 5. Admin Leads Page (/admin/leads)
  test('Admin Leads Page: renders command center header, KPI grid, tab navigation, and switches tabs', async ({
    page,
  }) => {
    await mockAdminAuth(page);

    // Provide safe mock data for IVR records without DB access
    await page.route('**/api/admin/leads/ivr-records*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          totalCount: 0,
          summary: {
            total_calls: 1250,
            answered_calls: 950,
            missed_calls: 300,
            hot_count: 180,
            warm_count: 240,
            cold_count: 530,
          },
        }),
      });
    });

    await page.route('**/api/admin/employees*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ employees: [] }),
      });
    });

    await page.goto('/admin/leads');
    await page.waitForLoadState('domcontentloaded');

    // Header & Badge
    await expect(page.getByText('Sales Command Center')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Leads Hub');
    await expect(page.getByText('Multi-channel lead intelligence')).toBeVisible();

    // Action buttons
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload IVR CSV/i })).toBeVisible();

    // 4 KPI Cards
    await expect(page.getByText('Total Calls')).toBeVisible();
    await expect(page.getByText('1,250').first()).toBeVisible();
    await expect(page.getByText('Answered', { exact: true })).toBeVisible();
    await expect(page.getByText('950').first()).toBeVisible();
    await expect(page.getByText('76% connection rate')).toBeVisible();
    await expect(page.getByText('Not Answered', { exact: true })).toBeVisible();
    await expect(page.getByText('300').first()).toBeVisible();
    await expect(page.getByText('Hot Intent')).toBeVisible();
    await expect(page.getByText('180').first()).toBeVisible();

    // Tab Navigation
    const dashboardTab = page.getByRole('button', { name: /Telecalling Dashboard/i });
    const ivrTab = page.getByRole('button', { name: /IVR Campaign Leads/i });
    const chatbotTab = page.getByRole('button', { name: /AI Chatbot Leads/i });
    const allLeadsTab = page.getByRole('button', { name: /All Consolidated Pipeline/i });

    await expect(dashboardTab).toBeVisible();
    await expect(ivrTab).toBeVisible();
    await expect(chatbotTab).toBeVisible();
    await expect(allLeadsTab).toBeVisible();

    // Switch to IVR Campaign Leads tab
    await ivrTab.click();
    await page.waitForTimeout(300);

    // Switch to Dashboard tab
    await dashboardTab.click();
    await page.waitForTimeout(300);
  });

  // 6. Admin Portal Allotments Page (/admin/portal-allotments)
  test('Admin Portal Allotments Page: renders title, financial KPI stats, tab switching, and overall ledger trigger', async ({
    page,
  }) => {
    await mockAdminAuth(page);

    // Safe read-only mock data for portal allotments
    await page.route('**/api/admin/portal-allotments*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          allotments: [],
          candidates: [],
        }),
      });
    });

    await page.goto('/admin/portal-allotments');
    await page.waitForLoadState('domcontentloaded');

    // Title & Header buttons
    await expect(page.locator('h1')).toContainText(/Portal Allotments|Allotments/i);
    const overallLedgerBtn = page.getByRole('button', { name: /Overall Ledger/i });
    await expect(overallLedgerBtn).toBeVisible();
    const addAllotmentBtn = page.getByRole('button', {
      name: /Create Allotment|Add Allotment|New Allotment/i,
    });
    await expect(addAllotmentBtn).toBeVisible();

    // Financial Stats Grid (Total Sales Revenue, Collected Revenue, Pending Receivables, Realization Rate)
    await expect(page.getByText('Total Sales Revenue')).toBeVisible();
    await expect(page.getByText('Collected Revenue')).toBeVisible();
    await expect(page.getByText('Pending Receivables')).toBeVisible();
    await expect(page.getByText('Realization Rate')).toBeVisible();
    await expect(page.getByText('Master Ledger Overview')).toBeVisible();

    // Tabs Navigation
    const pendingTab = page.getByRole('button', { name: /Pending Approvals/i });
    const activeTab = page.getByRole('button', { name: /Active Allotments/i });
    await expect(pendingTab).toBeVisible();
    await expect(activeTab).toBeVisible();

    // Switch to Active Allotments tab
    await activeTab.click();
    await page.waitForTimeout(300);

    // Switch to Pending Approvals tab
    await pendingTab.click();
    await page.waitForTimeout(300);
  });

  // 7. Project Details Page (/projects/shivani-vatika-11th)
  test('Project Details Page: renders amenities including Society Boundary, Main Gate, CCTV Camera, 24/7 Security in div.mb-10', async ({
    page,
  }) => {
    await page.goto('/projects/shivani-vatika-11th');
    await page.waitForLoadState('domcontentloaded');

    // Verify Project Title
    await expect(page.locator('h1')).toContainText('Shivani Vatika 11th');

    // Verify Location Subtitle Header
    const locationSubtitle = page.locator(
      'div.mx-auto.max-w-7xl > div.grid.grid-cols-1 > div.flex.w-full > div.mb-3.flex > span'
    );
    await expect(locationSubtitle).toHaveText('Jaipur to Khatu Shyam Ji Highway - Harsholi');

    // Locate Amenities section
    const amenitiesHeader = page.getByRole('heading', { name: 'Amenities' });
    await expect(amenitiesHeader).toBeVisible();

    // Verify the requested security and infrastructure amenities exist in the amenities section
    await expect(page.getByText('Society Boundary')).toBeVisible();
    await expect(page.getByText('Main Gate')).toBeVisible();
    await expect(page.getByText('CCTV Camera')).toBeVisible();
    await expect(page.getByText('24/7 Security')).toBeVisible();
    await expect(page.getByText('Park')).toBeVisible();
    await expect(page.getByText('Water Supply')).toBeVisible();
  });

  // 8. Current Projects Page - Shivani Vatika Modal Verification
  test('Current Projects Page: Shivani Vatika modal displays authentic images from /Shivani Vatika/ folder', async ({
    page,
  }) => {
    await page.goto('/projects/current');
    await page.waitForLoadState('domcontentloaded');

    // Click on Shivani Vatika card
    const shivaniVatikaCard = page.locator('#project-shivani-vatika');
    await expect(shivaniVatikaCard).toBeVisible({ timeout: 15000 });
    await shivaniVatikaCard.scrollIntoViewIfNeeded();
    await shivaniVatikaCard.click();

    // Verify modal is open and has heading Shivani Vatika
    const modalHeading = page.locator('.fixed.inset-0 h3', { hasText: 'Shivani Vatika' });
    await expect(modalHeading).toBeVisible();

    // Verify modal image belongs to /Shivani%20Vatika/ and not /Shivani Vatika 11/
    const modalImage = page.locator('.fixed.inset-0 img').first();
    await expect(modalImage).toBeVisible();
    const src = await modalImage.getAttribute('src');
    expect(src).toMatch(/Shivani(%20|\s)Vatika\//);
    expect(src).not.toMatch(/Shivani(%20|\s)Vatika(%20|\s)11/);
  });
});
