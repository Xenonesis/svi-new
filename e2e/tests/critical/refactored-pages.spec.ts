import { test, expect } from '@playwright/test';

test.describe('Refactored Modular Pages E2E Suite', () => {
  test.describe.configure({ timeout: 60000 });

  // Test 1: Customer Login (/login)
  test('Customer Login (/login): renders title, tab switching, email validation, and password toggle', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify title and branding render
    await expect(page.locator('h1')).toContainText(/My Account|Account/i);
    await expect(
      page.locator('p').filter({ hasText: /log in to view your property documents/i })
    ).toBeVisible();

    // 2. Tab switching (Password tab vs OTP tab)
    const passwordTab = page.getByRole('button', { name: /^Password$/i });
    const otpTab = page.getByRole('button', { name: /Login with Code|Code/i });

    await expect(passwordTab).toBeVisible();
    await expect(otpTab).toBeVisible();

    // Password field is visible initially
    const loginForm = page.locator('form').first();
    const passwordInput = loginForm.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Switch to OTP tab
    await otpTab.click();
    await expect(page.getByRole('button', { name: /Send Code/i })).toBeVisible();
    await expect(loginForm.locator('input[type="password"]')).toHaveCount(0);

    // Switch back to Password tab
    await passwordTab.click();
    await expect(loginForm.locator('input[type="password"]')).toBeVisible();

    // 3. Verify email format validation error triggers when submitting invalid email
    const emailInput = loginForm.locator('input[type="email"]');
    await emailInput.fill('invalid-email-address');
    await emailInput.blur();

    // Validation error text appears
    await expect(page.locator('text=/Please enter a valid email address/i')).toBeVisible();

    // 4. Verify password visibility toggle works
    const passwordField = loginForm.locator('input[name="password"], input[placeholder*="••••"]');
    await passwordField.fill('secretPass123');
    await expect(passwordField).toHaveAttribute('type', 'password');

    const togglePasswordBtn = loginForm.getByRole('button', {
      name: /Show password|Hide password/i,
    });
    await expect(togglePasswordBtn).toBeVisible();

    // Click to show password
    await togglePasswordBtn.click();
    await expect(passwordField).toHaveAttribute('type', 'text');
    await expect(loginForm.getByRole('button', { name: /Hide password/i })).toBeVisible();

    // Click again to hide password
    await togglePasswordBtn.click();
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  // Test 2: Admin Quotation (/admin/quotation)
  test('Admin Quotation (/admin/quotation): renders title, form inputs, calculation summary updates, and live preview', async ({
    page,
  }) => {
    await page.goto('/admin/quotation');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify page title and "New Quotation" button render
    await expect(page.locator('h1')).toContainText(/Quotation/i);
    const newQuotationBtn = page.getByRole('button', { name: /New Quotation/i });
    await expect(newQuotationBtn).toBeVisible();

    // 2. Enter plot area ("100") and basic rate ("8000")
    const areaInput = page.locator('input[name="area"]');
    const basicRateInput = page.locator('input[name="basicRate"]');

    await expect(areaInput).toBeVisible();
    await expect(basicRateInput).toBeVisible();

    await areaInput.fill('100');
    await basicRateInput.fill('8000');

    // 3. Verify Calculation Summary card updates with computed totals
    // 100 * 8000 = 8,00,000 basic cost
    await expect(page.locator('text=/Calculation Summary/i')).toBeVisible();
    const basicPriceParagraph = page.getByRole('paragraph').filter({ hasText: /^₹8,00,000$/ });
    await expect(basicPriceParagraph).toBeVisible();

    // 4. Verify Live Preview container visibility
    await expect(page.locator('h2').filter({ hasText: /Live Preview/i })).toBeVisible();
    const previewContainer = page.locator('#quotationPreview');
    await expect(previewContainer).toBeVisible();
  });

  // Test 3: Admin Payment Receipt (/admin/payment-receipt)
  test('Admin Payment Receipt (/admin/payment-receipt): renders form, fills amount, auto-updates amount in words, and toggles preview', async ({
    page,
  }) => {
    await page.goto('/admin/payment-receipt');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify receipt form renders with auto-generated receipt number
    await expect(page.locator('h1')).toContainText(/Payment Receipt/i);
    const receiptNoInput = page.locator('input[name="receiptNo"]');
    await expect(receiptNoInput).toBeVisible();
    await expect(receiptNoInput).not.toHaveValue('');

    // 2. Fill required particulars and amount "25000"
    await page.locator('input[name="name"]').fill('Aditya Sharma');
    await page.locator('input[name="refId"]').fill('REF-1001');
    await page.locator('input[name="plotSize"]').fill('150');
    await page.locator('input[name="paymentRef"]').fill('UPI-987654');
    await page.locator('input[name="account"]').fill('Plot Advance');

    const amountInput = page.locator('input[name="amount"]');
    await amountInput.fill('25000');

    // 3. Verify Amount in Words is automatically populated with "Twenty Five Thousand Only"
    const amountWordsInput = page.locator('input[name="amountWords"]');
    await expect(amountWordsInput).toHaveValue(/Twenty Five Thousand (Rupees )?Only/i);

    // 4. Verify Preview / Submit toggle is responsive
    const generateBtn = page.getByRole('button', { name: /Generate Receipt/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Preview becomes active
    await expect(page.locator('#receiptPreview')).toBeVisible();
    await expect(page.locator('#receiptPreview')).toContainText(/SVI INFRA SOLUTIONS/i);

    // Click "New Receipt" to reset
    const newReceiptBtn = page.getByRole('button', { name: /New Receipt/i });
    await expect(newReceiptBtn).toBeVisible();
    await newReceiptBtn.click();
    await expect(amountInput).toHaveValue('');
  });

  // Test 4: Admin Payment Plan (/admin/payment-plan)
  test('Admin Payment Plan (/admin/payment-plan): fills configuration inputs, calculates plan, and verifies preview breakdown', async ({
    page,
  }) => {
    await page.goto('/admin/payment-plan');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify header renders
    await expect(page.locator('h1')).toContainText(/Payment Plan/i);

    // 2. Fill in unitNo/plotSize/costPerSqYd/bookingAmount/emis
    const unitNoInput = page.locator('input[name="unitNo"]');
    const plotSizeInput = page.locator('input[name="plotSize"]');
    const costPerSqYdInput = page.locator('input[name="costPerSqYd"]');
    const bookingAmountInput = page.locator('input[name="bookingAmount"]');
    const emisInput = page.locator('input[name="emis"]');

    await unitNoInput.fill('A-101');
    await plotSizeInput.fill('150');
    await costPerSqYdInput.fill('12000');
    await bookingAmountInput.fill('200000');
    await emisInput.fill('12');

    // 3. Click "Calculate & Generate Plan"
    const calculateBtn = page.getByRole('button', { name: /Calculate & Generate Plan/i });
    await expect(calculateBtn).toBeVisible();
    await calculateBtn.click();

    // 4. Verify Live Preview displays calculated total cost, balance, EMI metrics, and schedule breakdown table
    const planPreview = page.locator('#planPreview');
    await expect(planPreview).toBeVisible();

    // Metrics verification:
    // Total Cost: 150 * 12000 = 18,00,000
    await expect(planPreview).toContainText('18,00,000');
    // Booking Amount: 2,00,000
    await expect(planPreview).toContainText('2,00,000');
    // Balance Amount: 16,00,000
    await expect(planPreview).toContainText('16,00,000');
    // Unit Number
    await expect(planPreview).toContainText('A-101');
    // Plot Size
    await expect(planPreview).toContainText('150 Sq. Yds.');

    // Schedule breakdown verification:
    await expect(planPreview).toContainText(/Initial Payment/i);
    await expect(planPreview).toContainText(/Installment 1/i);
    await expect(planPreview).toContainText(/Installment 12/i);
  });

  // Test 5: Admin Portal Allotments (/admin/portal-allotments)
  test('Admin Portal Allotments (/admin/portal-allotments): renders title, search input responsiveness, and opens create allotment modal', async ({
    page,
  }) => {
    await page.goto('/admin/portal-allotments');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify title, Search input, and "Create Allotment" button render
    await expect(page.locator('h1')).toContainText(/Portal Allotments/i);

    const searchInput = page.locator('input[placeholder*="Search by client, property"]');
    await expect(searchInput).toBeVisible();

    const createBtn = page.getByRole('button', { name: /Create Allotment|Add Allotment/i });
    await expect(createBtn).toBeVisible();

    // 2. Type search query and verify input reflects text
    await searchInput.fill('Shyam Aangan');
    await expect(searchInput).toHaveValue('Shyam Aangan');

    // 3. Click "Create Allotment" and verify modal opens with form fields
    await createBtn.click();

    // Modal is visible
    const modal = page.locator('h2').filter({ hasText: /New Allotment/i });
    await expect(modal).toBeVisible();

    // Form fields in modal are rendered
    await expect(page.locator('label').filter({ hasText: /Client Profile/i })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /Property/i })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /Unit Number/i })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /Area \(sq yds\)/i })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /Total Cost/i })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: /Booking Date/i })).toBeVisible();

    // Modal action buttons
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    const saveBtn = page.getByRole('button', { name: /Save Allotment/i });
    await expect(cancelBtn).toBeVisible();
    await expect(saveBtn).toBeVisible();

    // Close modal via Cancel button
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });
});
