# Refactor Big Pages into Focused Modular Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the remaining monolithic Next.js pages (>300 lines) across the codebase into smaller, single-responsibility components and headless custom hooks without breaking any user-facing or backend functionality, followed by systematic pruning of dead imports and unreferenced files.

**Architecture:** Deconstruct data fetching, filter/sort state, modal state, document calculations, and export logic into domain-specific headless hooks (`useAdminNotifications`, `usePaymentReceiptsRecords`, `useLotteryWizard`, `useAllotmentLetterPage`, `useBbaPage`, `useEmployeeWorkTracker`, `useEmployeePayroll`). Extract presentational layouts into dedicated subcomponents (`LotteryViewsContainer`, `ReceiptModalsContainer`, `AllotmentLetterPreviewContainer`, `BbaPreviewContainer`, `WorkModalsContainer`). Each `page.tsx` file is reduced from 320-390 lines to a declarative coordinator under 80 lines.

**Tech Stack:** Next.js 16 (App Router / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Supabase, TanStack Query, Sonner, Vitest.

**Spec:** User prompt: "plan to Refactor big pages into smaller focused components without breaking any functionality. Make sure to delete any unused imports or files after the operation is done."

---

## Global Constraints

- **Zero Functional Regression**: All existing form states, real-time sync listeners, Supabase DB mutations, download exports (PDF/PNG/CSV), and navigation pathways must behave identically.
- **Brand Standards**: Maintain official SVI corporate branding (`/logo.png`), clean Lucide vector icons, and corporate color palette (Gold `#d98b40` / `#D4AF37`, Navy `#003366`, Slate).
- **TypeScript Strictness**: `npx tsc --noEmit` must pass with 0 errors after every single task.
- **Test Integrity**: Vitest suite must remain 100% green at all verification checkpoints.
- **Dead Code Cleanup**: Delete unreferenced files, remove orphaned imports, and prune unused local variables/functions immediately after refactoring each page.
- **Impact Analysis**: Run GitNexus impact analysis before modifying any shared symbol.

---

## Task Breakdown

### Task 1: Refactor `app/admin/notifications/page.tsx` (389 lines → ~75 lines)

**Target:** Extract the notifications query, debounced search, filters, pagination, bulk selection, bulk mutations, and real-time Supabase listener into `useAdminNotifications.ts`.

**Files:**

- Create: `src/components/admin/notifications/useAdminNotifications.ts`
- Create: `__tests__/admin/notifications/useAdminNotifications.test.ts`
- Modify: `app/admin/notifications/page.tsx`

**Interfaces:**

- Consumes: `@tanstack/react-query`, `supabase`, `FilterType`, `ReadFilter`, `SortOption`, `Notification`
- Produces: `useAdminNotifications()`:

  ```ts
  export interface UseAdminNotificationsReturn {
    notifications: Notification[];
    totalCount: number;
    loading: boolean;
    queryError: unknown;
    refetch: () => void;
    typeFilter: FilterType;
    setTypeFilter: (filter: FilterType) => void;
    readFilter: ReadFilter;
    setReadFilter: (filter: ReadFilter) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    selectedIds: Set<string>;
    bulkActionLoading: boolean;
    handleSelectAll: () => void;
    handleSelectOne: (id: string) => void;
    handleMarkSelectedRead: () => Promise<void>;
    handleMarkSelectedUnread: () => Promise<void>;
    handleDeleteSelected: () => Promise<void>;
    handleMarkAllRead: () => Promise<void>;
    handleToggleRead: (id: string, currentRead: boolean) => Promise<void>;
    handleDeleteOne: (id: string) => Promise<void>;
  }
  ```

- [ ] **Step 1: Write the unit test for `useAdminNotifications`**
      Create `__tests__/admin/notifications/useAdminNotifications.test.ts` testing state initializations, filter setters, and selection toggles.

  ```ts
  import { describe, it, expect, vi } from 'vitest';
  import { renderHook, act } from '@testing-library/react';
  import { useAdminNotifications } from '@/src/components/admin/notifications/useAdminNotifications';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import React from 'react';

  vi.mock('@/src/lib/supabase/client', () => ({
    supabase: {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      }),
      removeChannel: vi.fn(),
    },
  }));

  describe('useAdminNotifications', () => {
    it('initializes default filter and pagination values', () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => useAdminNotifications(), { wrapper });
      expect(result.current.typeFilter).toBe('all');
      expect(result.current.readFilter).toBe('all');
      expect(result.current.currentPage).toBe(1);
      expect(result.current.selectedIds.size).toBe(0);
    });

    it('toggles selection of notification IDs', () => {
      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => useAdminNotifications(), { wrapper });
      act(() => {
        result.current.handleSelectOne('notif-1');
      });
      expect(result.current.selectedIds.has('notif-1')).toBe(true);
      act(() => {
        result.current.handleSelectOne('notif-1');
      });
      expect(result.current.selectedIds.has('notif-1')).toBe(false);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run __tests__/admin/notifications/useAdminNotifications.test.ts`
      Expected: FAIL (`useAdminNotifications` not found).

- [ ] **Step 3: Implement `src/components/admin/notifications/useAdminNotifications.ts`**
      Extract the TanStack Query hook, realtime subscription, debounced search, bulk action mutations, and selection handlers into this clean hook.

- [ ] **Step 4: Refactor `app/admin/notifications/page.tsx`**
      Replace all inline state and effect hooks with `useAdminNotifications()`. Render `NotificationHeader`, `NotificationFilters`, `NotificationBulkActions`, `NotificationList`, and `NotificationPagination`. Delete all unneeded imports (`useQuery`, `useQueryClient`, `supabase`, `useMemo`, `useCallback`, etc.).

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/admin/notifications/useAdminNotifications.test.ts`
      Expected: PASS with 0 errors.

---

### Task 2: Refactor `app/admin/payment-receipts/page.tsx` (381 lines → ~70 lines)

**Target:** Modularize the Payment Receipt Records console into a custom records hook and a dedicated modal container.

**Files:**

- Create: `src/components/admin/payment-receipts/usePaymentReceiptsRecords.ts`
- Create: `src/components/admin/payment-receipts/ReceiptModalsContainer.tsx`
- Create: `__tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`
- Modify: `app/admin/payment-receipts/page.tsx`

**Interfaces:**

- Produces: `usePaymentReceiptsRecords()`:

  ```ts
  export interface UsePaymentReceiptsRecordsReturn {
    receipts: SavedReceipt[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    methodFilter: string;
    setMethodFilter: (m: string) => void;
    sortConfig: { key: string; direction: 'asc' | 'desc' };
    handleSort: (key: string) => void;
    dateRange: { start: string; end: string };
    setDateRange: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
    filteredReceipts: SavedReceipt[];
    totalAmount: number;
    stats: { total: number; cash: number; cheque: number; online: number };
    fetchReceipts: () => void;
    selectedReceipt: SavedReceipt | null;
    setSelectedReceipt: (r: SavedReceipt | null) => void;
    deleteTarget: SavedReceipt | null;
    setDeleteTarget: (r: SavedReceipt | null) => void;
    deleteLoading: boolean;
    handleDeleteConfirm: () => Promise<void>;
    whatsAppReceipt: SavedReceipt | null;
    setWhatsAppReceipt: (r: SavedReceipt | null) => void;
    ledgerRefId: string | null;
    setLedgerRefId: (ref: string | null) => void;
    isLedgersModalOpen: boolean;
    setIsLedgersModalOpen: (open: boolean) => void;
    dealValuesMap: Record<string, number>;
    pdfLoading: boolean;
    imageLoading: boolean;
    handleDownloadPDF: (receipt: SavedReceipt) => Promise<void>;
    handleDownloadImage: (receipt: SavedReceipt) => Promise<void>;
    handleExportCSV: () => void;
  }
  ```

- [ ] **Step 1: Write the unit test for `usePaymentReceiptsRecords`**
      Create `__tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts` verifying filtering, sorting, and stats calculation.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run __tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`
      Expected: FAIL.

- [ ] **Step 3: Implement `usePaymentReceiptsRecords.ts` and `ReceiptModalsContainer.tsx`**
  - `usePaymentReceiptsRecords.ts`: Houses receipt fetching, deal values sync, sort/filter logic, stats reduction, export actions, and delete mutations.
  - `ReceiptModalsContainer.tsx`: Houses `ReceiptViewModal`, `ReceiptDeleteModal`, `ReceiptWhatsAppModal`, `ReceiptLedgerDrawer`, and `ReceiptLedgersModal`.

- [ ] **Step 4: Refactor `app/admin/payment-receipts/page.tsx`**
      Compose page using `usePaymentReceiptsRecords()`, `ReceiptStatsCards`, `ReceiptToolbar`, `ReceiptsTable`, and `ReceiptModalsContainer`. Prune all unused imports and dead states.

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`
      Expected: PASS.

---

### Task 3: Refactor `app/admin/lottery/page.tsx` (373 lines → ~75 lines)

**Target:** Decompose the lottery management page into `useLotteryWizard.ts` and `LotteryViewsContainer.tsx`.

**Files:**

- Create: `src/components/admin/lottery/hooks/useLotteryWizard.ts`
- Create: `src/components/admin/lottery/LotteryViewsContainer.tsx`
- Create: `__tests__/admin/lottery/useLotteryWizard.test.ts`
- Modify: `app/admin/lottery/page.tsx`

**Interfaces:**

- Produces: `useLotteryWizard()`:

  ```ts
  export interface UseLotteryWizardReturn {
    wizardStep: number;
    setWizardStep: (step: number) => void;
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    drawMethod: 'random' | 'manual';
    setDrawMethod: (method: 'random' | 'manual') => void;
    selectedPredeterminedWinners: DbParticipant[];
    setSelectedPredeterminedWinners: React.Dispatch<React.SetStateAction<DbParticipant[]>>;
    dbParticipants: DbParticipant[];
    dbParticipantsSearch: string;
    setDbParticipantsSearch: (q: string) => void;
    dbParticipantsLoading: boolean;
    saveLotteryToDB: () => Promise<void>;
  }
  ```

- [ ] **Step 1: Write the unit test for `useLotteryWizard`**
      Create `__tests__/admin/lottery/useLotteryWizard.test.ts` to test participant batching, wizard step transitions, and validation errors.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run __tests__/admin/lottery/useLotteryWizard.test.ts`
      Expected: FAIL.

- [ ] **Step 3: Implement `useLotteryWizard.ts` and `LotteryViewsContainer.tsx`**
  - `useLotteryWizard.ts`: Extracts wizard step state, winner picker search query, chunked batch database insertion, and active lottery deactivation.
  - `LotteryViewsContainer.tsx`: Renders the active tab view (`DashboardPanel`, `HistoryTable`, `PublicBroadcastCard` vs `CreateLotteryWizard`).

- [ ] **Step 4: Refactor `app/admin/lottery/page.tsx`**
      Compose page using `useLotteryData()`, `useParticipantManagement()`, `useScheduleDraw()`, `useLotteryWizard()`, `LotteryHeader`, `LotteryStatusBanners`, `LotteryViewsContainer`, and `LotteryModalsContainer`. Prune all dead code and unused imports.

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/admin/lottery/`
      Expected: PASS.

---

### Task 4: Refactor `app/admin/allotment-letter/page.tsx` (354 lines → ~75 lines)

**Target:** Extract allotment letter financial calculations, document persistence (draft/patch/force-insert), and duplicate conflict resolution into `useAllotmentLetterPage.ts`. Extract `AllotmentLetterPreviewContainer.tsx`.

**Files:**

- Create: `src/hooks/admin/useAllotmentLetterPage.ts`
- Create: `src/components/admin/allotment-letter/AllotmentLetterPreviewContainer.tsx`
- Create: `__tests__/admin/allotment-letter/useAllotmentLetterPage.test.ts`
- Modify: `app/admin/allotment-letter/page.tsx`

**Interfaces:**

- Produces: `useAllotmentLetterPage()`:

  ```ts
  export interface UseAllotmentLetterPageReturn {
    allotmentData: ReturnType<typeof useAllotmentLetterData>;
    totalCost: number;
    initialPayment: number;
    handleSaveDocument: (e: React.FormEvent) => Promise<void>;
    handleDownloadPDF: () => Promise<void>;
    handleDownloadImage: () => Promise<void>;
    executeSave: (targetId: string | null, forceInsert?: boolean) => Promise<void>;
  }
  ```

- [ ] **Step 1: Write the unit test for `useAllotmentLetterPage`**
      Create `__tests__/admin/allotment-letter/useAllotmentLetterPage.test.ts` validating cost calculation formulas (base, PLC %, EDC, booking % deposit) and save handlers.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run __tests__/admin/allotment-letter/useAllotmentLetterPage.test.ts`
      Expected: FAIL.

- [ ] **Step 3: Implement `useAllotmentLetterPage.ts` and `AllotmentLetterPreviewContainer.tsx`**
  - `useAllotmentLetterPage.ts`: Houses math calculations, duplicate detection logic, draft persistence (`/api/admin/documents`), and export triggers.
  - `AllotmentLetterPreviewContainer.tsx`: Houses `PreviewContainer`, `AllotmentLetterPreview`, and `DownloadOptions`.

- [ ] **Step 4: Refactor `app/admin/allotment-letter/page.tsx`**
      Compose page cleanly with `AllotmentSavedSelector`, `AllotmentLetterForm`, `AllotmentLetterPreviewContainer`, and duplicate overwrite dialog. Prune dead imports.

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/admin/allotment-letter/`
      Expected: PASS.

---

### Task 5: Refactor `app/admin/bba/page.tsx` (358 lines → ~75 lines)

**Target:** Modularize the Builder Buyer Agreement (BBA) document generator by extracting save/patch logic, calculations, and language switcher into `useBbaPage.ts` and `BbaPreviewContainer.tsx`.

**Files:**

- Create: `src/hooks/admin/useBbaPage.ts`
- Create: `src/components/admin/bba/BbaPreviewContainer.tsx`
- Create: `__tests__/admin/bba/useBbaPage.test.ts`
- Modify: `app/admin/bba/page.tsx`

**Interfaces:**

- Produces: `useBbaPage()`:

  ```ts
  export interface UseBbaPageReturn {
    bbaData: ReturnType<typeof useBBAData>;
    totalCost: number;
    initialPayment: number;
    activeLanguage: 'en' | 'hi';
    setActiveLanguage: (lang: 'en' | 'hi') => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDownloadPDF: () => Promise<void>;
    handleDownloadImage: () => Promise<void>;
  }
  ```

- [ ] **Step 1: Write the unit test for `useBbaPage`**
      Create `__tests__/admin/bba/useBbaPage.test.ts` testing BBA financial formulas and document submit states.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npx vitest run __tests__/admin/bba/useBbaPage.test.ts`
      Expected: FAIL.

- [ ] **Step 3: Implement `useBbaPage.ts` and `BbaPreviewContainer.tsx`**
  - `useBbaPage.ts`: Extracts total calculation, POST/PATCH document API endpoints, English/Hindi language state, and PDF/image export handlers.
  - `BbaPreviewContainer.tsx`: Houses `PreviewContainer`, language switcher tabs, `BbaPreviewContent`, `BbaPreviewContentHindi`, and `DownloadOptions`.

- [ ] **Step 4: Refactor `app/admin/bba/page.tsx`**
      Compose page using `useBbaPage()`, `BBAForm`, and `BbaPreviewContainer`. Prune unused imports.

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/admin/bba/`
      Expected: PASS.

---

### Task 6: Refactor Employee Work Tracker & Payroll (`app/employee/work/page.tsx` & `app/employee/payroll/page.tsx`)

**Target:** Decompose the Employee Work Tracker (322 lines) and Employee Payroll (330 lines) into dedicated hooks and presentation containers.

**Files:**

- Create: `src/components/employee/work/useEmployeeWorkTracker.ts`
- Create: `src/components/employee/work/WorkModalsContainer.tsx`
- Create: `src/components/employee/payroll/useEmployeePayroll.ts`
- Create: `src/components/employee/payroll/PayslipViewModal.tsx`
- Create: `__tests__/employee/work/useEmployeeWorkTracker.test.ts`
- Create: `__tests__/employee/payroll/useEmployeePayroll.test.ts`
- Modify: `app/employee/work/page.tsx`
- Modify: `app/employee/payroll/page.tsx`

**Interfaces:**

- Produces: `useEmployeeWorkTracker()` and `useEmployeePayroll()`:

  ```ts
  export interface UseEmployeeWorkTrackerReturn {
    activeTab: WorkTabType;
    setActiveTab: (t: WorkTabType) => void;
    loading: boolean;
    tasks: TaskItem[];
    siteVisits: SiteVisitItem[];
    leads: LeadItem[];
    workLogs: WorkLogItem[];
    showAddTaskModal: boolean;
    setShowAddTaskModal: (open: boolean) => void;
    showAddLogModal: boolean;
    setShowAddLogModal: (open: boolean) => void;
    showAddLeadModal: boolean;
    setShowAddLeadModal: (open: boolean) => void;
    selectedLeadForDrawer: LeadItem | null;
    setSelectedLeadForDrawer: (lead: LeadItem | null) => void;
    fetchData: () => Promise<void>;
    handleStatusChange: (id: string, newStatus: TaskItem['status']) => Promise<void>;
    handleDeleteTask: (id: string) => Promise<void>;
    handleLogSubmitted: () => void;
    handleLeadAdded: () => void;
    handleUpdateLeadStage: (id: string, newStage: LeadItem['stage']) => Promise<void>;
  }
  ```

- [ ] **Step 1: Write unit tests for work tracker and payroll hooks**
      Create `__tests__/employee/work/useEmployeeWorkTracker.test.ts` and `__tests__/employee/payroll/useEmployeePayroll.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**
      Run: `npx vitest run __tests__/employee/`
      Expected: FAIL.

- [ ] **Step 3: Implement hooks and modal containers**
  - Implement `useEmployeeWorkTracker.ts` and `WorkModalsContainer.tsx`.
  - Implement `useEmployeePayroll.ts` and `PayslipViewModal.tsx`.

- [ ] **Step 4: Refactor `app/employee/work/page.tsx` and `app/employee/payroll/page.tsx`**
      Simplify both pages into clean declarative layouts under 80 lines each. Remove all dead states and unused imports.

- [ ] **Step 5: Run tests and typecheck**
      Run: `npx tsc --noEmit && npx vitest run __tests__/employee/`
      Expected: PASS.

---

### Task 7: Dead Code Pruning, Unused Imports Cleanup & Full System Verification

**Target:** Audit all touched files, delete any remaining dead imports or unreferenced utilities, and verify end-to-end type safety and unit test health.

**Files:**

- Scan: `app/admin/notifications/page.tsx`, `app/admin/payment-receipts/page.tsx`, `app/admin/lottery/page.tsx`, `app/admin/allotment-letter/page.tsx`, `app/admin/bba/page.tsx`, `app/employee/work/page.tsx`, `app/employee/payroll/page.tsx`
- Delete: Any orphaned subcomponent files identified during decomposition.

- [ ] **Step 1: Audit imports across all refactored pages**
      Check and remove:
  - Unused icons (`LucideReact`)
  - Unused React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
  - Unused types and helpers

- [ ] **Step 2: Run TypeScript compiler across the entire project**
      Run: `npx tsc --noEmit`
      Expected: Clean exit (0 errors).

- [ ] **Step 3: Run full Vitest suite**
      Run: `npx vitest run`
      Expected: All unit tests pass.

- [ ] **Step 4: Run GitNexus change analysis**
      Run: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
      Expected: Clean graph change detection report.

---

## Execution Choice

Two execution options:

1. **Subagent-Driven (recommended)**: Fresh subagent per task, checkpoint reviews between tasks.
2. **Inline Execution**: Execute tasks sequentially in this session with verification checkpoints.
