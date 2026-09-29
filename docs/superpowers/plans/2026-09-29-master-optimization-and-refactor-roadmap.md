# Master Optimization & Refactoring Roadmap: Easy to Complex

**Target Date:** 2026-09-29  
**Execution Strategy:** Phased approach ordered strictly from **Low Risk / Quick Win (Easy)** to **Deep Architectural Refactoring (Complex)**.  
**Strict Invariants:**

- Strict TypeScript (`tsc --noEmit` must pass with 0 errors).
- Zero functional regression in existing user flows, forms, document generators, and SEO schemas.
- Brand aesthetic: Obsidian Slate (`#080b11`), Gold accents (`#d4af37`), crisp typography.
- Run unit test suite (`vitest run`) and impact analysis before and after any structural change.

---

## Phase Overview & Complexity Order

```
[Phase 1: Easy / Quick Wins]
  ├── Task 1.1: Automated IndexNow Trigger Webhook / Post-Publish Sync
  ├── Task 1.2: AmenityFeature Rich Schema Markup on Corridor Money Pages
  └── Task 1.3: Embed Lightweight EMI & Appreciation Calculator in Landing Pages

[Phase 2: Medium / High Performance Impact]
  ├── Task 2.1: Dynamic Imports & Code Splitting for Heavy Admin Drawers / Modals
  ├── Task 2.2: Refactor `app/admin/offer-letter-records/page.tsx` (255 lines -> ~70 lines)
  └── Task 2.3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx` (268 lines -> ~80 lines)

[Phase 3: High / Complex Core Monolith Refactoring]
  ├── Task 3.1: Modularize `ReceiptLedgerDrawer.tsx` (1,289 lines -> 4 focused subcomponents)
  ├── Task 3.2: Modularize `TelecallingDashboard.tsx` (1,366 lines -> tab subcomponents + state hook)
  └── Task 3.3: Modularize `QuotationPreview.tsx` (1,878 lines -> template, breakdown & print modules)
```

---

## Detailed Task Specifications

### Phase 1: Easy (Search Automation, Schema Enrichment, Lightweight Calculator)

#### Task 1.1: Automated IndexNow Trigger Post-Publish Sync

- **Current state:** `app/api/indexnow/route.ts` exists and can manually receive a POST request.
- **Goal:** Add a helper function `triggerIndexNow(urls?: string[])` in `src/lib/indexnow.ts` so when admin actions update project status, blogs, or prices, the participating search engines (Bing, Yandex, Naver) get pinged automatically without manual invocation.
- **Verification:** Unit test covering `triggerIndexNow` with mocked `fetch` payload structure.

#### Task 1.2: AmenityFeature Rich Schema Markup on Corridor Money Pages

- **Current state:** `PlaceAndAreaSchema` and `RealEstateListingSchema` provide basic geographic and pricing metadata.
- **Goal:** Enrich `RealEstateListingSchema` and `PlaceAndAreaSchema` with Google/Schema.org standard `amenityFeature` (`LocationFeatureSpecification`):
  - 30 ft Blacktop Roads (`value: "30 ft"`, `name: "Wide Internal Roads"`)
  - Underground Water & Drainage Pipelines
  - Solar LED Street Lighting
  - Secured Boundary Wall & Entrance Archway
  - 80% Bank Loan Availability (SBI, HDFC, ICICI, Bank of Baroda)
  - Clear Section 90-A & Dakhil-Kharij Title
- **Files:** `src/components/common/Schema.tsx`, `plots-for-sale-near-khatu-shyam-ji/page.tsx`, `plots-near-renwal-railway-station/page.tsx`, `plots-in-jaipur-under-20-lakhs/page.tsx`.
- **Verification:** `npx tsc --noEmit` + Schema output verification in Vitest.

#### Task 1.3: Embed Corridor-Tailored EMI & Appreciation Calculator in Landing Pages

- **Current state:** `InteractiveCalculator` exists on home page and `/calculators`, but corridor landing pages (`plots-for-sale-near-khatu-shyam-ji` and `plots-near-renwal-railway-station`) lack an inline contextual calculator tailored to ₹6L–₹18.75L plots.
- **Goal:** Create a compact, luxury-styled `CorridorEmiWidget` in `src/components/plots/common/CorridorEmiWidget.tsx` using existing `calculateEMI` from `src/lib/emi.ts`. Add preset buttons (₹6 Lakhs, ₹11.25 Lakhs, ₹15 Lakhs) with instant monthly EMI breakdown (at 8.5% interest, 5-15 years).
- **Verification:** Visual & unit tests, zero CLS/hydration mismatch.

---

### Phase 2: Medium (Admin Code Splitting & Coordinator Extraction)

#### Task 2.1: Dynamic Imports & Code Splitting for Heavy Admin Modals

- **Current state:** Admin pages load all heavy modals synchronously in the client tree, increasing initial JS bundle size.
- **Goal:** Use `next/dynamic` with `ssr: false` for heavy client drawers:
  - `CreateUserModal`
  - `ResetPasswordModal`
  - `BulkImportEmployeesModal`
  - `ReceiptLedgerDrawer`
- **Verification:** `npx tsc --noEmit` + Vitest passing.

#### Task 2.2: Refactor `app/admin/offer-letter-records/page.tsx` (255 lines -> ~70 lines)

- **Current state:** 255 lines handling state, table rendering, filters, modals, and export logic directly in the page.
- **Goal:**
  - Extract `useOfferLetterRecords.ts` for filtering, fetching, pagination, and download states.
  - Extract `OfferLetterRecordsHeader.tsx` for search, status filters, and export action bar.
  - Extract `OfferLetterRecordsTable.tsx` for table presentation.
  - Reduce `page.tsx` to a clean declarative coordinator.
- **Verification:** Unit tests for hook and components; zero TypeScript warnings.

#### Task 2.3: Refactor `app/[locale]/(main)/admin/portal-allotments/page.tsx` (268 lines -> ~80 lines)

- **Current state:** Mix of state management, batch actions, search bar, and table coordination.
- **Goal:**
  - Extract subcomponents into `src/components/admin/portal-allotments/`.
  - Co-locate filter state and batch action triggers into custom hook `usePortalAllotmentsCoordinator.ts`.
- **Verification:** Unit tests and Playwright test suite for portal allotments.

---

### Phase 3: Complex (Core Monolith Component Decomposition)

#### Task 3.1: Modularize `ReceiptLedgerDrawer.tsx` (1,289 lines)

- **Breakdown:**
  1. `ReceiptLedgerHeader.tsx`: Customer info, balance pill, status indicator.
  2. `ReceiptTransactionsList.tsx`: Milestone cards, installment dates, payment modes.
  3. `ReceiptActionDrawer.tsx`: Refund request, custom receipt generation, send email/WhatsApp trigger.
  4. `useReceiptLedger.ts`: State management and Supabase mutation logic.

#### Task 3.2: Modularize `TelecallingDashboard.tsx` (1,366 lines)

- **Breakdown:**
  1. `TelecallingMetricsBar.tsx`: Connected calls, pending callbacks, conversions.
  2. `TelecallingQueueTable.tsx`: Customer list with lead score, quick disposition buttons.
  3. `TelecallingAudioModal.tsx`: Call recording player with playback speed and transcription snippet.
  4. `useTelecallingState.ts`: Active queue, filtering, and live dispositions.

#### Task 3.3: Modularize `QuotationPreview.tsx` (1,878 lines)

- **Breakdown:**
  1. `QuotationPricingBreakdown.tsx`: Plot cost, corner charges, PLC, development charges, GST.
  2. `QuotationPaymentSchedule.tsx`: Down payment, milestone installments, registry balance.
  3. `QuotationTermsLegal.tsx`: Cancellation policy, RERA/90-A disclaimer, validity period.
  4. `QuotationPrintView.tsx`: Strict print-media CSS layout for single/multi-page A4 PDF output.
