# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the top monolithic pages into focused, high-performance, single-responsibility components and headless hooks without breaking any user-facing, SEO, or backend functionality, and prune all unused imports and unreferenced files after completion.

**Architecture:** Decompose monolithic Next.js pages into modular domain subcomponents, presentational sections, and custom hooks. Move data structures, transit tables, and schema payloads into dedicated co-located or feature component folders (`src/components/plots/` and `src/components/admin/quotation-records/`). Reduce each target `page.tsx` into a clean, declarative coordinator under 80–120 lines.

**Tech Stack:** Next.js 16 (App Router / RSC / Turbopack), React 19, TypeScript (strict mode, no `any`), Tailwind CSS v4, Lucide React, Supabase, Vitest, Testing Library.

**Spec:** User prompt: "plan to Refactor big pages into smaller focused components without breaking any functionality. Make sure to delete any unused imports or files after the operation is done."

---

## Global Constraints

- **Zero Functional Regression**: All existing form interactions, SEO schemas (`BreadcrumbSchema`, `PlaceAndAreaSchema`, `RealEstateListingSchema`, `FAQSchema`), WhatsApp brochure triggers, modal flows, and document exports must behave identically.
- **Brand Standards**: Maintain official SVI corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#d98b40` / `#D4AF37`, Navy `#003366`, Slate `#070b14`).
- **Strict TypeScript**: No `: any` or `as any`. Use concrete interfaces and `import type`. `npm run typecheck` (`tsc --noEmit`) must pass with 0 errors after every single task.
- **Test Integrity**: Vitest test suites must pass at every verification checkpoint.
- **Dead Code Cleanup**: Delete unreferenced files, remove orphaned imports, and prune unused local variables/functions immediately after refactoring each page.
- **Impact Analysis**: Run GitNexus impact analysis before modifying any shared symbol.

---

## Target Pages Overview

| Page                                                              | Current Lines | Target Lines | Key Extractions                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/(main)/plots-for-sale-near-khatu-shyam-ji/page.tsx` | 955           | ~85          | `KhatuHeroSection.tsx`, `KhatuStrategicGrowthSection.tsx`, `KhatuTownshipSpotlight.tsx`, `KhatuTransitMatrixSection.tsx`, `KhatuDueDiligenceSection.tsx`, `KhatuFaqAccordion.tsx`, `KhatuCtaBanner.tsx`, `khatuData.ts` |
| `app/[locale]/(main)/plots-for-sale-in-phulera/page.tsx`          | 853           | ~85          | `PhuleraHeroSection.tsx`, `PhuleraAdvantageSection.tsx`, `PhuleraTownshipSpotlight.tsx`, `PhuleraCommuteTable.tsx`, `PhuleraFaqSection.tsx`, `PhuleraLeadCaptureSection.tsx`, `phuleraData.ts`                          |
| `app/[locale]/(main)/plots-in-jaipur/page.tsx`                    | 550           | ~75          | `JaipurPlotsHero.tsx`, `JaipurProjectsInventoryGrid.tsx`, `JaipurCorridorDiscoveryHub.tsx`, `JaipurPlotsFaqSection.tsx`, `jaipurPlotsData.ts`                                                                           |
| `app/[locale]/(main)/areas/[slug]/page.tsx`                       | 403           | ~70          | `AreaHeroBanner.tsx`, `AreaGatewayCallout.tsx`, `AreaOverviewSection.tsx`, `AreaHighlightsGrid.tsx`, `AreaProjectsSection.tsx`, `AreaSidebarCard.tsx`                                                                   |
| `app/admin/quotation-records/page.tsx`                            | 271           | ~65          | `useQuotationRecords.ts`, `QuotationHeader.tsx`, `QuotationDetailsModal.tsx`                                                                                                                                            |

---

## Task Breakdown

### Task 1: Refactor `app/[locale]/(main)/plots-for-sale-near-khatu-shyam-ji/page.tsx` (955 lines → ~85 lines)

**Target:** Decompose the 955-line monolithic SEO corridor landing page into clean subcomponents and a typed data module under `src/components/plots/khatu-shyam/`.

**Files:**

- Create: `src/components/plots/khatu-shyam/khatuData.ts`
- Create: `src/components/plots/khatu-shyam/KhatuHeroSection.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuStrategicGrowthSection.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuTownshipSpotlight.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuTransitMatrixSection.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuDueDiligenceSection.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuFaqAccordion.tsx`
- Create: `src/components/plots/khatu-shyam/KhatuCtaBanner.tsx`
- Create: `__tests__/components/plots/KhatuShyamComponents.test.tsx`
- Modify: `app/[locale]/(main)/plots-for-sale-near-khatu-shyam-ji/page.tsx`

**Interfaces:**

- `khatuData.ts`:
  ```ts
  export interface FAQItem {
    question: string;
    answer: string;
  }
  export interface TransitNode {
    destination: string;
    destinationHi: string;
    time: string;
    distance: string;
    route: string;
    routeHi: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge: string;
    badgeHi: string;
    desc: string;
    descHi: string;
  }
  export const KHATU_FAQS_EN: FAQItem[];
  export const KHATU_FAQS_HI: FAQItem[];
  export const TRANSIT_MATRIX: TransitNode[];
  ```
- Component Props:
  - `KhatuHeroSection`: `{ isHindi: boolean }`
  - `KhatuStrategicGrowthSection`: `{ isHindi: boolean }`
  - `KhatuTownshipSpotlight`: `{ isHindi: boolean }`
  - `KhatuTransitMatrixSection`: `{ isHindi: boolean }`
  - `KhatuDueDiligenceSection`: `{ isHindi: boolean }`
  - `KhatuFaqAccordion`: `{ isHindi: boolean; faqs: FAQItem[] }`
  - `KhatuCtaBanner`: `{ isHindi: boolean }`

- [ ] **Step 1: Create `src/components/plots/khatu-shyam/khatuData.ts`**
      Extract `KHATU_FAQS_EN`, `KHATU_FAQS_HI`, `TRANSIT_MATRIX`, and their TypeScript interfaces.
- [ ] **Step 2: Create section subcomponents in `src/components/plots/khatu-shyam/`**
      Extract `KhatuHeroSection`, `KhatuStrategicGrowthSection`, `KhatuTownshipSpotlight`, `KhatuTransitMatrixSection`, `KhatuDueDiligenceSection`, `KhatuFaqAccordion`, and `KhatuCtaBanner`.
- [ ] **Step 3: Update `app/[locale]/(main)/plots-for-sale-near-khatu-shyam-ji/page.tsx`**
      Import extracted components, prune unused Lucide icons, and verify line count is under 90 lines.
- [ ] **Step 4: Write unit test in `__tests__/components/plots/KhatuShyamComponents.test.tsx`**
      Verify English and Hindi rendering of hero, transit matrix, and FAQ items.
- [ ] **Step 5: Run tests and typecheck**
      Run `npx tsc --noEmit` and `npx vitest run __tests__/components/plots/KhatuShyamComponents.test.tsx`.
- [ ] **Step 6: Git commit**
      `git commit -m "refactor(seo): modularize plots-for-sale-near-khatu-shyam-ji page"`

---

### Task 2: Refactor `app/[locale]/(main)/plots-for-sale-in-phulera/page.tsx` (853 lines → ~85 lines)

**Target:** Decompose the 853-line Phulera corridor page into focused components and static configuration under `src/components/plots/phulera/`.

**Files:**

- Create: `src/components/plots/phulera/phuleraData.ts`
- Create: `src/components/plots/phulera/PhuleraHeroSection.tsx`
- Create: `src/components/plots/phulera/PhuleraAdvantageSection.tsx`
- Create: `src/components/plots/phulera/PhuleraTownshipSpotlight.tsx`
- Create: `src/components/plots/phulera/PhuleraCommuteTable.tsx`
- Create: `src/components/plots/phulera/PhuleraFaqSection.tsx`
- Create: `src/components/plots/phulera/PhuleraLeadCaptureSection.tsx`
- Create: `__tests__/components/plots/PhuleraComponents.test.tsx`
- Modify: `app/[locale]/(main)/plots-for-sale-in-phulera/page.tsx`

**Interfaces:**

- `phuleraData.ts`:
  ```ts
  export interface PhuleraFaq {
    question: string;
    answer: string;
  }
  export interface CommuteRow {
    destination: string;
    destinationHi: string;
    distance: string;
    time: string;
    route: string;
  }
  export const PHULERA_FAQS_EN: PhuleraFaq[];
  export const PHULERA_FAQS_HI: PhuleraFaq[];
  export const COMMUTE_DATA: CommuteRow[];
  ```
- Component Props:
  - `PhuleraHeroSection`: `{ isHindi: boolean }`
  - `PhuleraAdvantageSection`: `{ isHindi: boolean }`
  - `PhuleraTownshipSpotlight`: `{ isHindi: boolean }`
  - `PhuleraCommuteTable`: `{ isHindi: boolean }`
  - `PhuleraFaqSection`: `{ isHindi: boolean; faqs: PhuleraFaq[] }`
  - `PhuleraLeadCaptureSection`: `{ isHindi: boolean; locale: string }`

- [ ] **Step 1: Create `src/components/plots/phulera/phuleraData.ts`**
      Extract FAQs, commute matrix, and investment pillars data.
- [ ] **Step 2: Create section components in `src/components/plots/phulera/`**
      Extract `PhuleraHeroSection`, `PhuleraAdvantageSection`, `PhuleraTownshipSpotlight`, `PhuleraCommuteTable`, `PhuleraFaqSection`, and `PhuleraLeadCaptureSection`.
- [ ] **Step 3: Update `app/[locale]/(main)/plots-for-sale-in-phulera/page.tsx`**
      Wire extracted components, clean up unused imports, and assert line count drops below 90 lines.
- [ ] **Step 4: Write unit test in `__tests__/components/plots/PhuleraComponents.test.tsx`**
      Verify English and Hindi rendering of hero, commute table, and lead capture.
- [ ] **Step 5: Run tests and typecheck**
      Run `npx tsc --noEmit` and `npx vitest run __tests__/components/plots/PhuleraComponents.test.tsx`.
- [ ] **Step 6: Git commit**
      `git commit -m "refactor(seo): modularize plots-for-sale-in-phulera page"`

---

### Task 3: Refactor `app/[locale]/(main)/plots-in-jaipur/page.tsx` (550 lines → ~75 lines)

**Target:** Modularize the Jaipur aggregate plots page into dedicated components in `src/components/plots/jaipur/`.

**Files:**

- Create: `src/components/plots/jaipur/jaipurPlotsData.ts`
- Create: `src/components/plots/jaipur/JaipurPlotsHero.tsx`
- Create: `src/components/plots/jaipur/JaipurProjectsInventoryGrid.tsx`
- Create: `src/components/plots/jaipur/JaipurCorridorDiscoveryHub.tsx`
- Create: `src/components/plots/jaipur/JaipurPlotsFaqSection.tsx`
- Create: `__tests__/components/plots/JaipurPlotsComponents.test.tsx`
- Modify: `app/[locale]/(main)/plots-in-jaipur/page.tsx`

**Interfaces:**

- `jaipurPlotsData.ts`:
  ```ts
  export interface CorridorLink {
    title: string;
    titleHi: string;
    href: string;
    desc: string;
    descHi: string;
    badge: string;
    badgeHi: string;
  }
  export const JAIPUR_FAQS_EN: Array<{ question: string; answer: string }>;
  export const JAIPUR_FAQS_HI: Array<{ question: string; answer: string }>;
  export const CORRIDORS_LIST: CorridorLink[];
  ```
- Component Props:
  - `JaipurPlotsHero`: `{ isHindi: boolean }`
  - `JaipurProjectsInventoryGrid`: `{ isHindi: boolean; locale: string }`
  - `JaipurCorridorDiscoveryHub`: `{ isHindi: boolean }`
  - `JaipurPlotsFaqSection`: `{ isHindi: boolean; faqs: Array<{ question: string; answer: string }> }`

- [ ] **Step 1: Create `src/components/plots/jaipur/jaipurPlotsData.ts`**
      Extract FAQs and corridor catalog cards.
- [ ] **Step 2: Create section subcomponents in `src/components/plots/jaipur/`**
      Extract `JaipurPlotsHero`, `JaipurProjectsInventoryGrid`, `JaipurCorridorDiscoveryHub`, and `JaipurPlotsFaqSection`.
- [ ] **Step 3: Update `app/[locale]/(main)/plots-in-jaipur/page.tsx`**
      Streamline page into a lean container. Prune unreferenced icons and imports.
- [ ] **Step 4: Write unit test in `__tests__/components/plots/JaipurPlotsComponents.test.tsx`**
      Verify inventory cards and corridor links render properly.
- [ ] **Step 5: Run tests and typecheck**
      Run `npx tsc --noEmit` and `npx vitest run __tests__/components/plots/JaipurPlotsComponents.test.tsx`.
- [ ] **Step 6: Git commit**
      `git commit -m "refactor(seo): modularize plots-in-jaipur landing page"`

---

### Task 4: Refactor `app/[locale]/(main)/areas/[slug]/page.tsx` (403 lines → ~70 lines)

**Target:** Modularize dynamic corridor/area detail page into reusable parts in `src/components/areas/detail/`.

**Files:**

- Create: `src/components/areas/detail/AreaHeroBanner.tsx`
- Create: `src/components/areas/detail/AreaGatewayCallout.tsx`
- Create: `src/components/areas/detail/AreaOverviewSection.tsx`
- Create: `src/components/areas/detail/AreaHighlightsGrid.tsx`
- Create: `src/components/areas/detail/AreaProjectsSection.tsx`
- Create: `src/components/areas/detail/AreaSidebarCard.tsx`
- Create: `__tests__/components/areas/AreaDetailComponents.test.tsx`
- Modify: `app/[locale]/(main)/areas/[slug]/page.tsx`

**Interfaces:**

- Component Props:
  - `AreaHeroBanner`: `{ area: Area; isHindi: boolean }`
  - `AreaGatewayCallout`: `{ area: Area; isHindi: boolean }`
  - `AreaOverviewSection`: `{ area: Area; isHindi: boolean }`
  - `AreaHighlightsGrid`: `{ area: Area; isHindi: boolean }`
  - `AreaProjectsSection`: `{ area: Area; associatedProjects: Project[]; isHindi: boolean }`
  - `AreaSidebarCard`: `{ area: Area; isHindi: boolean }`

- [ ] **Step 1: Create subcomponents in `src/components/areas/detail/`**
      Extract hero banner, gateway callout, overview, highlights grid, associated projects, and sidebar contact card.
- [ ] **Step 2: Update `app/[locale]/(main)/areas/[slug]/page.tsx`**
      Replace inline sections with extracted modular components and prune unused imports.
- [ ] **Step 3: Write unit test in `__tests__/components/areas/AreaDetailComponents.test.tsx`**
      Verify rendering with mocked area and project data.
- [ ] **Step 4: Run tests and typecheck**
      Run `npx tsc --noEmit` and `npx vitest run __tests__/components/areas/AreaDetailComponents.test.tsx`.
- [ ] **Step 5: Git commit**
      `git commit -m "refactor(areas): modularize areas slug page into focused subcomponents"`

---

### Task 5: Refactor `app/admin/quotation-records/page.tsx` (271 lines → ~65 lines)

**Target:** Extract quotation data fetching and deletion logic into a headless hook `useQuotationRecords.ts`, and extract header and detail view modal into dedicated components.

**Files:**

- Create: `src/components/admin/quotation-records/useQuotationRecords.ts`
- Create: `src/components/admin/quotation-records/QuotationHeader.tsx`
- Create: `src/components/admin/quotation-records/QuotationDetailsModal.tsx`
- Create: `__tests__/components/admin/useQuotationRecords.test.ts`
- Modify: `src/components/admin/quotation-records/index.ts`
- Modify: `app/admin/quotation-records/page.tsx`

**Interfaces:**

- `useQuotationRecords.ts`:

  ```ts
  export interface UseQuotationRecordsReturn {
    quotations: SavedQuotation[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    filteredQuotations: SavedQuotation[];
    selectedQuotation: SavedQuotation | null;
    setSelectedQuotation: (q: SavedQuotation | null) => void;
    deleteTarget: SavedQuotation | null;
    setDeleteTarget: (q: SavedQuotation | null) => void;
    deleteLoading: boolean;
    companyInfo: CompanyInfo;
    fetchQuotations: () => void;
    handleDeleteConfirm: () => Promise<void>;
    handleExportPDF: (q: SavedQuotation) => Promise<void>;
    handleExportImage: (q: SavedQuotation) => Promise<void>;
    pdfLoading: boolean;
    imageLoading: boolean;
    stats: {
      totalCount: number;
      totalValue: number;
      approvedCount: number;
      pendingCount: number;
    };
  }
  ```

- [ ] **Step 1: Create `src/components/admin/quotation-records/useQuotationRecords.ts`**
      Consolidate data fetching, filtering, stats calculations, export handlers, and deletion workflows.
- [ ] **Step 2: Create `QuotationHeader.tsx` and `QuotationDetailsModal.tsx`**
      Extract page title/refresh button and export/view modal overlay.
- [ ] **Step 3: Update `src/components/admin/quotation-records/index.ts`**
      Export new components and hook.
- [ ] **Step 4: Update `app/admin/quotation-records/page.tsx`**
      Reduce page to clean coordinator under 70 lines.
- [ ] **Step 5: Write unit tests in `__tests__/components/admin/useQuotationRecords.test.ts`**
      Verify search query filtering, status filtering, and stats calculations.
- [ ] **Step 6: Run tests and typecheck**
      Run `npx tsc --noEmit` and `npx vitest run __tests__/components/admin/useQuotationRecords.test.ts`.
- [ ] **Step 7: Git commit**
      `git commit -m "refactor(admin): extract quotation records state and modal into modular components"`

---

### Task 6: Audit Unused Imports, Dead Code & File Cleanup

**Target:** Audit all modified pages and component directories for unused imports, orphan variables, or redundant files.

- [ ] **Step 1: Run ESLint with `--fix` on modified directories**
      `npx eslint src/components/plots app/[locale]/(main)/plots* src/components/areas/detail src/components/admin/quotation-records --fix`
- [ ] **Step 2: Check for any orphaned imports or files**
      Verify no newly created or modified file has unused imports or dangling exports.
- [ ] **Step 3: Run full TypeScript check**
      `npm run typecheck` (`npx tsc --noEmit`)
- [ ] **Step 4: Run full Vitest test suite**
      `npx vitest run`
- [ ] **Step 5: Git commit**
      `git commit -m "chore: prune unused imports and cleanup dead code across refactored pages"`

---

## Plan Self-Review Checklist

1. **Spec Coverage**: Does the plan decompose big pages into smaller focused components without breaking functionality and delete unused imports/files? Yes, covers the 5 biggest monolithic pages with zero regression.
2. **No Placeholders**: All file paths, interfaces, and step commands are explicit with full definitions.
3. **Type Consistency**: Prop interfaces and data contracts are standardized across subcomponents and hooks.
