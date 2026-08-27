# Unified Workforce & HR Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the three separate admin sidebar pages — Employees (`/admin/employees`), Attendance (`/admin/attendance`), and Payroll & Salary (`/admin/payroll`) — into a single high-performance, unified **Workforce & HR Hub** (`/admin/workforce`) with zero loss of functionality and full backward-compatible redirects for legacy URLs.

**Architecture:** Create a unified dashboard page (`/admin/workforce`) that hosts five specialized tabs: Directory (Profiles, CRUD & Performance), Live Attendance & Timesheet, Approvals (Leaves & Regularizations with live badge counter), Payroll & Salary (Attendance-linked runs, CTC structures, and payslips), and Reports/Configuration. Legacy routes `/admin/employees`, `/admin/attendance`, and `/admin/payroll` will be converted to lightweight instant client redirects that preserve query parameters. The admin sidebar will collapse the three cluttered menu items into a single high-visibility entry: **Workforce & HR**.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion, Lucide React, Supabase Auth & PostgreSQL, Sonner toasts.

**Spec:** Image #1 shows the three adjacent sidebar items (`Employees`, `Attendance`, `Payroll & Salary`). The requirement is to merge all three into a single cohesive, unified page while preserving 100% of capabilities.

## Global Constraints

- **Zero Data Loss:** All features (employee directory CRUD, performance modal, live attendance radar, master timesheet, leave/regularization approvals, monthly payroll generation, salary structure setups, payslip PDF rendering, teams, geofences) must remain fully functional.
- **Strict Brand & Visual Standards:** Official `/logo.png`, brand navy (`#111827`), deep dark theme (`#0a0a0a`/`#111118`), official gold accents (`#d4af37`), and smooth luxury tab transitions.
- **URL Backward Compatibility:** Any external links, bookmarks, or tests pointing to `/admin/employees`, `/admin/attendance`, or `/admin/payroll` must seamlessly forward to `/admin/workforce` with the appropriate tab pre-selected.
- **Code Quality:** Zero TypeScript compilation errors (`npm run typecheck`), 100% clean test suite run (`npm test`).

---

### Task 1: Create Unified Workforce Shell & Tab Navigation

**Files:**

- Create: `app/admin/workforce/page.tsx`
- Test: `__tests__/admin/workforce-page.test.ts`

**Interfaces:**

- Consumes: Existing components from `@/src/components/admin/employees/*`, `@/src/components/admin/attendance/*`, and `@/src/components/admin/payroll/*`.
- Produces: Primary route `/admin/workforce` supporting URL query tab state `?tab=directory|attendance|approvals|payroll|reports|settings`.

- [ ] **Step 1: Write the unit test for Workforce page tabs and redirect state**

```typescript
// __tests__/admin/workforce-page.test.ts
import { describe, it, expect } from 'vitest';

describe('Workforce Tab Definitions', () => {
  it('should support all required workforce tabs with valid keys', () => {
    const validTabs = ['directory', 'attendance', 'approvals', 'payroll', 'reports', 'settings'];
    expect(validTabs).toContain('directory');
    expect(validTabs).toContain('attendance');
    expect(validTabs).toContain('approvals');
    expect(validTabs).toContain('payroll');
    expect(validTabs).toContain('reports');
    expect(validTabs).toContain('settings');
  });

  it('should map legacy routes to respective workforce tabs', () => {
    const routeTabMap: Record<string, string> = {
      '/admin/employees': 'directory',
      '/admin/attendance': 'attendance',
      '/admin/payroll': 'payroll',
    };
    expect(routeTabMap['/admin/employees']).toBe('directory');
    expect(routeTabMap['/admin/attendance']).toBe('attendance');
    expect(routeTabMap['/admin/payroll']).toBe('payroll');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run __tests__/admin/workforce-page.test.ts`
Expected: PASS

- [ ] **Step 3: Implement `app/admin/workforce/page.tsx`**

Build the comprehensive unified workforce hub page that:

1. Validates admin authentication via Supabase session.
2. Reads `tab` from `useSearchParams()`, defaulting to `'directory'`.
3. Displays the top luxury header with real-time stats (Total Employees, Punched Today, Pending Approvals, Monthly Payroll Status).
4. Renders interactive luxury tab buttons with Lucide icons (`Users`, `Clock`, `CheckCircle2`, `Banknote`, `BarChart3`, `Sliders`) and a badge on "Approvals" if there are pending leave/regularization requests.
5. In Tab 1 (`directory`): Renders employee directory list, search, Add Employee modal, Reset Password modal, and Employee Performance & Leads tracking modal.
6. In Tab 2 (`attendance`): Renders Attendance live radar, today's metrics, Mark Attendance modal, and Master Timesheet.
7. In Tab 3 (`approvals`): Renders `LeaveAndRegularizationCenter` with one-tap approve/reject workflow.
8. In Tab 4 (`payroll`): Renders `MonthlyPayrollRunView`, `SalaryStructuresTable`, `EmployeeSalarySetupDrawer`, and `PayslipDocument` preview.
9. In Tab 5 (`reports`): Renders `AttendanceReport` and export utilities.
10. In Tab 6 (`settings`): Renders `TeamsManager`, `LocationManager`, and `AttendanceSettings`.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add app/admin/workforce/page.tsx __tests__/admin/workforce-page.test.ts
git commit -m "feat(admin): add unified workforce and hr hub page"
```

---

### Task 2: Create Seamless Backward-Compatible Redirects

**Files:**

- Modify: `app/admin/employees/page.tsx`
- Modify: `app/admin/attendance/page.tsx`
- Modify: `app/admin/payroll/page.tsx`

**Interfaces:**

- Consumes: Next.js router (`useRouter`, `useSearchParams`, `replace`).
- Produces: Instant, seamless client-side redirection to `/admin/workforce?tab=...` so no bookmarks or existing links break.

- [ ] **Step 1: Update `app/admin/employees/page.tsx` to redirect**

Replace the standalone page body with an instant client-side forward:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EmployeesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/workforce?tab=directory');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      <p className="text-xs text-slate-400">Redirecting to Workforce Directory...</p>
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/attendance/page.tsx` to redirect with tab preservation**

Forward existing attendance tabs (`report` -> `reports`, `approvals` -> `approvals`, `settings` -> `settings`, otherwise `attendance`):

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AttendanceRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawTab = searchParams.get('tab');
    let targetTab = 'attendance';
    if (rawTab === 'report') targetTab = 'reports';
    else if (rawTab === 'approvals') targetTab = 'approvals';
    else if (rawTab === 'settings') targetTab = 'settings';

    router.replace(`/admin/workforce?tab=${targetTab}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      <p className="text-xs text-slate-400">Redirecting to Workforce Attendance...</p>
    </div>
  );
}
```

- [ ] **Step 3: Update `app/admin/payroll/page.tsx` to redirect**

Forward to `/admin/workforce?tab=payroll`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PayrollRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/workforce?tab=payroll');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      <p className="text-xs text-slate-400">Redirecting to Workforce Payroll...</p>
    </div>
  );
}
```

- [ ] **Step 4: Run typecheck and test**

Run: `npm run typecheck && npm test`
Expected: Zero errors, all tests pass

- [ ] **Step 5: Commit**

```bash
git add app/admin/employees/page.tsx app/admin/attendance/page.tsx app/admin/payroll/page.tsx
git commit -m "feat(admin): redirect legacy employee, attendance, and payroll routes to workforce hub"
```

---

### Task 3: Update Admin Sidebar & Navigation

**Files:**

- Modify: `src/components/admin/AdminSidebar.tsx:55-75`
- Modify: `src/components/admin/QuickActions.tsx:60-75`

**Interfaces:**

- Consumes: Unified path `/admin/workforce`.
- Produces: Clean, uncluttered admin sidebar with a single `Workforce & HR` entry that stays active when visiting `/admin/workforce` or any legacy path.

- [ ] **Step 1: Update `managementItems` in `AdminSidebar.tsx`**

In `src/components/admin/AdminSidebar.tsx`, replace the 3 consecutive items:

```tsx
// Before:
  { name: 'Employees', path: '/admin/employees', icon: Users },
  { name: 'Attendance', path: '/admin/attendance', icon: CheckSquare },
  { name: 'Payroll & Salary', path: '/admin/payroll', icon: Banknote },

// After:
  { name: 'Workforce & HR', path: '/admin/workforce', icon: Users },
```

Also update the `getLinkClass` or active check in `SidebarContent` so that `/admin/workforce` is active when `pathname` starts with `/admin/workforce`, `/admin/employees`, `/admin/attendance`, or `/admin/payroll`.

- [ ] **Step 2: Update `QuickActions.tsx` shortcuts**

In `src/components/admin/QuickActions.tsx`, update quick action links:

- `href: '/admin/attendance?tab=mark'` -> `href: '/admin/workforce?tab=attendance&action=mark'`
- `href: '/admin/attendance?tab=report'` -> `href: '/admin/workforce?tab=reports'`

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/components/admin/QuickActions.tsx
git commit -m "refactor(admin): consolidate employee, attendance, and payroll sidebar items into workforce"
```

---

### Task 4: Documentation, Context Files & Pre-Push Verification

**Files:**

- Modify: `context/architecture.md`
- Modify: `context/overview.md`

**Interfaces:**

- Consumes: Updated route structure.
- Produces: Synchronized context documentation reflecting the unified Workforce & HR management architecture.

- [ ] **Step 1: Update `context/architecture.md`**

Document `/admin/workforce` as the unified HR, attendance, employee directory, and payroll management hub.

- [ ] **Step 2: Update `context/overview.md`**

Update page route counts and feature description to reflect the unified workforce console.

- [ ] **Step 3: Full Project Verification**

Run:

```bash
npm run typecheck
npm test
```

Confirm:

- TypeScript compilation: 0 errors.
- Vitest: All 22+ test files pass.

- [ ] **Step 4: Commit and Push**

```bash
git add context/architecture.md context/overview.md
git commit -m "docs: sync architecture and overview with unified workforce hub"
git push origin main
```
