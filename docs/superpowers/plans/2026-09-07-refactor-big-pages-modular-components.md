# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor massive monolithic Next.js pages (>400 lines) into focused, single-responsibility components and custom hooks without breaking any user-facing or backend functionality, prune all unused imports and files, and verify behavior with end-to-end (E2E) tests.

**Architecture:** Extract headless state/data-fetching custom hooks and domain-specific UI components (headers, forms, live previews, modals, and tab drawers) across the top 5 largest pages (`app/admin/quotation`, `app/[locale]/(main)/login`, `app/admin/payment-receipt`, `app/[locale]/(main)/admin/portal-allotments`, and `app/admin/payment-plan`). Each page becomes a clean declarative orchestrator under 120 lines. A dedicated Playwright E2E suite (`e2e/tests/critical/refactored-pages.spec.ts`) validates end-to-end functionality.

**Tech Stack:** Next.js 16 (App Router / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Sonner, Playwright, Vitest.

**Spec:** User prompt: "plan to Refactor big pages into smaller focused components without breaking any functionality. Make sure to delete any unused imports or files after the operation is done. ,after it verify its functionality by e2e test"

---

## Global Constraints

- **Zero Regression**: Retain 100% of existing behavior, form state, database synchronization, validation logic, PDF/PNG exports, and UI styling.
- **Brand Standards**: Official corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#D4AF37`, Navy `#07111E`/`#0F172A`, Slate).
- **TypeScript Strictness**: `npx tsc --noEmit` MUST pass with zero errors after every task.
- **Unit & Integration Test Integrity**: Vitest suite (50 test files, 351 tests) MUST remain 100% green at all checkpoints.
- **E2E Test Verification**: Comprehensive Playwright test suite covering all 5 refactored pages must pass.
- **Dead Code Cleanup**: Explicitly remove dead imports and prune any unreferenced code after components are extracted.

---

## Task Breakdown

### Task 1: Refactor `app/admin/quotation/page.tsx` (612 lines → ~95 lines)

**Target:** Decompose the quotation generator page into a headless state hook, presentational header, and live preview container.

**Files:**

- Create: `src/components/admin/quotation/hooks/useQuotationPage.ts`
- Create: `src/components/admin/quotation/QuotationPageHeader.tsx`
- Create: `src/components/admin/quotation/QuotationLivePreview.tsx`
- Modify: `app/admin/quotation/page.tsx`
- Test: `__tests__/quotation/quotationNumber.test.ts` & `__tests__/quotation/calculateQuotation.test.ts`

**Interfaces:**

- `useQuotationPage()` returns:

  ```ts
  {
    formData: QuotationFormData;
    setFormData: React.Dispatch<React.SetStateAction<QuotationFormData>>;
    calculation: QuotationCalculationResult | null;
    tierCalculations: PricingTierCalculation[];
    projects: { value: string; label: string }[];
    loadingProjects: boolean;
    companyInfo: CompanyInfo;
    validationErrors: Partial<Record<keyof QuotationFormData, string>>;
    isSubmitting: boolean;
    templateLoading: boolean;
    loadingQuotationNo: boolean;
    hasPreview: boolean;
    pdfLoading: boolean;
    imageLoading: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleTiersChange: (tiers: PricingTier[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleResetForm: () => void;
    handleDownloadPDF: () => Promise<void>;
    handleDownloadPNG: () => Promise<void>;
    fetchNextQuotationNo: (date?: string) => Promise<string | undefined>;
  }
  ```

- [ ] **Step 1: Create `src/components/admin/quotation/hooks/useQuotationPage.ts`**
      Extract initial form data, stable quotation number ref, properties fetching, company info loading, templateId URL search param loading, live calculation, tier calculation, form validation, submit handler, and export handlers (PDF/PNG).

- [ ] **Step 2: Create `src/components/admin/quotation/QuotationPageHeader.tsx` and `QuotationLivePreview.tsx`**
  - `QuotationPageHeader.tsx`: Title banner, subtitle, template loading spinner, and "New Quotation" reset button.
  - `QuotationLivePreview.tsx`: Live preview container with fullscreen toggle, `PreviewContainer`, `QuotationPreview`, and `DownloadOptions`.

- [ ] **Step 3: Refactor `app/admin/quotation/page.tsx`**
      Replace monolithic inline logic with `useQuotationPage()`, `QuotationPageHeader`, `QuotationForm`, calculation summary card, and `QuotationLivePreview`. Remove all unused imports.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npx tsc --noEmit && npm test`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/quotation/ app/admin/quotation/page.tsx
  git commit -m "refactor(quotation): extract useQuotationPage hook, header, and live preview components"
  ```

---

### Task 2: Refactor `app/[locale]/(main)/login/page.tsx` (479 lines → ~85 lines)

**Target:** Decompose the customer portal login page into authentication state hook, method tab switcher, password login form, OTP login form, and success overlay.

**Files:**

- Create: `src/components/auth/useLoginForm.ts`
- Create: `src/components/auth/LoginMethodTabs.tsx`
- Create: `src/components/auth/LoginFormPassword.tsx`
- Create: `src/components/auth/LoginFormOtp.tsx`
- Create: `src/components/auth/LoginSuccessCard.tsx`
- Create: `src/components/auth/index.ts`
- Modify: `app/[locale]/(main)/login/page.tsx`

**Interfaces:**

- `useLoginForm()` returns:

  ```ts
  {
    loginMethod: 'password' | 'otp';
    setLoginMethod: (method: 'password' | 'otp') => void;
    identifier: string;
    setIdentifier: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    otp: string;
    setOtp: (val: string) => void;
    error: string;
    shake: boolean;
    setShake: (val: boolean) => void;
    isSubmitting: boolean;
    success: boolean;
    otpSent: boolean;
    showIdentifierError: boolean;
    showPasswordError: boolean;
    showOtpError: boolean;
    setIdentifierTouched: (val: boolean) => void;
    setPasswordTouched: (val: boolean) => void;
    setOtpTouched: (val: boolean) => void;
    handlePasswordLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleSendOtp: () => Promise<void>;
    handleOtpVerify: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    resetErrors: () => void;
  }
  ```

- [ ] **Step 1: Create `src/components/auth/useLoginForm.ts`**
      Extract Supabase auth flows (`signInWithPassword`, `signInWithOtp`, `verifyOtp`), form validation regexes, shake animations, role checking (`profiles.role === 'admin'`), active account check (`profile?.is_active === false`), and route redirection.

- [ ] **Step 2: Create modular login components in `src/components/auth/`**
  - `LoginMethodTabs.tsx`: Tab switcher between Password and OTP modes.
  - `LoginFormPassword.tsx`: Email input, password input with show/hide toggle, forgot password link, submit button.
  - `LoginFormOtp.tsx`: Email input, Send OTP trigger, 6-digit OTP input, Verify OTP submit button.
  - `LoginSuccessCard.tsx`: Luxury progress overlay with pulse icon and animated gold progress bar.
  - `index.ts`: Barrel export.

- [ ] **Step 3: Refactor `app/[locale]/(main)/login/page.tsx`**
      Assemble login view with `useLoginForm()`, `LoginMethodTabs`, active form component, error banner, and `LoginSuccessCard`. Prune unused imports and dead states.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npx tsc --noEmit && npm test`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/auth/ app/[locale]/(main)/login/page.tsx
  git commit -m "refactor(auth): extract modular login forms, tabs, and useLoginForm hook"
  ```

---

### Task 3: Refactor `app/admin/payment-receipt/page.tsx` (478 lines → ~90 lines)

**Target:** Extract the 100-line `numberToWords` helper, receipt state hook, and header component.

**Files:**

- Create: `src/lib/receipt/numberToWords.ts`
- Create: `__tests__/receipt/numberToWords.test.ts`
- Create: `app/admin/payment-receipt/hooks/usePaymentReceiptForm.ts`
- Create: `app/admin/payment-receipt/components/PaymentReceiptHeader.tsx`
- Modify: `app/admin/payment-receipt/page.tsx`
- Test: `__tests__/admin/payment-receipt/PaymentReceiptForm.test.tsx`

**Interfaces:**

- `numberToWords(num: string): string` — Converts monetary numbers to Indian currency words (Crore, Lakh, Thousand, Hundred) ending in "Only".
- `usePaymentReceiptForm()` returns:

  ```ts
  {
    formData: PaymentReceiptFormData;
    setFormData: React.Dispatch<React.SetStateAction<PaymentReceiptFormData>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleResetForm: () => void;
    preview: boolean;
    setPreview: React.Dispatch<React.SetStateAction<boolean>>;
    termsAccepted: boolean;
    setTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
    receipts: ReceiptLike[];
    companyInfo: CompanyInfoLike;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDownloadPDF: () => Promise<void>;
    handleDownloadImage: () => Promise<void>;
  }
  ```

- [ ] **Step 1: Create `src/lib/receipt/numberToWords.ts` and test `__tests__/receipt/numberToWords.test.ts`**
      Extract the pure Indian numbering system converter from the page body into a standalone library utility with comprehensive unit tests for zero, hundreds, thousands, lakhs, and crores.

- [ ] **Step 2: Create `app/admin/payment-receipt/hooks/usePaymentReceiptForm.ts`**
      Extract initial form data, receipt fetching, `getNextReceiptNumber` sequencing, company info loading, `loadFromRecord`, URL `templateId` and `sessionStorage` `prefillRegistration` parsing, submission, and PDF/PNG export logic.

- [ ] **Step 3: Create `app/admin/payment-receipt/components/PaymentReceiptHeader.tsx`**
      Extract page title banner, subtitle, and "New Receipt" reset button.

- [ ] **Step 4: Refactor `app/admin/payment-receipt/page.tsx`**
      Use `usePaymentReceiptForm()`, `PaymentReceiptHeader`, `PaymentReceiptForm`, and `PaymentReceiptPreview`. Remove all dead inline helpers and unused imports.

- [ ] **Step 5: Verify typecheck & test suite**
      Run: `npx tsc --noEmit && npm test`
      Expected: PASS

- [ ] **Step 6: Commit**
  ```bash
  git add src/lib/receipt/numberToWords.ts __tests__/receipt/numberToWords.test.ts app/admin/payment-receipt/
  git commit -m "refactor(receipt): extract numberToWords utility, usePaymentReceiptForm hook, and header"
  ```

---

### Task 4: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx` (466 lines → ~110 lines)

**Target:** Modularize portal allotments admin console into data hook, allotment create/edit modal, expandable payment schedules drawer, and row component.

**Files:**

- Create: `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`
- Create: `src/components/admin/portal-allotments/PortalAllotmentFormModal.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentScheduleDrawer.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx`
- Create: `src/components/admin/portal-allotments/index.ts`
- Modify: `app/[locale]/(main)/admin/portal-allotments/page.tsx`

**Interfaces:**

- `usePortalAllotmentsAdmin()` returns:

  ```ts
  {
    allotments: AllotmentRecord[];
    filteredAllotments: AllotmentRecord[];
    profiles: ProfileSummary[];
    properties: PropertySummary[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showModal: boolean;
    setShowModal: (open: boolean) => void;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    expandedAllotment: string | null;
    setExpandedAllotment: (id: string | null) => void;
    formData: AllotmentFormData;
    setFormData: React.Dispatch<React.SetStateAction<AllotmentFormData>>;
    handleSave: (e: React.FormEvent) => Promise<void>;
    handleDelete: (id: string) => Promise<void>;
    togglePaymentStatus: (paymentId: string, currentStatus: string) => Promise<void>;
    openCreateModal: () => void;
    openEditModal: (allotment: AllotmentRecord) => void;
  }
  ```

- [ ] **Step 1: Create `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`**
      Extract Supabase data fetching (`allotments`, `profiles`, `properties`), client search filtering, form state management, create/update/delete handlers, and payment schedule status toggling.

- [ ] **Step 2: Create modal, drawer, and table row components**
  - `PortalAllotmentFormModal.tsx`: Accessible dialog for creating and editing allotment details with profile, property, unit number, area, total cost, and booking date.
  - `PortalAllotmentScheduleDrawer.tsx`: Expandable drawer showing milestone payment schedules, status badges, and status toggle buttons.
  - `PortalAllotmentTableRow.tsx`: Table row / card rendering customer profile, property unit, financial totals, and action buttons.
  - `index.ts`: Barrel export.

- [ ] **Step 3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx`**
      Compose the page declaratively with search header, table body, drawer, and modal. Remove dead inline state and unused imports.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npx tsc --noEmit && npm test`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/portal-allotments/ app/[locale]/(main)/admin/portal-allotments/page.tsx
  git commit -m "refactor(portal-allotments): modularize allotment admin table, modal, and usePortalAllotmentsAdmin hook"
  ```

---

### Task 5: Refactor `app/admin/payment-plan/page.tsx` (403 lines → ~75 lines)

**Target:** Modularize payment plan generator into state hook, form component, header, and dedicated printable preview card.

**Files:**

- Create: `src/components/admin/payment-plan/types.ts`
- Create: `src/components/admin/payment-plan/usePaymentPlanForm.ts`
- Create: `src/components/admin/payment-plan/PaymentPlanHeader.tsx`
- Create: `src/components/admin/payment-plan/PaymentPlanForm.tsx`
- Create: `src/components/admin/payment-plan/PaymentPlanPreview.tsx`
- Create: `src/components/admin/payment-plan/index.ts`
- Modify: `app/admin/payment-plan/page.tsx`

**Interfaces:**

- `usePaymentPlanForm()` returns:

  ```ts
  {
    formData: PaymentPlanFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    preview: boolean;
    setPreview: (val: boolean) => void;
    documentId: string | null;
    schedule: PaymentPlanScheduleItem[];
    totals: { totalCost: number; balance: number; emiAmount: number };
    calculatePlan: (e: React.FormEvent) => Promise<void>;
    handleDownloadPDF: () => Promise<void>;
    handleDownloadImage: () => Promise<void>;
  }
  ```

- [ ] **Step 1: Create `types.ts` and `usePaymentPlanForm.ts`**
      Extract form data interfaces, EMI schedule calculation algorithm (`totalCost = size * rate; emiAmount = balance / emiCount`), document saving (`POST /api/admin/documents` with type `payment_plan`), and PDF/PNG exporters.

- [ ] **Step 2: Create `PaymentPlanHeader.tsx`, `PaymentPlanForm.tsx`, and `PaymentPlanPreview.tsx`**
  - `PaymentPlanHeader.tsx`: Title banner and subtitle.
  - `PaymentPlanForm.tsx`: Input grid for unitNo, plotSize, propertyType, costPerSqYd, bookingAmount, emis, startDate, and calculate button.
  - `PaymentPlanPreview.tsx`: Printable document preview card with property summary, EMI schedule breakdown table, and signature block.

- [ ] **Step 3: Refactor `app/admin/payment-plan/page.tsx`**
      Assemble the page using `usePaymentPlanForm()`, `PaymentPlanHeader`, `PaymentPlanForm`, and `PaymentPlanPreview` within `PreviewContainer` and `DownloadOptions`. Delete all unused imports.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npx tsc --noEmit && npm test`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/payment-plan/ app/admin/payment-plan/page.tsx
  git commit -m "refactor(payment-plan): extract modular form, preview, and usePaymentPlanForm hook"
  ```

---

### Task 6: E2E Playwright Verification & Final Cleanup

**Target:** Create a comprehensive E2E test suite covering all 5 refactored pages, verify functionality in browser runtime, and prune any remaining unused imports or files.

**Files:**

- Create: `e2e/tests/critical/refactored-pages.spec.ts`
- Modify: `docs/superpowers/plans/2026-09-07-refactor-big-pages-modular-components.md` (check off steps)

- [ ] **Step 1: Create `e2e/tests/critical/refactored-pages.spec.ts`**
      Implement comprehensive tests:
  1. **Login Page (`/login`)**: Verify password and OTP tabs switch correctly, email validation errors display, and submit buttons trigger loading state.
  2. **Quotation Generator (`/admin/quotation`)**: Verify page renders, form accepts inputs (plot area, basic rate), calculation summary updates, and live preview container renders.
  3. **Payment Receipt (`/admin/payment-receipt`)**: Verify receipt form renders with default receipt number, accepts amount, and amount in words is auto-populated.
  4. **Payment Plan (`/admin/payment-plan`)**: Verify plan form accepts inputs (plot size, cost/sq.yd, EMIs), calculation triggers schedule generation, and live preview renders.
  5. **Portal Allotments Admin (`/admin/portal-allotments`)**: Verify table/cards render, search filter input is responsive, and Create Allotment modal opens.

- [ ] **Step 2: Run the new E2E test suite**
      Run: `npx playwright test e2e/tests/critical/refactored-pages.spec.ts`
      Expected: PASS

- [ ] **Step 3: Prune dead code and run GitNexus detect-changes**
      Verify with `git status` and GitNexus:
      `node .gitnexus/run.cjs detect-changes --scope all --repo .`
      Ensure no orphaned files or dead imports remain.

- [ ] **Step 4: Run full Vitest test suite and TypeScript typecheck**
      Run: `npx tsc --noEmit && npm test`
      Expected: All pass.

- [ ] **Step 5: Commit and push**
  ```bash
  git add e2e/tests/critical/refactored-pages.spec.ts
  git commit -m "test(e2e): add end-to-end verification for refactored modular pages"
  ```
