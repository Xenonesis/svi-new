# Registration2 Luxury Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, high-converting 4-step luxury lottery registration funnel at `/registration2` with multi-step stepper, smart KYC formatting & digital ID card preview, dynamic scheme pricing calculator, and trust widgets, leaving existing `/registration` 100% untouched.

**Architecture:** Client-side modular 4-step wizard in `src/components/registration-v2/` wrapped in a Next.js App Router server page `app/[locale]/(main)/registration2/page.tsx`. Driven by a custom step-aware hook `useRegistrationV2` handling granular forward-validation, auto-saving drafts, uppercase text management, and existing `/api/registration` payload compatibility.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Lucide React icons, Framer Motion (`motion/react`), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-19-registration2-ux-overhaul-design.md`

## Global Constraints

- Excluded from this phase per user instruction: Mobile 1-Tap UPI Intent buttons (`upi://pay`) and official RERA registration number seals.
- Minimum touch target size: 44px x 44px for mobile interactive controls.
- Color palette: Deep Obsidian Slate (`#080b11`, `#111622`) + Luxury Warm Gold (`#d4af37`, `#b89628`).
- Strict TypeScript: No `: any` or `as any`.
- Capitalization rule: Form inputs store and display text in UPPERCASE; `email` converts to `.toLowerCase()` upon submission payload dispatch.
- Zero changes or regressions to production `/registration` or existing database schemas.

---

### Task 1: Core Types, Scheme Calculator Logic & Utilities

**Files:**

- Create: `src/components/registration-v2/types.ts`
- Create: `src/components/registration-v2/schemeCalculator.ts`
- Test: `src/components/registration-v2/__tests__/schemeCalculator.test.ts`

**Interfaces:**

- Produces:
  - `type RegistrationV2Step = 1 | 2 | 3 | 4`
  - `interface SchemeBreakdown { sqYards: number; sqFeet: number; tokenAmount: number; planDescription: string }`
  - `function calculateSchemeDetails(size: string, project: string, plan: string): SchemeBreakdown`
  - `function formatAadhaarNumber(value: string): string`
  - `function isValidPan(pan: string): boolean`

- [ ] **Step 1: Write the failing tests for scheme calculator, Aadhaar formatting & PAN validation**

```typescript
// src/components/registration-v2/__tests__/schemeCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSchemeDetails, formatAadhaarNumber, isValidPan } from '../schemeCalculator';

describe('schemeCalculator & formatting utilities', () => {
  it('calculates square feet and token amount accurately for standard size', () => {
    const details = calculateSchemeDetails('100-200', 'shyam-aangan', 'one-time');
    expect(details.sqYards).toBe(100);
    expect(details.sqFeet).toBe(900);
    expect(details.tokenAmount).toBe(21000);
    expect(details.planDescription).toContain('Full Lump-sum Payment');
  });

  it('formats Aadhaar numbers with 4-digit spacing and caps at 12 digits', () => {
    expect(formatAadhaarNumber('123456789012')).toBe('1234 5678 9012');
    expect(formatAadhaarNumber('123456')).toBe('1234 56');
    expect(formatAadhaarNumber('1234567890123456')).toBe('1234 5678 9012');
  });

  it('validates standard Indian PAN format', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('ABCDE12345')).toBe(false);
    expect(isValidPan('abcde1234f')).toBe(true); // Case-insensitive check
    expect(isValidPan('12345')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/registration-v2/__tests__/schemeCalculator.test.ts`
Expected: FAIL with module not found or functions undefined.

- [ ] **Step 3: Implement types and utilities**

Create `src/components/registration-v2/types.ts`:

```typescript
import type { FormData } from '@/src/types/registration';

export type RegistrationV2Step = 1 | 2 | 3 | 4;

export interface SchemeBreakdown {
  sqYards: number;
  sqFeet: number;
  tokenAmount: number;
  planDescription: string;
}

export interface StepProps {
  formData: FormData;
  errors: Record<string, string>;
  attempted: boolean;
  t: (key: string) => string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}
```

Create `src/components/registration-v2/schemeCalculator.ts`:

```typescript
import type { SchemeBreakdown } from './types';

export function calculateSchemeDetails(
  size: string,
  _project: string,
  plan: string
): SchemeBreakdown {
  const sizeMap: Record<string, { yards: number; token: number }> = {
    '50-100': { yards: 50, token: 11000 },
    '100-200': { yards: 100, token: 21000 },
    '200-400': { yards: 200, token: 31000 },
    '400-700': { yards: 400, token: 51000 },
    '700-1000': { yards: 700, token: 75000 },
    '1000-1500': { yards: 1000, token: 100000 },
    '1500-2000': { yards: 1500, token: 150000 },
  };

  const parsed = sizeMap[size] || { yards: 100, token: 21000 };
  const sqFeet = parsed.yards * 9;

  let planDescription = 'Full Lump-sum Payment';
  if (plan === '3-months') planDescription = '3 Equal Monthly Installments';
  else if (plan === '6-months') planDescription = '6 Equal Monthly Installments';
  else if (plan === '12-months') planDescription = '12 Months Flexible Payment Plan';
  else if (plan === '18-months') planDescription = '18 Months Extended Scheme';
  else if (plan === '24-months') planDescription = '24 Months Milestone Plan';

  return {
    sqYards: parsed.yards,
    sqFeet,
    tokenAmount: parsed.token,
    planDescription,
  };
}

export function formatAadhaarNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function isValidPan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan.trim());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/registration-v2/__tests__/schemeCalculator.test.ts`
Expected: PASS (3/3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/components/registration-v2/types.ts src/components/registration-v2/schemeCalculator.ts src/components/registration-v2/__tests__/schemeCalculator.test.ts
git commit -m "feat(registration2): add types and scheme calculator utility with tests"
```

---

### Task 2: Step-Aware State Hook (`useRegistrationV2`)

**Files:**

- Create: `src/components/registration-v2/useRegistrationV2.ts`
- Modify: `src/components/registration-v2/types.ts`

**Interfaces:**

- Consumes: `src/types/registration.ts`, `src/components/registration-v2/schemeCalculator.ts`
- Produces: `useRegistrationV2` custom hook exposing `currentStep`, `goToStep`, `nextStep`, `prevStep`, `formData`, `errors`, `handleNextStep`, `handlePrevStep`, `isSubmitting`, `submitError`, etc.

- [ ] **Step 1: Implement `useRegistrationV2.ts`**

Include:

- `currentStep: 1 | 2 | 3 | 4`
- Local storage auto-save (`localStorage.getItem('svi_reg_draft_v2')`)
- Step-specific validation functions (`validateStep(1)`, `validateStep(2)`, `validateStep(3)`, `validateStep(4)`)
- Uppercase string conversion on text fields: `firstName`, `lastName`, `soWoDo`, `email`, `address`, `city`, `state`, `panNumber`, `advisorName`
- Clean email `.toLowerCase()` formatting during multipart dispatch to `/api/registration`
- File compression management for `photoFile` and `panCardFile`

- [ ] **Step 2: Run typecheck to verify hook compilation**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/registration-v2/useRegistrationV2.ts src/components/registration-v2/types.ts
git commit -m "feat(registration2): implement useRegistrationV2 step-aware state hook"
```

---

### Task 3: Progress Bar, Trust Banner & Step 1 Applicant

**Files:**

- Create: `src/components/registration-v2/StepProgressBar.tsx`
- Create: `src/components/registration-v2/TrustBannerV2.tsx`
- Create: `src/components/registration-v2/steps/Step1Applicant.tsx`

**Interfaces:**

- Produces:
  - `<StepProgressBar currentStep={1 | 2 | 3 | 4} onSelectStep={(step) => void} />`
  - `<TrustBannerV2 />` (SVI Verified Scheme, Helpline, 1,200+ Allottees)
  - `<Step1Applicant formData={formData} errors={errors} onChange={onChange} onNext={handleNextStep} />`

- [ ] **Step 1: Implement `StepProgressBar.tsx`**

Build gold luxury stepper header with 4 nodes, checkmarks for completed steps, active glowing ring for current step, and progress connecting bar.

- [ ] **Step 2: Implement `TrustBannerV2.tsx`**

Build top/bottom trust indicators:

- "SVI Verified Scheme" badge with shield icon.
- "1,200+ Allottees Registered in 2026" social proof pill.
- "Need Help? +91 9216014579" direct call/WhatsApp shortcut.

- [ ] **Step 3: Implement `Step1Applicant.tsx`**

Build Step 1 form with `firstName`, `lastName`, `mobileNo`, `email`, relation prefix (`S/O`, `W/O`, `D/O`) + relative name, and `dob`. Auto-uppercase and 44px min touch targets.

- [ ] **Step 4: Verify with Typecheck & Lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/registration-v2/StepProgressBar.tsx src/components/registration-v2/TrustBannerV2.tsx src/components/registration-v2/steps/Step1Applicant.tsx
git commit -m "feat(registration2): add StepProgressBar, TrustBannerV2, and Step1Applicant"
```

---

### Task 4: Step 2 Smart KYC Studio & ID Pass Preview

**Files:**

- Create: `src/components/registration-v2/KycPreviewCard.tsx`
- Create: `src/components/registration-v2/steps/Step2KycDocuments.tsx`

**Interfaces:**

- Consumes: `formatAadhaarNumber`, `isValidPan` from `schemeCalculator.ts`
- Produces:
  - `<KycPreviewCard fullName={name} photoUrl={url} aadhaarLast4={last4} panNumber={pan} />`
  - `<Step2KycDocuments ... />`

- [ ] **Step 1: Implement `KycPreviewCard.tsx`**

Build a luxury real estate digital ID card mockup:

- Obsidian dark background with gold borders.
- SVI Infra official logo / branding.
- Applicant photo thumbnail or placeholder avatar.
- Full name in bold gold typography.
- Masked Aadhaar (`•••• •••• 1234`).
- PAN number with verified checkmark chip.

- [ ] **Step 2: Implement `Step2KycDocuments.tsx`**

Build:

- Aadhaar input with auto-formatting space injection on typing (`XXXX XXXX 1234`).
- PAN input with live green validation checkmark badge.
- Passport photo and PAN card uploaders with drag-and-drop, client-side compression, and remove actions.
- Address section with PIN code smart auto-lookup for State & District.
- Side-by-side rendering with `KycPreviewCard` on desktop screens.
- Navigation buttons: `← Back to Applicant` and `Next: Property Preferences →`.

- [ ] **Step 3: Verify with Typecheck & Lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/registration-v2/KycPreviewCard.tsx src/components/registration-v2/steps/Step2KycDocuments.tsx
git commit -m "feat(registration2): implement smart KYC studio with live ID pass preview"
```

---

### Task 5: Step 3 Property Preferences & Interactive Calculator

**Files:**

- Create: `src/components/registration-v2/SchemeCalculatorV2.tsx`
- Create: `src/components/registration-v2/steps/Step3PropertyScheme.tsx`

**Interfaces:**

- Consumes: `calculateSchemeDetails` from `schemeCalculator.ts`
- Produces:
  - `<SchemeCalculatorV2 size={propertySize} project={project} plan={paymentPlan} />`
  - `<Step3PropertyScheme ... />`

- [ ] **Step 1: Implement `SchemeCalculatorV2.tsx`**

Interactive gold card showing:

- Selected Plot Dimensions in Sq. Yards & Sq. Feet (e.g. `100 Sq. Yd ≈ 900 Sq. Ft`).
- Registration Token Amount (e.g. `₹21,000`).
- Payment schedule description.
- Estimated lottery allotment timeline.

- [ ] **Step 2: Implement `Step3PropertyScheme.tsx`**

Build:

- Project selector dropdown (Shyam Aangan, Shiv Vatika, etc.).
- Property size radio pills / select cards.
- Property type & plot preference options.
- Payment plan and Advisor selection.
- Embedded `SchemeCalculatorV2` card.
- Navigation buttons: `← Back to KYC` and `Next: Review & Confirm →`.

- [ ] **Step 3: Verify with Typecheck & Lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/registration-v2/SchemeCalculatorV2.tsx src/components/registration-v2/steps/Step3PropertyScheme.tsx
git commit -m "feat(registration2): implement Step 3 property preferences and scheme calculator"
```

---

### Task 6: Step 4 Review, Wizard Shell & Page Route

**Files:**

- Create: `src/components/registration-v2/steps/Step4ReviewConfirm.tsx`
- Create: `src/components/registration-v2/RegistrationWizardV2.tsx`
- Create: `app/[locale]/(main)/registration2/layout.tsx`
- Create: `app/[locale]/(main)/registration2/page.tsx`

**Interfaces:**

- Consumes: `Step1Applicant`, `Step2KycDocuments`, `Step3PropertyScheme`, `Step4ReviewConfirm`, `PaymentModal`
- Produces:
  - Standalone page route `/registration2`

- [ ] **Step 1: Implement `Step4ReviewConfirm.tsx`**

Build:

- Comprehensive summary table showing Personal details, KYC details, and Property details with quick "Edit" buttons jumping back to Steps 1, 2, or 3.
- Integrated Math Captcha.
- `Proceed to Payment →` button triggering `PaymentModal`.

- [ ] **Step 2: Implement `RegistrationWizardV2.tsx`**

Combine:

- `StepProgressBar` at the top.
- `AnimatePresence` and `motion.div` for smooth step transitions.
- Render active step based on `currentStep`.
- Embed `TrustBannerV2` at top/bottom.
- Mount `PaymentModal` on confirmation.

- [ ] **Step 3: Implement `layout.tsx` & `page.tsx` in `app/[locale]/(main)/registration2/`**

Create server wrapper page with Next-intl translations and SEO metadata for `/registration2`.

- [ ] **Step 4: Verify with Typecheck & Lint**

Run: `pnpm typecheck && pnpm lint`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/registration-v2/steps/Step4ReviewConfirm.tsx src/components/registration-v2/RegistrationWizardV2.tsx app/[locale]/(main)/registration2/
git commit -m "feat(registration2): connect wizard shell, review step, and standalone page route"
```

---

### Task 7: End-to-End Verification & Quality Gates

**Files:**

- Verify: Full codebase

- [ ] **Step 1: Run complete typecheck**

Run: `pnpm typecheck`
Expected: PASS (0 errors).

- [ ] **Step 2: Run linter**

Run: `pnpm lint`
Expected: PASS (0 warnings, 0 errors).

- [ ] **Step 3: Run Vitest test suite**

Run: `pnpm vitest run src/components/registration-v2/__tests__/`
Expected: PASS (all tests green).

- [ ] **Step 4: Run GitNexus detect-changes**

Run: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
Expected: Low risk, 0 broken execution processes.

- [ ] **Step 5: Compare side-by-side**

Verify `/registration` loads existing single-page form as before, and `/registration2` loads new 4-step luxury wizard.
