# Large Pages & Monolith Components Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor large monolithic Next.js pages and massive components (>400 lines) into focused, single-responsibility components and custom hooks, eliminate dead files and unused imports, and guarantee 100% functionality preservation verified by TypeScript typecheck and Vitest test suites.

**Architecture:** Deconstruct fat pages (`app/admin/workforce`, `app/employee/attendance`, `app/admin/offer-letter`, `app/employee/dashboard`, `app/employee/login`) and oversized components (`MasterTimesheet`, `LeaveAndRegularizationCenter`) into domain-driven folders containing dedicated subcomponents, view tabs, modals containers, and headless custom hooks for state management. Eliminate unreferenced legacy components and prune dead imports.

**Tech Stack:** Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer Motion), Vitest.

---

## Global Constraints

- **Preserve All Behavior**: Zero regression in UI layout, data fetching, search, sorting, filtering, modals, toasts, and API requests.
- **Maintain Official Branding**: Crisp vector Lucide icons, SVI Gold (`#d98b40`/`#d4af37`), Navy (`#003366`), Slate, and high-end luxury styling.
- **TypeScript Strictness**: `npm run typecheck` (`tsc --noEmit`) MUST pass with 0 errors after every task.
- **Vitest Integrity**: All 29 test suites (238 tests) MUST pass at every milestone.
- **Clean Imports**: Remove unused imports and orphaned files at completion.

---

## Plan Structure & Task Breakdown

### Task 1: Refactor `app/admin/workforce/page.tsx` (1,256 lines -> < 100 lines)

Deconstruct the massive Workforce Console into modular domain components and hooks.

**Files:**

- Create: `src/components/admin/workforce/useWorkforceData.ts` (data fetching, state, counts, sorting)
- Create: `src/components/admin/workforce/WorkforceHeader.tsx` (branding header & contextual action buttons)
- Create: `src/components/admin/workforce/WorkforceKpiGrid.tsx` (4 KPI metric cards)
- Create: `src/components/admin/workforce/WorkforceTabNav.tsx` (luxury tab bar)
- Create: `src/components/admin/workforce/tabs/WorkforceDirectoryTab.tsx` (search, export, chips, grid/table)
- Create: `src/components/admin/workforce/tabs/WorkforceAttendanceTab.tsx` (radar & master timesheet sub-views)
- Create: `src/components/admin/workforce/tabs/WorkforcePayrollTab.tsx` (monthly & salary setup sub-views)
- Create: `src/components/admin/workforce/tabs/WorkforceSettingsTab.tsx` (teams, attendance, locations)
- Create: `src/components/admin/workforce/WorkforceModalsContainer.tsx` (all 6 directory & attendance modals/drawers)
- Modify: `app/admin/workforce/page.tsx` (clean declarative orchestration)

**Step-by-step:**

1. Extract `useWorkforceData.ts` to manage `employees`, `teams`, `structures`, `metrics`, `statusCounts`, and `filteredEmployees`.
2. Extract `WorkforceHeader.tsx` and `WorkforceKpiGrid.tsx`.
3. Extract `WorkforceDirectoryTab.tsx`, `WorkforceAttendanceTab.tsx`, `WorkforcePayrollTab.tsx`, and `WorkforceSettingsTab.tsx`.
4. Extract `WorkforceModalsContainer.tsx` to encapsulate add, edit, import, reset password, performance modal, and mark attendance modal.
5. Replace `app/admin/workforce/page.tsx` with clean layout composition.
6. Verify with `npm run typecheck` and `npx vitest run __tests__/admin/workforce-page.test.ts`.

---

### Task 2: Refactor `app/employee/attendance/page.tsx` (645 lines -> < 90 lines)

Deconstruct the Employee GPS Attendance Terminal into a custom hook and focused subcomponents.

**Files:**

- Create: `src/components/employee/attendance/useEmployeeAttendanceTerminal.ts` (geolocation, offline queue, shift elapsed timer, executePunch)
- Create: `src/components/employee/attendance/AttendanceHeader.tsx` (live IST status, profile chip, refresh button)
- Create: `src/components/employee/attendance/AttendanceOfflineBanner.tsx` (offline queue sync notice)
- Create: `src/components/employee/attendance/CompletedShiftSummaryCard.tsx` (today's hours, client calls, site visits summary)
- Modify: `app/employee/attendance/page.tsx`

**Step-by-step:**

1. Extract `useEmployeeAttendanceTerminal.ts` to handle geolocation watching, offline queue, timer, and punch actions.
2. Extract `AttendanceHeader.tsx`, `AttendanceOfflineBanner.tsx`, and `CompletedShiftSummaryCard.tsx`.
3. Simplify `app/employee/attendance/page.tsx` to compose `PunchTerminalWidget`, `GeofenceStatusCard`, and `ShiftGuidelinesCard`.
4. Verify with `npm run typecheck` and `npx vitest run __tests__/attendance/offline-punch-queue.test.ts`.

---

### Task 3: Refactor `src/components/admin/attendance/MasterTimesheet.tsx` (1,062 lines -> < 150 lines)

Decompose the Master Timesheet into structured subcomponents.

**Files:**

- Create: `src/components/admin/attendance/timesheet/TimesheetKpiGrid.tsx` (6 metric cards)
- Create: `src/components/admin/attendance/timesheet/TimesheetFilterBar.tsx` (date navigation, status chips, team selector, search)
- Create: `src/components/admin/attendance/timesheet/TimesheetTable.tsx` (table, responsive columns, badge status)
- Create: `src/components/admin/attendance/timesheet/TimesheetEditModal.tsx` (status adjustment & notes modal)
- Create: `src/components/admin/attendance/timesheet/TimesheetWorkLogModal.tsx` (daily shift log inspection modal)
- Create: `src/components/admin/attendance/timesheet/exportTimesheetCSV.ts` (CSV formatting & download utility)
- Modify: `src/components/admin/attendance/MasterTimesheet.tsx`

**Step-by-step:**

1. Extract `exportTimesheetCSV.ts` utility.
2. Extract `TimesheetKpiGrid.tsx` and `TimesheetFilterBar.tsx`.
3. Extract `TimesheetTable.tsx`, `TimesheetEditModal.tsx`, and `TimesheetWorkLogModal.tsx`.
4. Rebuild `MasterTimesheet.tsx` as an orchestrator.
5. Verify with `npm run typecheck` and `npx vitest run __tests__/api/admin/attendance.test.ts`.

---

### Task 4: Refactor `src/components/admin/attendance/LeaveAndRegularizationCenter.tsx` (815 lines -> < 120 lines)

Modularize the Approvals Center.

**Files:**

- Create: `src/components/admin/attendance/approvals/LeaveApprovalTable.tsx` (leaves listing, badges, actions)
- Create: `src/components/admin/attendance/approvals/RegularizationApprovalTable.tsx` (regularization listing, punch time diffs, actions)
- Create: `src/components/admin/attendance/approvals/ApprovalReviewModal.tsx` (admin review notes & confirm dialog)
- Modify: `src/components/admin/attendance/LeaveAndRegularizationCenter.tsx`

**Step-by-step:**

1. Extract `LeaveApprovalTable.tsx` and `RegularizationApprovalTable.tsx`.
2. Extract `ApprovalReviewModal.tsx`.
3. Simplify `LeaveAndRegularizationCenter.tsx` with unified state management.
4. Verify with `npm run typecheck`.

---

### Task 5: Refactor Document Generators (`app/admin/offer-letter/page.tsx` & helpers)

Decompose `app/admin/offer-letter/page.tsx` (474 lines).

**Files:**

- Create: `src/components/admin/OfferLetter/useOfferLetterForm.ts` (form data state, salary slab sync, document storage)
- Create: `src/components/admin/OfferLetter/OfferLetterSavedSelector.tsx` (saved record dropdown & metadata)
- Modify: `app/admin/offer-letter/page.tsx`

**Step-by-step:**

1. Extract `useOfferLetterForm.ts` and `OfferLetterSavedSelector.tsx`.
2. Clean up `app/admin/offer-letter/page.tsx`.
3. Verify with `npm run typecheck` and `npx vitest run src/components/admin/OfferLetter/__tests__/`.

---

### Task 6: Refactor Login Pages (`app/employee/login/page.tsx` & `app/employee/dashboard/page.tsx`)

Streamline auth and dashboard orchestration.

**Files:**

- Create: `src/components/employee/login/EmployeeLoginHelpModal.tsx` (help & contact support modal)
- Create: `src/components/employee/login/useEmployeeLoginForm.ts` (validation, supabase sign in, role verification)
- Modify: `app/employee/login/page.tsx`
- Create: `src/components/employee/dashboard/EmployeeDashboardHeader.tsx` (greeting, live clock, action buttons)
- Create: `src/components/employee/dashboard/EmployeeDashboardModals.tsx` (AddTask, ApplyLeave, SubmitShiftLog modals)
- Modify: `app/employee/dashboard/page.tsx`

**Step-by-step:**

1. Extract employee login hook and modal.
2. Extract employee dashboard header and modals container.
3. Verify with `npm run typecheck`.

---

### Task 7: Dead File Deletion, Unused Imports Cleanup & Final Verification

Remove orphaned files and clean dead imports.

**Files to Remove:**

- Remove: `src/components/admin/email/compose/ContactGroupsDialog.tsx` (unused)
- Remove: `src/components/admin/email/TabButton.tsx` (unused)
- Remove: `src/components/admin/lottery/ScheduleDrawPanel.tsx` (unused)
- Remove: `src/components/admin/modals/MakeEmployeeConfirm.tsx` (unused)
- Remove: `src/components/home/chat/ChatButton.tsx` (unused)
- Remove: `src/components/motion/text-reveal.tsx` (unused)
- Remove: `src/components/ui/MobileBottomSheet.tsx` (unused)

**Step-by-step:**

1. Remove confirmed dead components.
2. Run project-wide TypeScript typecheck (`npm run typecheck`).
3. Run full Vitest suite (`npx vitest run`).
4. Perform git status check and commit refactored modules.
