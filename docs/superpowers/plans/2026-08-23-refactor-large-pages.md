# Refactor Big Pages into Focused Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor bloated and monolithic `page.tsx` files across the codebase into smaller, focused, high-cohesion, testable React components without breaking any user-facing or admin functionality, and clean up any dead code / unused imports.

**Architecture:** Decompose monolithic pages by separating layout/view components, interactive modals, form logic, and data hooks. Reusable patterns such as document generator company info loaders, auth forms, hero headers, sidebars, and status banners will be extracted into dedicated component directories following `vercel-composition-patterns`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 7, Tailwind CSS v4, Lucide React, Motion (Framer Motion 13), TanStack Query, Supabase Client, Next-Intl.

## Global Constraints

- Never use `any` or loose inline casts; maintain strict TypeScript safety.
- Adhere to official company branding (`/logo.png`, Lucide icons).
- Preserve all existing animations, translations (`next-intl`), schema.org JSON-LD structured data, SEO metadata, and API interactions.
- All pre-push hooks (README check, vulnerability audit, console.log check, debugger check, secret scan, TypeScript typecheck) must pass.
- Clean up unused imports and obsolete files after each task.

---

### Task 1: Refactor `app/admin/lottery/page.tsx`

**Files:**

- Create: `src/components/admin/lottery/LotteryHeader.tsx`
- Create: `src/components/admin/lottery/LotteryStatusBanners.tsx`
- Create: `src/components/admin/lottery/LotteryModalsContainer.tsx`
- Modify: `app/admin/lottery/page.tsx`

**Interfaces:**

- `LotteryHeader`: receives `activeTab`, `onTabChange`, `onNewLottery`, `onSyncExisting`, `syncing`, `canSync`.
- `LotteryStatusBanners`: receives `errorMessage`, `successMessage`, `onDismissError`, `onDismissSuccess`.
- `LotteryModalsContainer`: manages rendering `EditCampaignModal`, `ViewParticipantsModal`, `BulkEmailModal`, and `DeleteConfirmModal` with stable typed callbacks.

- [ ] **Step 1: Create `src/components/admin/lottery/LotteryHeader.tsx`**
      Extract the command center header title, subtitle, tab buttons (Dashboard / New Lottery), and Sync to EmailCenter button.

- [ ] **Step 2: Create `src/components/admin/lottery/LotteryStatusBanners.tsx`**
      Extract the AnimatePresence animated error alert and success banner (including "Launch Arena" action link).

- [ ] **Step 3: Create `src/components/admin/lottery/LotteryModalsContainer.tsx`**
      Extract the 4 modal declarations into a clean container component.

- [ ] **Step 4: Update `app/admin/lottery/page.tsx`**
      Integrate `LotteryHeader`, `LotteryStatusBanners`, and `LotteryModalsContainer`, replacing over 250 lines of inline JSX with typed component calls.

- [ ] **Step 5: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**
      `git add app/admin/lottery/page.tsx src/components/admin/lottery/ && git commit -m "refactor(admin-lottery): extract header, banners, and modal container components"`

---

### Task 2: Refactor `app/[locale]/(main)/login/page.tsx`

**Files:**

- Create: `src/components/auth/LoginHeader.tsx`
- Create: `src/components/auth/LoginMethodTabs.tsx`
- Create: `src/components/auth/LoginSuccessOverlay.tsx`
- Create: `src/components/auth/PasswordLoginForm.tsx`
- Create: `src/components/auth/OtpLoginForm.tsx`
- Modify: `app/[locale]/(main)/login/page.tsx`

**Interfaces:**

- `LoginHeader`: renders icon, title, tagline.
- `LoginMethodTabs`: renders tab buttons for switching between password and OTP modes.
- `LoginSuccessOverlay`: renders luxury success state with user icon and gold progress bar.
- `PasswordLoginForm`: handles email + password inputs, validation errors, and submission.
- `OtpLoginForm`: handles email input, request OTP button, 6-digit OTP verify input, and submission.

- [ ] **Step 1: Create `src/components/auth/LoginHeader.tsx` & `LoginMethodTabs.tsx`**
      Extract header and tabs with responsive luxury styling and `next-intl` translation keys.

- [ ] **Step 2: Create `src/components/auth/LoginSuccessOverlay.tsx`**
      Extract animated glassmorphic overlay for successful authentication.

- [ ] **Step 3: Create `src/components/auth/PasswordLoginForm.tsx` & `OtpLoginForm.tsx`**
      Extract the password login form and the two-stage OTP authentication form with proper validation states.

- [ ] **Step 4: Update `app/[locale]/(main)/login/page.tsx`**
      Refactor `Login` page into a compact coordinator delegating to the subcomponents, dropping from 473 lines to < 100 lines.

- [ ] **Step 5: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**
      `git add app/[locale]/(main)/login/page.tsx src/components/auth/ && git commit -m "refactor(login): split monolithic login page into focused auth components"`

---

### Task 3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx`

**Files:**

- Create: `src/components/admin/portal-allotments/PortalAllotmentsHeader.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentModal.tsx`
- Create: `src/components/admin/portal-allotments/PortalAllotmentCard.tsx`
- Modify: `app/[locale]/(main)/admin/portal-allotments/page.tsx`

**Interfaces:**

- `PortalAllotmentsHeader`: renders title, allotment count badge, search bar, and "New Allotment" trigger button.
- `PortalAllotmentModal`: handles create/edit allotment modal dialog with customer dropdown, property dropdown, unit number, area, total cost, and booking date.
- `PortalAllotmentCard`: renders an individual allotment item with property/user details, edit/delete actions, and expandable payment schedules table.

- [ ] **Step 1: Create `PortalAllotmentsHeader.tsx`**
      Extract search, counts, and modal action header.

- [ ] **Step 2: Create `PortalAllotmentModal.tsx`**
      Extract allotment create/update modal form.

- [ ] **Step 3: Create `PortalAllotmentCard.tsx`**
      Extract allotment card with expandable payment schedule timeline.

- [ ] **Step 4: Update `app/[locale]/(main)/admin/portal-allotments/page.tsx`**
      Replace 466 lines with concise state management and extracted components.

- [ ] **Step 5: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**
      `git add app/[locale]/(main)/admin/portal-allotments/page.tsx src/components/admin/portal-allotments/ && git commit -m "refactor(admin-allotments): decompose portal allotments page into header, card, and modal components"`

---

### Task 4: Refactor Document Generator Pages (`quotation`, `offer-letter`, `payment-receipt`, `payment-plan`, `allotment-letter`, `bba`)

**Files:**

- Create: `src/components/admin/DocumentGenerator/useCompanyInfo.ts`
- Create: `src/components/admin/DocumentGenerator/DocumentPageHeader.tsx`
- Modify: `app/admin/quotation/page.tsx`
- Modify: `app/admin/offer-letter/page.tsx`
- Modify: `app/admin/payment-receipt/page.tsx`
- Modify: `app/admin/payment-plan/page.tsx`
- Modify: `app/admin/allotment-letter/page.tsx`
- Modify: `app/admin/bba/page.tsx`

**Interfaces:**

- `useCompanyInfo(token)`: custom hook that loads company settings with fallback to standard corporate metadata.
- `DocumentPageHeader`: standard document header with icon, title, subtitle, and action buttons.

- [ ] **Step 1: Create `useCompanyInfo.ts` & `DocumentPageHeader.tsx`**
      Standardize company info fetching logic and header presentation.

- [ ] **Step 2: Refactor `app/admin/quotation/page.tsx` and `app/admin/offer-letter/page.tsx`**
      Apply `useCompanyInfo` and `DocumentPageHeader`.

- [ ] **Step 3: Refactor `app/admin/payment-receipt/page.tsx`, `payment-plan/page.tsx`, `allotment-letter/page.tsx`, and `bba/page.tsx`**
      Apply `useCompanyInfo` and `DocumentPageHeader`.

- [ ] **Step 4: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**
      `git add app/admin/ src/components/admin/DocumentGenerator/ && git commit -m "refactor(document-generator): extract shared useCompanyInfo hook and DocumentPageHeader"`

---

### Task 5: Refactor `app/[locale]/(main)/blog/[slug]/page.tsx`

**Files:**

- Create: `src/components/blog/BlogPostHero.tsx`
- Create: `src/components/blog/BlogPostJsonLd.tsx`
- Create: `src/components/blog/BlogPostSidebar.tsx`
- Create: `src/components/blog/BlogPostTakeaways.tsx`
- Modify: `app/[locale]/(main)/blog/[slug]/page.tsx`

**Interfaces:**

- `BlogPostHero`: hero banner with back link, category badge, reading time, heading, author, and date.
- `BlogPostJsonLd`: Schema.org structured data scripts (Article, BreadcrumbList, FAQPage).
- `BlogPostSidebar`: sticky sidebar with Table of Contents, Newsletter CTA, Related Posts, and Consultation card.
- `BlogPostTakeaways`: highlighted key takeaways section.

- [ ] **Step 1: Create `src/components/blog/BlogPostHero.tsx` & `BlogPostJsonLd.tsx`**
      Extract hero and JSON-LD schema scripts.

- [ ] **Step 2: Create `src/components/blog/BlogPostSidebar.tsx` & `BlogPostTakeaways.tsx`**
      Extract sidebar and key takeaways.

- [ ] **Step 3: Update `app/[locale]/(main)/blog/[slug]/page.tsx`**
      Streamline blog detail page into a clear composite structure.

- [ ] **Step 4: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**
      `git add app/[locale]/(main)/blog/[slug]/page.tsx src/components/blog/ && git commit -m "refactor(blog): extract hero, structured data, takeaways, and sidebar components"`

---

### Task 6: Refactor `app/[locale]/(main)/leadership/page.tsx`

**Files:**

- Create: `src/components/leadership/LeadershipHero.tsx`
- Create: `src/components/leadership/DirectorCard.tsx`
- Create: `src/components/leadership/HierarchyAccordion.tsx`
- Create: `src/components/leadership/LeadershipCta.tsx`
- Modify: `app/[locale]/(main)/leadership/page.tsx`

**Interfaces:**

- `LeadershipHero`: renders section header with luxury gradient background and subtitle.
- `DirectorCard`: renders executive director profile cards with bios and icons.
- `HierarchyAccordion`: renders collapsible levels for Area Managers, HR, Team Leads, and Staff.
- `LeadershipCta`: renders call-to-action banner for joining the team or contacting leadership.

- [ ] **Step 1: Create `LeadershipHero.tsx` & `DirectorCard.tsx`**
      Extract leadership hero and director profile cards.

- [ ] **Step 2: Create `HierarchyAccordion.tsx` & `LeadershipCta.tsx`**
      Extract hierarchy accordion and bottom CTA.

- [ ] **Step 3: Update `app/[locale]/(main)/leadership/page.tsx`**
      Refactor `Leadership` page component to compose these subcomponents.

- [ ] **Step 4: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**
      `git add app/[locale]/(main)/leadership/page.tsx src/components/leadership/ && git commit -m "refactor(leadership): split leadership page into hero, director cards, hierarchy, and CTA components"`

---

### Task 7: Refactor `app/[locale]/(main)/contact/page.tsx`

**Files:**

- Create: `src/components/contact/ContactHero.tsx`
- Create: `src/components/contact/ContactSidebar.tsx`
- Modify: `app/[locale]/(main)/contact/page.tsx`

**Interfaces:**

- `ContactHero`: hero section with ambient gold orb, title, subtitle, and gold rule.
- `ContactSidebar`: sidebar containing office address, phone, email, live office hours badge, and Google Maps link.

- [ ] **Step 1: Create `src/components/contact/ContactHero.tsx`**
      Extract hero banner.

- [ ] **Step 2: Create `src/components/contact/ContactSidebar.tsx`**
      Extract contact details and hours sidebar.

- [ ] **Step 3: Update `app/[locale]/(main)/contact/page.tsx`**
      Simplify contact page structure.

- [ ] **Step 4: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**
      `git add app/[locale]/(main)/contact/page.tsx src/components/contact/ && git commit -m "refactor(contact): extract ContactHero and ContactSidebar components"`

---

### Task 8: Refactor `app/admin/notifications/page.tsx`

**Files:**

- Create: `src/components/admin/notifications/hooks/useAdminNotifications.ts`
- Modify: `app/admin/notifications/page.tsx`

**Interfaces:**

- `useAdminNotifications()`: encapsulates user auth detection, filter state, debounced search, TanStack Query pagination, realtime Supabase subscriptions, selection state, and bulk action mutations (mark as read, delete).

- [ ] **Step 1: Create `src/components/admin/notifications/hooks/useAdminNotifications.ts`**
      Extract all state management, queries, realtime subscriptions, and mutation handlers into a clean custom hook.

- [ ] **Step 2: Update `app/admin/notifications/page.tsx`**
      Consume `useAdminNotifications`, reducing page from 389 lines to ~80 lines.

- [ ] **Step 3: Run typecheck and tests**
      Run: `pnpm typecheck && pnpm test`
      Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
      `git add app/admin/notifications/page.tsx src/components/admin/notifications/hooks/ && git commit -m "refactor(notifications): extract useAdminNotifications custom hook"`

---

### Task 9: Final Dead Code Cleanup & Full System Verification

- [ ] **Step 1: Scan for unused imports across modified files**
      Check all touched files for any unused imports, variables, or orphaned components.

- [ ] **Step 2: Run full TypeScript check**
      Run: `pnpm typecheck`
      Expected: 0 errors.

- [ ] **Step 3: Run full Vitest test suite**
      Run: `pnpm test`
      Expected: All 175 tests pass.

- [ ] **Step 4: Final verification and push**
      Push all commits to `main` branch ensuring pre-push hooks pass.
