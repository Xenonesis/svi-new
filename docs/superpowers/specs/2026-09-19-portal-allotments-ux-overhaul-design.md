# Design Specification: Plots Allotments (/admin/portal-allotments) UI/UX Overhaul

## 1. Overview & Objectives

The `/admin/portal-allotments` dashboard serves as the central operational hub for property allotment records, plot inventory allocations, payment tracking, customer ledgers, and advisor performance.

While functional, the current interface lacks high-density ERP controls (filtering, sorting, bulk workflows, glanceable visual statuses) necessary for efficient real-estate portfolio management.

This specification details a complete 3-phase UI/UX transformation into an enterprise-grade luxury ERP dashboard with zero regressions to existing APIs or test suites.

---

## 2. Architecture & Component Decomposition

### 2.1 Component Structure

```
src/components/admin/portal-allotments/
├── index.ts                                # Re-exports
├── types.ts                                # Data models & filter/sort definitions
├── usePortalAllotmentsAdmin.ts             # Orchestrator hook (filters, sorts, selection, stats)
├── PortalAllotmentsHeader.tsx              # Page title, subtitle, and primary CTAs
├── PortalAllotmentsStatsGrid.tsx           # High-level KPIs (Total Value, Balance, Units, Collected)
├── PortalAllotmentsTabsNav.tsx             # Active Allotments vs. Pending Approvals tab switcher
├── PortalAllotmentsFilterBar.tsx           # [NEW] Multi-dimension filter & search bar
├── PortalAllotmentsActiveView.tsx          # Active allotments table/card container & sort headers
├── PortalAllotmentTableRow.tsx             # Individual table row & card view with progress bars
├── PortalAllotmentScheduleDrawer.tsx       # Nested installment payment schedule view
├── PortalAllotmentsFloatingDock.tsx        # [NEW] Floating multi-selection bulk action dock
├── BulkWhatsAppReminderModal.tsx           # [NEW] Selected clients WhatsApp reminder preview modal
├── PortalAllotmentsPendingView.tsx         # Pending candidate approvals list
├── PortalAllotmentPendingCard.tsx          # Single pending candidate card
├── PortalAllotmentsModalsContainer.tsx     # Create/Edit, Ledger, WhatsApp dialogs
└── PortalAllotmentFormModal.tsx            # Allotment create/edit form modal
```

---

## 3. Detailed Specifications by Phase

### Phase 1: High-Impact Data Intelligence & Filtering

1. **Multi-Dimension Filter Bar (`PortalAllotmentsFilterBar.tsx`)**:
   - Integrated alongside the existing text search bar.
   - **Property Filter**: Dropdown dynamically populated from available properties (`all` or specific `property_id`).
   - **Payment Status Filter**:
     - `all`: All allotments
     - `fully_paid`: 100% collected
     - `partially_paid`: > 0% and < 100% collected
     - `overdue`: Has at least 1 milestone with `due_date < today` and status not paid
     - `unpaid`: 0% collected
   - **Sale Mode Filter**: `all`, `Direct Sell`, `Draw`
   - **Advisor Filter**: Dropdown dynamically populated from assigned advisors (`all` or specific `advisor_name`).
   - **Active Filter Counter & Reset**: Displays badge when active filters > 0 with 1-click "Reset All" button.

2. **Column-Level Sorting (`PortalAllotmentsActiveView.tsx`)**:
   - Clickable table headers with ascending/descending visual indicator icons (`ArrowUpDown`, `ArrowUp`, `ArrowDown`):
     - `Ref ID` (Ticket/Booking Reference)
     - `Unit Number` (Natural/numeric plot order)
     - `Deal Value` (Numeric amount descending/ascending)
     - `Received / %` (Collection percentage)
     - `Balance Due` (Pending collection balance)
     - `Booking Date` (Chronological order)

3. **Glanceable Micro-Progress Bars & Overdue Alerts (`PortalAllotmentTableRow.tsx`)**:
   - In `Received / %` cell: A 4px rounded track beneath text:
     - 100% $\rightarrow$ Emerald green (`bg-emerald-500`)
     - 40%–99% $\rightarrow$ Indigo/Gold (`bg-brand-gold` or `bg-indigo-600`)
     - < 40% $\rightarrow$ Amber (`bg-amber-500`)
   - **Overdue Indicator**: If any unpaid installment has `due_date < today`, render a subtle indicator badge:
     `Overdue: DD/MM/YYYY` in table row and card view to highlight recovery priority.

---

### Phase 2: Workflow Automation & Bulk Actions

1. **Multi-Select State & Table Checkboxes**:
   - Master checkbox in table header to toggle selection across all currently filtered allotments.
   - Row-level checkbox in each table row and card view.
   - Selected row highlight (`bg-brand-gold/5` or `bg-slate-100/80 dark:bg-white/[0.04]`).

2. **Floating Bulk Action Dock (`PortalAllotmentsFloatingDock.tsx`)**:
   - An elegant floating bar pinned to the bottom-center of the viewport when `selectedIds.size > 0`:
     - **Selected Counter**: `N Allotments Selected (Total Balance: ₹X,XX,XXX)`
     - **Bulk WhatsApp Action**: Opens `BulkWhatsAppReminderModal.tsx`.
     - **Bulk Export Action**: Exports only selected rows to Excel/CSV or print preview.
     - **Clear Selection**: `Deselect All` button.

3. **Bulk WhatsApp Reminder Modal (`BulkWhatsAppReminderModal.tsx`)**:
   - Lists all selected clients with pending balances.
   - Preview of personalized template message per client with plot details, balance, and ledger link.
   - Per-row "Send WhatsApp" button and "Open in Web WhatsApp" link.
   - "Copy Message" clipboard shortcut.

---

### Phase 3: Luxury UX Polish & Micro-Interactions

1. **Client Quick-Info Luxury Popover (`PortalAllotmentTableRow.tsx`)**:
   - Hovering or clicking a subtle info icon next to client name shows a clean luxury popover with full address, alternate contacts, KYC/Aadhaar/PAN details (if available in profile), and registration source without needing to open the full edit modal.

2. **9-Column Shimmer Skeleton Loaders (`PortalAllotmentsActiveView.tsx`)**:
   - High-fidelity table skeletons matching the exact 9-column layout during initial data fetch and filter changes.

3. **Architectural Empty State**:
   - Clean blueprint/vector illustration when zero matches are found for active filters.
   - Descriptive helper copy with direct "Clear Active Filters" button.

---

## 4. Testing & Verification Strategy

- **Unit & Component Tests (`__tests__/admin/portal-allotments/`)**:
  - Filter logic in `usePortalAllotmentsAdmin.test.ts` (property, payment status, sale mode, advisor).
  - Sorting logic across deal value, balance, unit number, and dates.
  - Selection management (toggle all, toggle single, clear).
  - Table row micro-progress bar rendering and overdue alert indicators.
- **Strict Pre-Commit / Pre-Push Invariants**:
  - `npm run typecheck` (`tsc --noEmit`) passes with 0 errors.
  - Vitest test suite 100% passing.
  - Zero raw emojis; all icons use Lucide React.
