# Payment Receipts Hub (/admin/payment-receipts) Ultra-Luxury ERP Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `/admin/payment-receipts` from a noisy, unpaginated data dump into a Linear / Stripe / Mercury-grade Ultra-Luxury Real Estate ERP experience featuring pagination, streamlined row actions (`•••` dropdown), high-density financial typography, and cohesive Obsidian Slate + Warm Gold visual hierarchy.

**Architecture:**

1. Extend `usePaymentReceiptsRecords.ts` with a robust pagination pipeline (`currentPage`, `pageSize`, `totalPages`, `paginatedReceipts`, auto-clamp).
2. Upgrade `ReceiptStatsCards.tsx` into a high-density executive metrics grid matching `PortalAllotmentsStatsGrid.tsx` with tabular figures and collection share breakdown.
3. Streamline `ReceiptToolbar.tsx` with refined search, date range, method filtering, and right-aligned export actions.
4. Refactor `ReceiptsTable.tsx` with strict 52px row rhythm, subtle glass badges, streamlined 2 quick actions + a sleek `ReceiptRowActionMenu.tsx` (`•••`), and an enterprise bottom pagination bar.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons, TypeScript, Vitest, `@testing-library/react`.

**Spec Reference:** Inspired by Stripe Dashboard / Linear Data Tables / SVI Portal Allotments Luxury ERP design standard.

## Global Constraints

- **Strict TypeScript**: No `: any` or `as any`. Use concrete types and `import type`.
- **No Low-Quality/Cartoon Icons**: Use official Lucide React vector icons exclusively.
- **Brand System**: Deep Obsidian Slate (`#080b11`, `#111622`, `#161D2C`) + Luxury Warm Gold (`#d4af37`, `#e5c358`).
- **Performance**: Zero DOM bloat; render 25 rows per page by default instead of 100+ unpaginated rows.
- **Zero Regressions**: All existing 154 test files (991+ tests) and receipt export/ledger/delete flows must remain green.
- **No Unauthorized Git Push**: Push to GitHub only upon explicit user confirmation.

---

### Task 1: Pagination Pipeline & Page Controls in `usePaymentReceiptsRecords.ts`

**Files:**

- Modify: `src/components/admin/payment-receipts/usePaymentReceiptsRecords.ts`
- Modify: `src/components/admin/payment-receipts/ReceiptTypes.ts`
- Test: `__tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`

**Interfaces:**

- Produces:
  - `currentPage: number`
  - `setCurrentPage: (page: number) => void`
  - `pageSize: number` (defaults to `25`)
  - `setPageSize: (size: number) => void`
  - `totalPages: number`
  - `paginatedReceipts: SavedReceipt[]`
  - Hook auto-clamps `currentPage` to `1` when filters (`searchQuery`, `methodFilter`, `dateRange`) change or when `totalPages` shrinks.

- [ ] **Step 1: Write failing tests for pagination in `usePaymentReceiptsRecords.test.ts`**

Add tests to verify:

- Initial `currentPage` is `1` and `pageSize` is `25`.
- `paginatedReceipts` correctly slices `filteredReceipts` according to `currentPage` and `pageSize`.
- Switching `currentPage` returns the correct slice.
- Changing `searchQuery` or `methodFilter` resets `currentPage` back to `1`.
- Changing `pageSize` recalculates `totalPages` and updates the slice.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`
Expected: FAIL due to missing pagination fields in hook return.

- [ ] **Step 3: Implement pagination state and calculation in `usePaymentReceiptsRecords.ts`**

Add `currentPage` (state, default 1) and `pageSize` (state, default 25).
Compute:

```ts
const totalPages = Math.max(
  1,
  Math.ceil(filteredReceipts.length / (pageSize === 0 ? filteredReceipts.length || 1 : pageSize))
);
const paginatedReceipts = useMemo(() => {
  if (pageSize === 0) return filteredReceipts; // 0 represents "All"
  const start = (currentPage - 1) * pageSize;
  return filteredReceipts.slice(start, start + pageSize);
}, [filteredReceipts, currentPage, pageSize]);
```

Add reset effect:

```ts
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, methodFilter, dateRange, activeTab]);
```

Clamp effect:

```ts
useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/admin/payment-receipts/usePaymentReceiptsRecords.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 2: Executive Luxury KPI Metric Cards (`ReceiptStatsCards.tsx`)

**Files:**

- Modify: `src/components/admin/payment-receipts/ReceiptStatsCards.tsx`

**Interfaces:**

- Consumes:
  - `loading: boolean`
  - `totalCount: number`
  - `totalAmount: number`
  - `upiCount: number`
  - `cashCount: number`
  - `bankCount?: number`
- Produces:
  - High-density 4-card metric grid:
    1. **Total Receipts**: Count, Active Status Pill, Subtle receipt velocity indicator.
    2. **Total Collected**: Amount in INR format (`₹XX,XX,XXX`), bold `font-mono tracking-tight`, luxury gold card accent.
    3. **Digital Realization**: UPI count & share % (`X / Total Receipts (XX%)`), purple/sky digital badge.
    4. **Offline Collections**: Cash & Cheque count with green/amber indicator.

- [ ] **Step 1: Inspect and update `ReceiptStatsCards.tsx`**

Upgrade the markup and styling to match the Obsidian luxury standard:

- Card surface: `rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-[#111622]`.
- Numeric values: `font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white`.
- Total collected card: Luxury Warm Gold gradient border (`border-brand-gold/30 bg-gradient-to-br via-[#161D2C] to-[#111622]`).
- Subtitle: Add percentage share labels (e.g. `(35% of total volume)` for UPI).

- [ ] **Step 2: Verify component rendering and responsive grid**

Ensure 1-col on mobile, 2-col on tablet (`sm:grid-cols-2`), 4-col on desktop (`lg:grid-cols-4`).

- [ ] **Step 3: Run Vitest tests to ensure no regressions**

Run: `npx vitest run __tests__/admin/payment-receipts/`
Expected: PASS.

---

### Task 3: Streamlined ERP Toolbar (`ReceiptToolbar.tsx`)

**Files:**

- Modify: `src/components/admin/payment-receipts/ReceiptToolbar.tsx`

**Interfaces:**

- Consumes:
  - `searchQuery`, `setSearchQuery`
  - `methodFilter`, `setMethodFilter`
  - `sortConfig`, `setSortConfig`
  - `dateRange`, `setDateRange`
  - `handleClearFilters`
  - `pageSize?: number`, `setPageSize?: (size: number) => void`
  - `totalFiltered?: number`
  - `onExportCsv`, `onExportExcel`, `onOpenLedgers`
  - `activeTab`, `setActiveTab`, `trashedCount`

- [ ] **Step 1: Redesign Toolbar Layout**

Split into two balanced zones:

- **Left Filter Zone**:
  - Search input with Obsidian background, gold search icon, clear `✕` button.
  - Compact Date Range selector with visual calendar divider.
  - Payment Method dropdown with clean badge colors.
  - Reset filters button (only visible when filters are active).
- **Right Action Zone**:
  - Page size selector (`25 / 50 / 100 / All`).
  - Customer Ledgers button with `BookOpen` icon.
  - Unified `Export` dropdown (`CSV`, `Excel`).

- [ ] **Step 2: Add keyboard accessibility and responsive overflow handling**

Ensure horizontal scroll or clean flex wrapping on mobile (`flex-wrap`) without clipping.

- [ ] **Step 3: Verify TypeScript and Vitest**

Run: `npx tsc --noEmit && npx vitest run __tests__/admin/payment-receipts/`
Expected: PASS.

---

### Task 4: Streamlined Luxury Table with `•••` Dropdown & Enterprise Pagination (`ReceiptsTable.tsx`)

**Files:**

- Create: `src/components/admin/payment-receipts/ReceiptRowActionMenu.tsx`
- Modify: `src/components/admin/payment-receipts/ReceiptsTable.tsx`
- Modify: `app/admin/payment-receipts/page.tsx`

**Interfaces:**

- `ReceiptRowActionMenu.tsx`:
  - Props: `receipt: SavedReceipt`, `activeTab: 'active' | 'trash'`, `onView: () => void`, `onEmail: () => void`, `onWhatsApp: () => void`, `onOpenLedger: () => void`, `onDelete: () => void`, `onRestore?: () => void`
  - Dropdown popover with click-outside listener, animated via Framer Motion, clean high-contrast icons.
- `ReceiptsTable.tsx`:
  - Renders `paginatedReceipts` instead of full list.
  - Strict 52px row height with `h-[52px]` and `align-middle`.
  - Column 1: `RECEIPT NO` - Obsidian Monospace Tag with click-to-copy.
  - Column 2: `REF ID` - Micro badge with click-to-copy.
  - Column 3: `CLIENT NAME` - Name + Phone number in subtle gray caption.
  - Column 4: `DATE` - Tabular formatted date (`DD MMM YYYY`).
  - Column 5: `AMOUNT` - Tabular bold font (`font-mono font-bold`) + Micro method badge.
  - Column 6: `PLOT INFO` - Plot number with square yard badge or clean muted dash.
  - Column 7: `ACTIONS` - Streamlined:
    - Primary: `Eye` (View & Print) button.
    - Secondary: `MessageSquare` (WhatsApp) button.
    - More: `•••` (`ReceiptRowActionMenu`) containing Template, Email, Ledger, Delete.
  - **Bottom Pagination Bar**:
    - Item Range: "Showing **1** to **25** of **100** receipts"
    - Page Jumper: `Previous`, page numbers with active gold pill, `Next`.

- [ ] **Step 1: Create `ReceiptRowActionMenu.tsx`**

Implement accessible popover with click-outside detection and clean actions.

- [ ] **Step 2: Update `ReceiptsTable.tsx` to receive pagination props and use `ReceiptRowActionMenu`**

Add pagination controls to bottom of `ReceiptsTable.tsx`:

- Previous / Next buttons.
- Dynamic page buttons (1, 2, ... totalPages).
- Integrate `ReceiptRowActionMenu` in the action column.

- [ ] **Step 3: Update `app/admin/payment-receipts/page.tsx`**

Pass `paginatedReceipts`, `currentPage`, `setCurrentPage`, `pageSize`, `setPageSize`, `totalPages` from `records` to `ReceiptsTable` and `ReceiptToolbar`.

- [ ] **Step 4: Test table rendering, pagination navigation, and actions**

Run: `npx vitest run __tests__/admin/payment-receipts/`
Expected: PASS.

---

### Task 5: End-to-End Verification & Design Quality Audit

**Files:**

- Audit: All modified files in `src/components/admin/payment-receipts/` and `app/admin/payment-receipts/`

- [ ] **Step 1: Run complete test suite**

Run: `npx vitest run`
Expected: 154/154 files pass, 991+ tests pass.

- [ ] **Step 2: Run TypeScript typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run Git pre-commit verification**

Run: `npm run lint` or `npx eslint` checks.

- [ ] **Step 4: Smoke test UI state**

Verify:

- 25 rows render cleanly on page 1.
- Page navigation (Page 2, 3, etc.) works without page reload.
- Action dropdown (`•••`) opens and triggers modal / email / template navigation.
- No horizontal scroll breakage on standard 1280px / 1440px / 1920px viewports.
