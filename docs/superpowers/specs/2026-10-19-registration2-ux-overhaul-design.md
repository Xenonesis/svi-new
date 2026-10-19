# Technical Design Specification: `/registration2` Multi-Step Luxury Lottery Funnel

- **Date**: 2026-10-19
- **Status**: Approved by User
- **Target Route**: `/registration2`
- **Scope**: Architectural / UX Funnel Overhaul (Standalone parallel comparison page)

---

## 1. Executive Summary & Goals

The SVI lottery registration portal currently exposes a single-page 20+ field form at `/registration`. While comprehensive, the monolithic structure creates cognitive overload and drop-offs on mobile devices.

This design introduces a standalone, side-by-side alternative route `/registration2` engineered as a high-converting, 4-step luxury real estate registration funnel:

1. **Multi-Step Luxury Stepper**: Divided into 4 focused phases with smooth animations (`Step 1: Applicant Details`, `Step 2: KYC & Identity Studio`, `Step 3: Property Preferences & Calculator`, `Step 4: Executive Review & Submission`).
2. **Smart KYC Formatting & Live Preview**: Real-time 4-digit auto-spacing for Aadhaar (`XXXX XXXX 1234`), live regex green checkmark format indicator for PAN (`ABCDE1234F`), and an instant applicant KYC card preview.
3. **Interactive Scheme Calculator**: Real-time breakdown showing plot dimensions (sq. yd / sq. ft), scheme registration fee, and installment plans.
4. **Social Proof & Trust Widgets**: SVI Verified Scheme indicators, allottee count metrics, and dedicated WhatsApp support hotline.
5. **Zero Disruption to `/registration`**: Code lives strictly within `src/components/registration-v2/` and `app/[locale]/(main)/registration2/`, leaving the production `/registration` page untouched for side-by-side comparison.

_Note: Per explicit user direction (Option A), Mobile 1-Tap UPI Intent buttons and official RERA registration number seals are excluded from this phase._

---

## 2. Architecture & Directory Layout

```
app/[locale]/(main)/registration2/
  ├── layout.tsx                     # Page metadata and OpenGraph configuration
  └── page.tsx                       # Next-intl server wrapper rendering RegistrationWizardV2

src/components/registration-v2/
  ├── RegistrationWizardV2.tsx       # Main Stepper controller, step transitions & navigation
  ├── StepProgressBar.tsx            # Luxury gold step progress tracker (1 to 4)
  ├── TrustBannerV2.tsx              # Trust badge bar (SVI Verified, helpline, allottee stats)
  ├── SchemeCalculatorV2.tsx         # Interactive plot size and scheme booking fee widget
  ├── KycPreviewCard.tsx             # Live digital applicant ID pass preview card
  ├── steps/
  │    ├── Step1Applicant.tsx        # Personal & relative details form
  │    ├── Step2KycDocuments.tsx     # Smart Aadhaar, PAN, and document upload cards
  │    ├── Step3PropertyScheme.tsx   # Project selector, plot size, calculator & advisor
  │    └── Step4ReviewConfirm.tsx    # Final executive summary review before payment modal
  └── useRegistrationV2.ts           # Dedicated step-aware state hook with auto-save & validation
```

---

## 3. Detailed Component Specifications

### 3.1 `StepProgressBar.tsx`

- Displays active progress across 4 steps:
  1. `Applicant`
  2. `KYC & Address`
  3. `Property & Scheme`
  4. `Review & Pay`
- Renders an interactive luxury progress bar with gold active states (`#d4af37`), completed checkmarks, and accessible ARIA attributes (`aria-current="step"`).
- Fully responsive on mobile screens with compact icon-and-number badges.

### 3.2 `Step1Applicant.tsx` (Phase 1)

- **Inputs**: `firstName`, `lastName`, `mobileNo` (10-digit numeric constraint), `email` (auto-uppercase in UI, lowercased on API submit), `soWoDo` (with relation prefix selector `S/O`, `W/O`, `D/O`), and `dob` (date of birth with 18+ age validation).
- **Validation**: Enforces complete personal information before allowing navigation to Step 2.
- **Action**: Primary `Next: KYC & Identity Studio →` button.

### 3.3 `Step2KycDocuments.tsx` & `KycPreviewCard.tsx` (Phase 2)

- **Smart Aadhaar Input**: Automatically inserts a space after every 4 digits (`1234 5678 9012`) during input, capping at 12 digits.
- **Smart PAN Input**: Real-time format checking (`^[A-Z]{5}[0-9]{4}[A-Z]$`); displays a green `Format Valid` badge with a checkmark once complete.
- **Document Upload Cards**: Client-side image compression (max 150KB) for passport photo and PAN card.
- **Live KYC Pass (`KycPreviewCard.tsx`)**:
  - Displays a realistic, gold-trimmed digital card mockup with the user's uploaded photo thumbnail, capitalized full name, and masked Aadhaar (`•••• •••• 1234`).
- **Address & PIN Code Auto-Lookup**: Auto-fills State and District upon entering a valid 6-digit Indian PIN code.
- **Actions**: `← Back to Applicant` and `Next: Property Preferences →`.

### 3.4 `Step3PropertyScheme.tsx` & `SchemeCalculatorV2.tsx` (Phase 3)

- **Inputs**: Project selector (`Shyam Aangan`, `Shiv Vatika`, etc.), Property Size, Property Type, Plot Preference, Payment Plan, and Advisor.
- **Scheme Calculator Widget (`SchemeCalculatorV2.tsx`)**:
  - Dynamically calculates square yardage to square feet (e.g. 100 sq. yd = 900 sq. ft).
  - Displays token registration amount based on property size tier.
  - Summarizes payment schedule breakdown (One-time lump sum vs 3, 6, 12, 18, 24 months installment).
- **Actions**: `← Back to KYC` and `Next: Review & Confirm →`.

### 3.5 `Step4ReviewConfirm.tsx` (Phase 4)

- **Executive Review**: Formatted summary table separating Personal, KYC, and Property selections with 1-click edit shortcuts jumping back to the respective step.
- **Math Captcha**: Integrated challenge verification.
- **Action**: `Proceed to Payment →` button opening the existing `PaymentModal` component.

---

## 4. State Management & Data Flow (`useRegistrationV2.ts`)

- **State Interface**: Extends standard `FormData` (`src/types/registration.ts`).
- **Step Controller**: `currentStep: 1 | 2 | 3 | 4` with forward validation guards:
  - `validateStep(1)`: Validates name, phone, email, relation, dob.
  - `validateStep(2)`: Validates Aadhaar (12 digits), PAN format, uploads, and address.
  - `validateStep(3)`: Validates project, size, and payment plan.
  - `validateStep(4)`: Validates captcha answer before opening payment modal.
- **Auto-Save Draft**: Debounced write to `localStorage['svi_reg_draft_v2']` with automatic session restore prompt.
- **Capitalization Rule**: Converts string values to uppercase on input; transforms `email` to `.toLowerCase()` inside `buildBody()` for RFC-compliant API submission.

---

## 5. Security, Privacy & Integrity

1. **CSRF & Honeypot**: Hidden `website` bot trap field and signed CSRF cookie check identical to the primary registration route.
2. **Client Compression**: Compresses photos and PAN images client-side before submission to ensure payload remains under request limits.
3. **Data Protection**: Aadhaar display remains masked in previews (`•••• •••• 1234`).
4. **No Schema Changes**: Reuses existing Supabase `registrations` table schema and `/api/registration` endpoint without any migration requirement.

---

## 6. Verification & Quality Gates

1. `pnpm typecheck`: Zero TypeScript compile errors (`tsc --noEmit`).
2. `pnpm lint`: Zero ESLint warnings or errors (`eslint .`).
3. `pnpm vitest run`: All existing API and component tests pass without regression.
4. **GitNexus Analysis**: Run `detect-changes` to guarantee 0 broken call graph processes.
5. **Side-by-Side Validation**:
   - Verify `/registration` remains 100% operational in its existing monolithic layout.
   - Verify `/registration2` loads smoothly, passes all steps, performs validation, and completes registration flow.
