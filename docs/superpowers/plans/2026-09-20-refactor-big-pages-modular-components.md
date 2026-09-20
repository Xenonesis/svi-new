# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the remaining monolithic pages (>280 lines) across the public site, employee portal, and admin panel into focused, single-responsibility components and headless hooks without breaking any user-facing or backend functionality, and delete all unused imports and unreferenced files after completion.

**Architecture:** Decompose monolithic Next.js pages into presentational UI primitives, domain subcomponents, and headless React hooks. Extract inline KPI stats grids, complex multi-tab layouts, realtime event listeners, and modal orchestrations into isolated modules within `src/components/` and `src/hooks/`. Reduce each target `page.tsx` to a declarative coordinator (under 50–90 lines).

**Tech Stack:** Next.js 16 (App Router / RSC / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion), Supabase, TanStack Query, Sonner, Vitest, Testing Library.

**Spec:** User prompt: "plan to Refactor big pages into smaller focused components without breaking any functionality. Make sure to delete any unused imports or files after the operation is done."

---

## Global Constraints

- **Zero Functional Regression**: All existing form validation, realtime subscriptions, search params syncing, Supabase DB mutations, and navigation pathways must behave identically.
- **Brand Standards**: Maintain official SVI corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#d98b40` / `#D4AF37`, Navy `#003366`, Slate).
- **TypeScript Strictness**: No `: any` or `as any`. Use concrete interfaces and `import type`. `npm run typecheck` must pass with 0 errors after every single task.
- **Test Integrity**: All Vitest test suites must pass at every verification checkpoint.
- **Dead Code Cleanup**: Delete unreferenced files, remove orphaned imports, and prune unused local variables/functions immediately after refactoring each page.
- **Impact Analysis**: Run GitNexus impact analysis before modifying any shared symbol.

---

## Target Pages Overview

| Page                                       | Current Lines | Target Lines | Key Extractions                                                                    |
| ------------------------------------------ | ------------- | ------------ | ---------------------------------------------------------------------------------- |
| `app/admin/workforce/page.tsx`             | 471           | ~85          | `useWorkforcePageModals.ts`, `WorkforceTabContent.tsx`                             |
| `app/[locale]/(main)/areas/page.tsx`       | 376           | ~55          | `AreasHero.tsx`, `AreasWhyInvest.tsx`, `AreaCard.tsx`, `AreasCta.tsx`              |
| `app/admin/email/page.tsx`                 | 326           | ~65          | `EmailHeader.tsx`, `EmailTabNav.tsx`, `EmailTabContent.tsx`, `useEmailRealtime.ts` |
| `app/admin/ivr/page.tsx`                   | 307           | ~60          | `IvrStatsGrid.tsx`, `IvrTabNav.tsx`, `useIvrData.ts`                               |
| `app/employee/login/page.tsx`              | 281           | ~45          | `EmployeeLoginHeader.tsx`, `EmployeeLoginForm.tsx`                                 |
| `app/[locale]/(main)/blog/[slug]/page.tsx` | 386           | ~90          | `BlogPostHeader.tsx`, `BlogPostTakeaways.tsx`, `BlogPostAuthorCard.tsx`            |

---

## Task Breakdown

### Task 1: Refactor `app/admin/workforce/page.tsx` (471 lines → ~85 lines)

**Target:** Extract the complex modal/drawer state and action handlers (delete employee, toggle active, reset password, etc.) into `useWorkforcePageModals.ts`, and extract the dynamic tab router switch into `WorkforceTabContent.tsx`.

**Files:**

- Create: `src/components/admin/workforce/useWorkforcePageModals.ts`
- Create: `src/components/admin/workforce/WorkforceTabContent.tsx`
- Create: `__tests__/components/admin/workforce/useWorkforcePageModals.test.ts`
- Modify: `app/admin/workforce/page.tsx`

**Interfaces:**

- Produces `useWorkforcePageModals`:
  ```ts
  export interface WorkforceModalsState {
    showAddModal: boolean;
    setShowAddModal: (open: boolean) => void;
    showBulkImportModal: boolean;
    setShowBulkImportModal: (open: boolean) => void;
    editingEmployee: Employee | null;
    setEditingEmployee: (emp: Employee | null) => void;
    resetTarget: Employee | null;
    setResetTarget: (emp: Employee | null) => void;
    performanceTarget: Employee | null;
    setPerformanceTarget: (emp: Employee | null) => void;
    isMarkModalOpen: boolean;
    setIsMarkModalOpen: (open: boolean) => void;
    employeeToDelete: Employee | null;
    setEmployeeToDelete: (emp: Employee | null) => void;
    deletingEmployee: boolean;
    toggleActiveTarget: Employee | null;
    setToggleActiveTarget: (emp: Employee | null) => void;
    togglingActive: boolean;
    payrollSubTab: 'monthly' | 'structures';
    setPayrollSubTab: (sub: 'monthly' | 'structures') => void;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    editingStructure: SalaryStructure | null;
    setEditingStructure: (struct: SalaryStructure | null) => void;
    previewPayslipItem: PayrollItem | null;
    setPreviewPayslipItem: (item: PayrollItem | null) => void;
    handleConfirmDeleteEmployee: () => Promise<void>;
    handleConfirmToggleActive: () => Promise<void>;
  }
  ```
- Produces `WorkforceTabContent`:

  ```tsx
  export interface WorkforceTabContentProps {
    activeTab: WorkforceTab;
    token: string;
    // workforce data & modal triggers
    employees: Employee[];
    loadingEmployees: boolean;
    teams: string[];
    salaryStructures: SalaryStructure[];
    pendingLeavesCount: number;
    pendingRegularizationsCount: number;
    liveStatuses: Record<string, unknown>[];
    liveStatusMap: Map<string, unknown>;
    fetchEmployees: () => Promise<void>;
    fetchTeams: () => Promise<void>;
    fetchSalaryStructures: () => Promise<void>;
    fetchMetrics: () => Promise<void>;
    modals: WorkforceModalsState;
  }
  export function WorkforceTabContent(props: WorkforceTabContentProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `useWorkforcePageModals`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `useWorkforcePageModals.ts` and `WorkforceTabContent.tsx`**
- [ ] **Step 4: Update `app/admin/workforce/page.tsx` and run tests**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 2: Refactor `app/[locale]/(main)/areas/page.tsx` (376 lines → ~55 lines)

**Target:** Extract the Hero section, Why Invest corridor benefits, individual Area Card, and Bottom Advisory CTA into modular components under `src/components/areas/`.

**Files:**

- Create: `src/components/areas/AreasHero.tsx`
- Create: `src/components/areas/AreasWhyInvest.tsx`
- Create: `src/components/areas/AreaCard.tsx`
- Create: `src/components/areas/AreasCta.tsx`
- Create: `__tests__/components/areas/AreaCard.test.tsx`
- Modify: `app/[locale]/(main)/areas/page.tsx`

**Interfaces:**

- Produces `AreaCard`:
  ```tsx
  export interface AreaCardProps {
    area: AreaInfo;
    visual?: {
      image: string;
      badge: { en: string; hi: string };
      projectsPreview: Array<{ name: string; slug?: string }>;
    };
    isHindi: boolean;
  }
  export function AreaCard(props: AreaCardProps): React.JSX.Element;
  ```
- Produces `AreasHero`:
  ```tsx
  export function AreasHero({ isHindi }: { isHindi: boolean }): React.JSX.Element;
  ```
- Produces `AreasWhyInvest`:
  ```tsx
  export function AreasWhyInvest({ isHindi }: { isHindi: boolean }): React.JSX.Element;
  ```
- Produces `AreasCta`:

  ```tsx
  export function AreasCta({ isHindi }: { isHindi: boolean }): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `AreaCard`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `AreaCard.tsx`, `AreasHero.tsx`, `AreasWhyInvest.tsx`, and `AreasCta.tsx`**
- [ ] **Step 4: Update `app/[locale]/(main)/areas/page.tsx` to compose the subcomponents**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 3: Refactor `app/admin/email/page.tsx` (326 lines → ~65 lines)

**Target:** Extract header actions, tab navigation with badge counts, tab content switch, and realtime subscription hook. Fix type violation (`icon: React.ComponentType<any>` → `LucideIcon`).

**Files:**

- Create: `src/components/admin/email/EmailHeader.tsx`
- Create: `src/components/admin/email/EmailTabNav.tsx`
- Create: `src/components/admin/email/EmailTabContent.tsx`
- Create: `src/components/admin/email/useEmailRealtime.ts`
- Create: `__tests__/components/admin/email/EmailTabNav.test.tsx`
- Modify: `app/admin/email/page.tsx`

**Interfaces:**

- Produces `useEmailRealtime`:
  ```ts
  export function useEmailRealtime(): {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
  };
  ```
- Produces `EmailTabNav`:
  ```tsx
  import type { LucideIcon } from 'lucide-react';
  export interface EmailTabItem {
    id: Tab;
    label: string;
    icon: LucideIcon;
  }
  export interface EmailTabNavProps {
    tabs: EmailTabItem[];
    activeTab: Tab;
    onSelectTab: (tab: Tab) => void;
    unreadCount: number;
  }
  export function EmailTabNav(props: EmailTabNavProps): React.JSX.Element;
  ```
- Produces `EmailHeader`:

  ```tsx
  export interface EmailHeaderProps {
    onQuickCompose: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
  }
  export function EmailHeader(props: EmailHeaderProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `EmailTabNav`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `useEmailRealtime.ts`, `EmailTabNav.tsx`, `EmailHeader.tsx`, and `EmailTabContent.tsx`**
- [ ] **Step 4: Update `app/admin/email/page.tsx` to compose the components**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 4: Refactor `app/admin/ivr/page.tsx` (307 lines → ~60 lines)

**Target:** Extract IVR stats cards, tab navigation, and history data fetching hook. Fix `catch (err: any)` to `catch (err: unknown)`.

**Files:**

- Create: `src/components/admin/ivr/IvrStatsGrid.tsx`
- Create: `src/components/admin/ivr/IvrTabNav.tsx`
- Create: `src/components/admin/ivr/useIvrData.ts`
- Create: `__tests__/components/admin/ivr/IvrStatsGrid.test.tsx`
- Modify: `app/admin/ivr/page.tsx`

**Interfaces:**

- Produces `useIvrData`:
  ```ts
  export interface IvrDataState {
    calls: CallRecord[];
    totalCount: number;
    statics: { total: number; answered: number; missed: number };
    loading: boolean;
    page: number;
    setPage: (page: number) => void;
    fetchError: string | null;
    virtualNumber: string;
    setVirtualNumber: (v: string) => void;
    toNumber: string;
    setToNumber: (v: string) => void;
    fromNumber: string;
    setFromNumber: (v: string) => void;
    status: string;
    setStatus: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    fetchHistory: (targetPage?: number) => Promise<void>;
  }
  export function useIvrData(token: string | null, activeTab: string): IvrDataState;
  ```
- Produces `IvrStatsGrid`:
  ```tsx
  export interface IvrStatsGridProps {
    statics: { total: number; answered: number; missed: number };
    loading: boolean;
  }
  export function IvrStatsGrid(props: IvrStatsGridProps): React.JSX.Element;
  ```
- Produces `IvrTabNav`:

  ```tsx
  export type IvrTab = 'incoming' | 'outgoing' | 'dialer' | 'docs';
  export interface IvrTabNavProps {
    activeTab: IvrTab;
    onSelectTab: (tab: IvrTab) => void;
  }
  export function IvrTabNav(props: IvrTabNavProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `IvrStatsGrid`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `useIvrData.ts`, `IvrStatsGrid.tsx`, and `IvrTabNav.tsx`**
- [ ] **Step 4: Update `app/admin/ivr/page.tsx` to compose the subcomponents**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 5: Refactor `app/employee/login/page.tsx` (281 lines → ~45 lines)

**Target:** Extract top bar navigation (`EmployeeLoginHeader.tsx`) and the main login card with success overlay and form controls (`EmployeeLoginForm.tsx`).

**Files:**

- Create: `src/components/employee/login/EmployeeLoginHeader.tsx`
- Create: `src/components/employee/login/EmployeeLoginForm.tsx`
- Create: `__tests__/components/employee/login/EmployeeLoginHeader.test.tsx`
- Modify: `app/employee/login/page.tsx`

**Interfaces:**

- Produces `EmployeeLoginHeader`:
  ```tsx
  export interface EmployeeLoginHeaderProps {
    onOpenHelp: () => void;
  }
  export function EmployeeLoginHeader(props: EmployeeLoginHeaderProps): React.JSX.Element;
  ```
- Produces `EmployeeLoginForm`:

  ```tsx
  export function EmployeeLoginForm(): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `EmployeeLoginHeader`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `EmployeeLoginHeader.tsx` and `EmployeeLoginForm.tsx`**
- [ ] **Step 4: Update `app/employee/login/page.tsx` to render the clean layout**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 6: Refactor `app/[locale]/(main)/blog/[slug]/page.tsx` (386 lines → ~90 lines)

**Target:** Extract the blog detail header, key takeaways section, and author bio card into modular components under `src/components/blog/`.

**Files:**

- Create: `src/components/blog/BlogPostHeader.tsx`
- Create: `src/components/blog/BlogPostTakeaways.tsx`
- Create: `src/components/blog/BlogPostAuthorCard.tsx`
- Create: `__tests__/components/blog/BlogPostTakeaways.test.tsx`
- Modify: `app/[locale]/(main)/blog/[slug]/page.tsx`

**Interfaces:**

- Produces `BlogPostHeader`:
  ```tsx
  export interface BlogPostHeaderProps {
    title: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
    isHindi: boolean;
  }
  export function BlogPostHeader(props: BlogPostHeaderProps): React.JSX.Element;
  ```
- Produces `BlogPostTakeaways`:
  ```tsx
  export interface BlogPostTakeawaysProps {
    takeaways: string[];
    isHindi: boolean;
  }
  export function BlogPostTakeaways(props: BlogPostTakeawaysProps): React.JSX.Element;
  ```
- Produces `BlogPostAuthorCard`:

  ```tsx
  export interface BlogPostAuthorCardProps {
    author: string;
    isHindi: boolean;
  }
  export function BlogPostAuthorCard(props: BlogPostAuthorCardProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write unit test for `BlogPostTakeaways`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `BlogPostHeader.tsx`, `BlogPostTakeaways.tsx`, and `BlogPostAuthorCard.tsx`**
- [ ] **Step 4: Update `app/[locale]/(main)/blog/[slug]/page.tsx`**
- [ ] **Step 5: Verify with `npm run typecheck` and commit**

---

### Task 7: Comprehensive Cleanup & Verification

**Target:** Scan for unused imports, unreferenced files, and verify zero regressions across the codebase.

- [ ] **Step 1: Run dead code and unused import scan**
- [ ] **Step 2: Delete any orphaned files or unused exports created during refactoring**
- [ ] **Step 3: Run full TypeScript check (`npm run typecheck`)**
- [ ] **Step 4: Run full test suite (`npx vitest run`)**
- [ ] **Step 5: Final commit and verify Git working tree is clean**
