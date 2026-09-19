# Plots Allotments (/admin/portal-allotments) UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `/admin/portal-allotments` into an enterprise-grade luxury ERP dashboard with multi-dimension filtering, column sorting, micro-progress bars, multi-select bulk operations, WhatsApp reminder previews, and architectural empty states.

**Architecture:** Extend the orchestrator hook `usePortalAllotmentsAdmin.ts` to manage multi-criteria filters, column sorting, and row selection pipelines. Build modular UI subcomponents (`PortalAllotmentsFilterBar.tsx`, `PortalAllotmentsFloatingDock.tsx`, `BulkWhatsAppReminderModal.tsx`) to keep views clean, responsive, and unit-tested.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons, TypeScript, Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-09-19-portal-allotments-ux-overhaul-design.md`

## Global Constraints

- Strict TypeScript: no `: any`, no `as any`. Use concrete interfaces and `import type`.
- No cartoonish or low-quality raw emojis anywhere; use Lucide React vector icons exclusively.
- Dual View Support: Desktop high-density table view and mobile card view must both support the new features.
- Zero Regressions: All existing test suites (allotments, receipt drawer, exports) must stay 100% passing.
- Pre-commit/Pre-push: `npm run typecheck` (`tsc --noEmit`) must report 0 errors.

---

### Task 1: Type Definitions and Filter/Sort Pipeline in Hook

**Files:**

- Modify: `src/components/admin/portal-allotments/types.ts`
- Modify: `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`
- Test: `__tests__/admin/portal-allotments/usePortalAllotmentsAdmin.test.ts`

**Interfaces:**

- Produces:
  - `PaymentStatusFilter = 'all' | 'fully_paid' | 'partially_paid' | 'overdue' | 'unpaid'`
  - `SaleModeFilter = 'all' | 'Direct Sell' | 'Draw'`
  - `SortField = 'booking_date' | 'deal_value' | 'balance_due' | 'unit_number' | 'collection_pct' | 'ref_id'`
  - `SortDirection = 'asc' | 'desc'`
  - In hook return: `selectedProperty`, `setSelectedProperty`, `selectedPaymentStatus`, `setSelectedPaymentStatus`, `selectedSaleMode`, `setSelectedSaleMode`, `selectedAdvisor`, `setSelectedAdvisor`, `sortField`, `sortDirection`, `handleSort(field)`, `resetFilters()`, `activeFilterCount: number`

- [ ] **Step 1: Write failing tests for hook filter and sort pipeline**

Update `__tests__/admin/portal-allotments/usePortalAllotmentsAdmin.test.ts` to test:

- Filtering by `property_id`
- Filtering by `payment_status` ('fully_paid', 'partially_paid', 'overdue')
- Filtering by `sale_mode`
- Sorting by `deal_value` ascending and descending
- Resetting filters

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test run __tests__/admin/portal-allotments/usePortalAllotmentsAdmin.test.ts`
Expected: FAIL due to missing filter/sort exports.

- [ ] **Step 3: Update `types.ts` and `usePortalAllotmentsAdmin.ts`**

Add filter/sort types to `types.ts`.
In `usePortalAllotmentsAdmin.ts`:

- Add filter states (`selectedProperty`, `selectedPaymentStatus`, `selectedSaleMode`, `selectedAdvisor`).
- Add sort state (`sortField`, `sortDirection`, `handleSort`).
- Chain filtering and sorting in `filteredAllotments` useMemo.
- Calculate `activeFilterCount` and `resetFilters()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test run __tests__/admin/portal-allotments/usePortalAllotmentsAdmin.test.ts`
Expected: PASS.

- [ ] **Step 5: Run typecheck and commit**

Run: `npm run typecheck`

```bash
git add src/components/admin/portal-allotments/types.ts src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts __tests__/admin/portal-allotments/usePortalAllotmentsAdmin.test.ts
git commit -m "feat(allotments): add multi-filter and sorting data pipeline to hook"
```

---

### Task 2: Multi-Dimension Filter Bar Component

**Files:**

- Create: `src/components/admin/portal-allotments/PortalAllotmentsFilterBar.tsx`
- Modify: `src/components/admin/portal-allotments/index.ts`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx`
- Create Test: `__tests__/admin/portal-allotments/PortalAllotmentsFilterBar.test.tsx`

**Interfaces:**

- Consumes: Filter states and properties/advisors list from `usePortalAllotmentsAdmin.ts`.
- Produces: `PortalAllotmentsFilterBar` component rendered at the top of `PortalAllotmentsActiveView.tsx`.

- [ ] **Step 1: Write component tests for `PortalAllotmentsFilterBar`**

Test that:

- Renders search input and all 4 dropdown selectors (Property, Payment Status, Sale Mode, Advisor).
- Shows "Reset Filters" pill when `activeFilterCount > 0`.
- Calls change callbacks on selection.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsFilterBar.test.tsx`
Expected: FAIL (component not found).

- [ ] **Step 3: Implement `PortalAllotmentsFilterBar.tsx`**

Build with clean Tailwind styling, sleek border radius, subtle hover/focus states, and Lucide icons (`Filter`, `Building2`, `CreditCard`, `Users`, `RotateCcw`, `Search`).
Wire into `PortalAllotmentsActiveView.tsx` and export from `index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsFilterBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/portal-allotments/PortalAllotmentsFilterBar.tsx src/components/admin/portal-allotments/index.ts src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx __tests__/admin/portal-allotments/PortalAllotmentsFilterBar.test.tsx
git commit -m "feat(allotments): implement multi-dimension filter bar"
```

---

### Task 3: Interactive Table Header Sorting & Micro-Progress Bars

**Files:**

- Modify: `src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx`
- Test: `__tests__/admin/portal-allotments/PortalAllotmentTableRow.test.tsx`

**Interfaces:**

- Consumes: `sortField`, `sortDirection`, `onSort` in `PortalAllotmentsActiveView.tsx`.
- Produces:
  - Interactive table header buttons with `ArrowUpDown`, `ArrowUp`, `ArrowDown`.
  - 4px color-coded progress bar in `Received / %` cell.
  - Overdue installment alert badge if any milestone has `due_date < today` and status pending.

- [ ] **Step 1: Write tests for micro-progress bar and overdue indicators**

In `__tests__/admin/portal-allotments/PortalAllotmentTableRow.test.tsx`:

- Assert progress bar has width percentage and appropriate color.
- Assert overdue indicator displays when past-due unpaid payment schedule exists.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentTableRow.test.tsx`
Expected: FAIL on missing overdue indicator or progress bar structure.

- [ ] **Step 3: Implement sorting headers & micro-progress bar**

- In `PortalAllotmentsActiveView.tsx`: make headers (`Ref ID`, `Unit & Property`, `Deal Value`, `Received / %`, `Balance Due`) interactive sort buttons.
- In `PortalAllotmentTableRow.tsx`:
  - Calculate `isOverdue` and render `Overdue: DD/MM/YYYY` badge.
  - Render 4px rounded progress bar under Received amount.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentTableRow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx __tests__/admin/portal-allotments/PortalAllotmentTableRow.test.tsx
git commit -m "feat(allotments): add interactive header sorting and micro-progress bars"
```

---

### Task 4: Multi-Select State, Floating Bulk Action Dock & Bulk WhatsApp Modal

**Files:**

- Create: `src/components/admin/portal-allotments/PortalAllotmentsFloatingDock.tsx`
- Create: `src/components/admin/portal-allotments/BulkWhatsAppReminderModal.tsx`
- Modify: `src/components/admin/portal-allotments/usePortalAllotmentsAdmin.ts`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx`
- Modify: `src/components/admin/portal-allotments/index.ts`
- Create Test: `__tests__/admin/portal-allotments/PortalAllotmentsBulkActions.test.tsx`

**Interfaces:**

- Produces:
  - `selectedIds`: `Set<string>`
  - `toggleSelectAll()`, `toggleSelectRow(id)`, `clearSelection()`
  - Bottom-docked `PortalAllotmentsFloatingDock` showing count & actions.
  - `BulkWhatsAppReminderModal` displaying personalized WhatsApp reminders with pending balance.

- [ ] **Step 1: Write test for bulk selection and floating dock**

Test selection toggle, count summary calculation, and modal trigger.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsBulkActions.test.tsx`
Expected: FAIL (components missing).

- [ ] **Step 3: Implement selection and bulk action dock**

- Add checkbox in table header (select all filtered) and each row.
- Create `PortalAllotmentsFloatingDock.tsx` with high-contrast luxury styling (dark slate/gold, blur backdrop, floating at bottom-6).
- Create `BulkWhatsAppReminderModal.tsx` listing selected records with balance, pre-written WhatsApp message, direct send button, and copy shortcut.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsBulkActions.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/portal-allotments/ __tests__/admin/portal-allotments/PortalAllotmentsBulkActions.test.tsx
git commit -m "feat(allotments): implement multi-select bulk dock and bulk WhatsApp reminder modal"
```

---

### Task 5: 9-Column ERP Shimmer Skeletons, Client Luxury Popover & Empty State

**Files:**

- Modify: `src/components/admin/portal-allotments/PortalAllotmentsActiveView.tsx`
- Modify: `src/components/admin/portal-allotments/PortalAllotmentTableRow.tsx`
- Test: `__tests__/admin/portal-allotments/PortalAllotmentsActiveView.test.tsx`

**Interfaces:**

- Produces:
  - 9-column loading skeleton table rows with pulsing animations.
  - Client detail hover/click popover card displaying full address and metadata.
  - Architectural empty state when filters return 0 results with direct "Reset All Filters" CTA.

- [ ] **Step 1: Write test for skeleton loading and architectural empty state**

Test that loading renders 9-column skeletons, and empty filter result renders custom empty state with reset button.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsActiveView.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement skeletons, popover, and empty state**

- Add luxury shimmer skeleton rows when `loading === true`.
- Add client quick-info popover next to client name in `PortalAllotmentTableRow.tsx`.
- Enhance empty state with clean blueprint vector graphic and reset action.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test run __tests__/admin/portal-allotments/PortalAllotmentsActiveView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/portal-allotments/ __tests__/admin/portal-allotments/PortalAllotmentsActiveView.test.tsx
git commit -m "feat(allotments): add shimmer loading skeletons, client popover, and empty state"
```

---

### Task 6: Full Integration, Typecheck, and Regression Verification

**Files:**

- Run full test suite across `__tests__/admin/portal-allotments/` and related modules.

- [ ] **Step 1: Run full test suite**

Run: `pnpm test run __tests__/admin/portal-allotments/`
Expected: ALL PASS.

- [ ] **Step 2: Run full project typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Push changes to remote**

```bash
git push origin main && git push origin main:refactor/modular-big-pages
```
