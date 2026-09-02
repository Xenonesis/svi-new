# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor massive monolithic Next.js pages (>400 lines) into focused, single-responsibility components and custom hooks without breaking any user-facing or backend functionality, and clean up all dead imports and orphaned files upon completion.

**Architecture:** Extract headless state/data-fetching custom hooks and domain-specific UI components (headers, form inputs, preview panels, modals, and tab switchers) across the top 5 largest pages (`app/admin/quotation`, `app/admin/payment-receipt`, `app/admin/payment-plan`, `app/[locale]/(main)/login`, and `app/[locale]/(main)/admin/portal-allotments`). Each page becomes a clean, declarative orchestrator under 130 lines.

**Tech Stack:** Next.js 16 (App Router / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Sonner, Vitest.

---

## Global Constraints

- **Zero Regression**: Retain 100% of existing behavior, form state, database synchronization, validation logic, PDF/PNG exports, and UI styling.
- **Brand Standards**: Use official corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#D4AF37`, Navy `#07111E`/`#0F172A`, Slate).
- **TypeScript Strictness**: `npm run typecheck` (`tsc --noEmit`) MUST pass with zero errors after every task.
- **Test Integrity**: Vitest suite (316 tests across 41 files) MUST remain green at all checkpoints.
- **Unused Import & File Removal**: Explicitly remove dead imports and prune any unreferenced code after components are extracted.

---

## Task Breakdown

### Task 1: Refactor `app/admin/quotation/page.tsx` (612 lines → ~120 lines)

**Target:** Decompose the quotation generator page into a headless state hook and presentational header.

**Files:**

- Create: `src/components/admin/quotation/hooks/useQuotationPage.ts`
- Create: `src/components/admin/quotation/QuotationPageHeader.tsx`
- Modify: `app/admin/quotation/page.tsx`
- Test: `__tests__/quotation/quotationNumber.test.ts` & `__tests__/quotation/calculateQuotation.test.ts`

**Interfaces:**

- `useQuotationPage()` returns:
  - `formData: QuotationFormData`, `setFormData`, `handleChange`
  - `calculation: QuotationCalculationResult | null`
  - `tierCalculations: PricingTierCalculation[]`
  - `projects: { value: string; label: string }[]`, `loadingProjects: boolean`
  - `companyInfo: CompanyInfo`
  - `validationErrors: Partial<Record<keyof QuotationFormData, string>>`
  - `isSubmitting: boolean`, `templateLoading: boolean`, `loadingQuotationNo: boolean`
  - `documentId: string | null`, `hasPreview: boolean`
  - `pdfLoading: boolean`, `imageLoading: boolean`
  - `handleSubmit: (e: React.FormEvent) => Promise<void>`
  - `handleDownloadPDF: () => Promise<void>`, `handleDownloadImage: () => Promise<void>`
  - `fetchNextQuotationNo: (date?: string) => Promise<string | undefined>`
  - `handleReset: () => void`

- [ ] **Step 1: Create `src/components/admin/quotation/hooks/useQuotationPage.ts`**
      Extract state management, `fetchNextQuotationNo`, properties fetching, company info loading, templateId URL search param loading, live calculation, form validation, submit handler, and export handlers.

- [ ] **Step 2: Create `src/components/admin/quotation/QuotationPageHeader.tsx`**
      Extract the luxury title banner, subtitle, template loading indicator, and "New Quotation" reset button.

- [ ] **Step 3: Refactor `app/admin/quotation/page.tsx` to orchestrate extracted units**
      Replace monolithic inline logic with `useQuotationPage()`, `QuotationPageHeader`, `QuotationForm`, `QuotationSummary`, `QuotationPreview`, and `DownloadOptions`. Remove all unused imports.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npm run typecheck && npx vitest run __tests__/quotation/`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/quotation/hooks/useQuotationPage.ts src/components/admin/quotation/QuotationPageHeader.tsx app/admin/quotation/page.tsx
  git commit -m "refactor(quotation): extract useQuotationPage hook and QuotationPageHeader"
  ```

---

### Task 2: Refactor `app/admin/payment-receipt/page.tsx` (476 lines → ~110 lines)

**Target:** Modularize receipt state, registration prefill from `sessionStorage`, template loading, and PDF/image export.

**Files:**

- Create: `app/admin/payment-receipt/hooks/usePaymentReceiptForm.ts`
- Create: `app/admin/payment-receipt/components/PaymentReceiptHeader.tsx`
- Modify: `app/admin/payment-receipt/page.tsx`
- Test: `__tests__/receipt/receiptNumber.test.ts`

**Interfaces:**

- `usePaymentReceiptForm()` returns:
  - `formData`, `setFormData`, `handleChange`, `handleReset`
  - `preview: boolean`, `setPreview`
  - `documentId: string | null`
  - `termsAccepted: boolean`, `setTermsAccepted`
  - `companyInfo`, `receipts`
  - `isSubmitting: boolean`
  - `pdfLoading: boolean`, `imageLoading: boolean`
  - `handleSubmit: (e: React.FormEvent) => Promise<void>`
  - `handleDownloadPDF: () => Promise<void>`, `handleDownloadImage: () => Promise<void>`

- [ ] **Step 1: Create `app/admin/payment-receipt/hooks/usePaymentReceiptForm.ts`**
      Extract initial form data, receipt fetching, `getNextReceiptNumber` sequence calculation, company info loading, `loadFromRecord`, URL `templateId` and `prefillRegistration` parsing, submission, and export logic.

- [ ] **Step 2: Create `app/admin/payment-receipt/components/PaymentReceiptHeader.tsx`**
      Extract the header title, subtitle, and "New Receipt" button.

- [ ] **Step 3: Refactor `app/admin/payment-receipt/page.tsx`**
      Use `usePaymentReceiptForm()` hook, `PaymentReceiptHeader`, `PaymentReceiptForm`, and `PaymentReceiptPreview`. Remove all unused imports.

- [ ] **Step 4: Verify typecheck & test suite**
      Run: `npm run typecheck && npx vitest run __tests__/receipt/`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add app/admin/payment-receipt/hooks/usePaymentReceiptForm.ts app/admin/payment-receipt/components/PaymentReceiptHeader.tsx app/admin/payment-receipt/page.tsx
  git commit -m "refactor(receipt): extract usePaymentReceiptForm hook and PaymentReceiptHeader"
  ```

---

### Task 3: Refactor `app/admin/payment-plan/page.tsx` (403 lines → ~85 lines)

**Target:** Extract the inline 200-line Payment Plan preview, plan form, header, and EMI calculation hook.

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
  - `formData`, `handleChange`
  - `preview: boolean`, `setPreview`
  - `documentId: string | null`
  - `schedule: PaymentPlanScheduleItem[]`
  - `totals: { totalCost: number; balance: number; emiAmount: number }`
  - `calculatePlan: (e: React.FormEvent) => Promise<void>`
  - `handleDownloadPDF: () => Promise<void>`, `handleDownloadImage: () => Promise<void>`

- [ ] **Step 1: Create `src/components/admin/payment-plan/types.ts` & `usePaymentPlanForm.ts`**
      Extract form types, schedule calculation algorithm, document save logic (`POST /api/admin/documents` with type `payment_plan`), and export handlers.

- [ ] **Step 2: Create `PaymentPlanHeader.tsx`, `PaymentPlanForm.tsx`, and `PaymentPlanPreview.tsx`**
      Extract the form with unit/size/rate/booking inputs, and the dedicated printable document preview card with EMI schedule table and totals. Export them from `src/components/admin/payment-plan/index.ts`.

- [ ] **Step 3: Refactor `app/admin/payment-plan/page.tsx`**
      Compose the page cleanly using the new modular components and hook. Delete dead inline code and unused imports.

- [ ] **Step 4: Verify typecheck**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/payment-plan/ app/admin/payment-plan/page.tsx
  git commit -m "refactor(payment-plan): extract modular form, preview, and usePaymentPlanForm hook"
  ```

---

### Task 4: Refactor `app/[locale]/(main)/login/page.tsx` (473 lines → ~110 lines)

**Target:** Decompose the main customer/admin login page into authentication method tabs, password login form, OTP login form, and success state.

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
  - `loginMethod: 'password' | 'otp'`, `setLoginMethod`
  - `identifier`, `setIdentifier`, `password`, `setPassword`, `otp`, `setOtp`
  - `error`, `shake`, `isSubmitting`, `success`, `otpSent`
  - `showIdentifierError`, `showPasswordError`, `showOtpError`
  - `handlePasswordLogin`, `handleSendOtp`, `handleOtpVerify`

- [ ] **Step 1: Create `src/components/auth/useLoginForm.ts`**
      Extract Supabase auth flows (`signInWithPassword`, `signInWithOtp`, `verifyOtp`), form validation, shake animations, role checking (`profiles.role === 'admin'`), and route navigation.

- [ ] **Step 2: Create modular login components**
      Create `LoginMethodTabs.tsx`, `LoginFormPassword.tsx`, `LoginFormOtp.tsx`, and `LoginSuccessCard.tsx`. Re-export from `src/components/auth/index.ts`.

- [ ] **Step 3: Refactor `app/[locale]/(main)/login/page.tsx`**
      Cleanly assemble the login card with header, tabs, active form, and success card. Delete redundant inline logic and unused imports.

- [ ] **Step 4: Verify typecheck**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/auth/ app/[locale]/(main)/login/page.tsx
  git commit -m "refactor(auth): extract modular login forms, tabs, and useLoginForm hook"
  ```

---

### Task 5: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx` (466 lines → ~130 lines)

**Target:** Decompose localized portal allotments admin console into data hook, filter/search bar, allotment creation modal, and expandable schedule table.

**Files:**

- Create: `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`
- Create: `src/components/admin/portal-allotments/PortalAllotmentFormModal.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentScheduleDrawer.tsx`
- Modify: `app/[locale]/(main)/admin/portal-allotments/page.tsx`

**Interfaces:**

- `usePortalAllotmentsAdmin()` returns:
  - `allotments`, `profiles`, `properties`, `loading`, `searchTerm`, `setSearchTerm`
  - `showModal`, `setShowModal`, `editingId`, `setEditingId`
  - `expandedAllotment`, `setExpandedAllotment`
  - `formData`, `setFormData`, `handleSave`, `handleDelete`, `togglePaymentStatus`

- [ ] **Step 1: Create `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`**
      Extract data querying (`supabase.from('allotments')`, `profiles`, `properties`), CRUD actions (`insert`, `update`, `delete`), and schedule payment status toggling.

- [ ] **Step 2: Create `PortalAllotmentFormModal.tsx` and `PortalAllotmentScheduleDrawer.tsx`**
      Separate the create/edit allotment modal and the expandable payment schedules drawer.

- [ ] **Step 3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx`**
      Orchestrate the page declaratively. Remove all dead inline handlers and unused imports.

- [ ] **Step 4: Verify typecheck**
      Run: `npm run typecheck`
      Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/admin/portal-allotments/ app/[locale]/(main)/admin/portal-allotments/page.tsx
  git commit -m "refactor(portal-allotments): modularize admin allotment console and modals"
  ```

---

### Task 6: Prune Dead Imports, Delete Orphaned Files & Full End-to-End Verification

**Target:** Ensure zero orphaned files, zero unused imports across the entire repository, and 100% test passing.

**Steps:**

- [ ] **Step 1: Scan and remove unused imports across modified files**
      Verify with ESLint / TypeScript that no unused variables or imports remain in touched files.

- [ ] **Step 2: Run GitNexus graph change detection**
      Execute `detect_changes({scope: "all"})` to verify that execution flows and impacted symbols remain healthy.

- [ ] **Step 3: Run comprehensive TypeScript typecheck**
      Run: `npm run typecheck`
      Expected: 0 errors.

- [ ] **Step 4: Run full Vitest test suite**
      Run: `npm run test`
      Expected: 316/316 tests pass across 41 test files.

- [ ] **Step 5: Commit and finalize**
  ```bash
  git add -A
  git commit -m "chore: prune dead imports and verify modular page refactoring"
  ```
