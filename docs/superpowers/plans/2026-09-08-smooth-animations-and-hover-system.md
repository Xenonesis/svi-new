# Smooth Animations & Unified Hover System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified, surface-differentiated animation and hover system across the SVI Infra Solutions public marketing website, admin console, employee workspace, and Capacitor mobile apps with zero layout shifts, touch-adaptive haptics, and WCAG-compliant reduced-motion support.

**Architecture:**

1. **Foundation & Global Tokens:** Standardize cubic-bezier easing tokens, duration tiers, universal tactile button active states (`.btn-tactile`), and desktop-only hover classes (`.hover-lift`, `.hover-lift-sm`, `.hover-gold-glow`, `.table-row-hover`, `.group-hover-nudge-x`) in `app/globals.css` wrapped under `@media (hover: hover) and (pointer: fine)`.
2. **Centralized Touch & Haptic Bridge:** Build a safe `triggerHaptic` utility (`src/lib/haptics.ts`) for mobile browsers and Capacitor native apps.
3. **Surface-Specific Integration:** Wire hover and micro-interactions across marketing cards (`ProjectCard`, `BlogCard`), Admin tables/KPIs (`TimesheetTable`, `WorkforceHeader`, `WorkforceKpiGrid`), and Employee navigation & punch terminal (`EmployeeBottomNav`, `PunchTerminalWidget`, `DashboardQuickShortcuts`).
4. **Verification & Guardrails:** Validate with unit tests, `pnpm typecheck`, full `vitest` runs, and Capacitor Android sync.

**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Motion (motion/react v13), Lucide React, Capacitor v8, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-08-smooth-animations-and-hover-system-design.md`

---

## Global Constraints

- **Zero Layout Shift / Zero Reflow:** Animate GPU-composited properties (`transform`, `opacity`, `filter`, and hardware-accelerated `box-shadow`) only. Never animate `width`, `height`, `margin`, `padding`, `top`, or `left`.
- **Touch-Adaptive Hover Protection:** All CSS `:hover` elevations and border highlights must be strictly guarded behind `@media (hover: hover) and (pointer: fine)` to prevent sticky hover states on mobile screens and Capacitor WebViews.
- **Accessibility (A11y):** Full `prefers-reduced-motion: reduce` compliance (transitions and transforms zeroed out). High-contrast `focus-visible` rings on all interactive elements.
- **Strict TypeScript Quality:** `pnpm typecheck` (`tsc --noEmit`) must pass with 0 errors after every task.
- **Test Integrity:** All newly created and existing Vitest unit tests must pass cleanly.
- **Brand Standards:** Use official SVI corporate branding (Gold `#d4af37`, Navy `#111827`, Slate `#0f172a`).

---

## Task Breakdown

### Task 1: Global Motion Tokens & CSS Utility Foundation

**Target:** Define core physics easing curves, duration tokens, universal `.btn-tactile`, and desktop-only hover utilities in `app/globals.css`.

**Files:**

- Modify: `app/globals.css`
- Test: `__tests__/styles/motion-tokens.test.ts`

**Interfaces:**

- Produces CSS classes:
  - `.btn-tactile`: Active press compression (`scale(0.975)`), touch manipulation.
  - `.hover-lift`: 3px lift (`translateY(-3px)`) with luxury easing and shadow bloom on desktop.
  - `.hover-lift-sm`: 1.5px micro-lift (`translateY(-1.5px)`) for dense cards.
  - `.hover-gold-glow`: Gold border illumination (`border-brand-gold/45`) and soft sheen.
  - `.table-row-hover`: Fast 120ms background tint for data tables without layout shifts.
  - `.group-hover-nudge-x`: 3px horizontal translation on parent hover.

- [ ] **Step 1: Write the failing test**

Create `__tests__/styles/motion-tokens.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Global Motion Tokens & CSS Utilities', () => {
  const cssPath = path.resolve(process.cwd(), 'app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('defines the core luxury and tactile cubic-bezier easing curves', () => {
    expect(cssContent).toContain('0.22, 1, 0.36, 1'); // ease-luxury
    expect(cssContent).toContain('0.16, 1, 0.3, 1'); // ease-tactile
  });

  it('defines the universal .btn-tactile class with active scale', () => {
    expect(cssContent).toContain('.btn-tactile');
    expect(cssContent).toContain('transform: scale(0.975)');
    expect(cssContent).toContain('touch-action: manipulation');
  });

  it('guards desktop hover effects under (hover: hover) and (pointer: fine)', () => {
    expect(cssContent).toMatch(
      /@media\s*\(\s*hover:\s*hover\s*\)\s*and\s*\(\s*pointer:\s*fine\s*\)/
    );
    expect(cssContent).toContain('.hover-lift');
    expect(cssContent).toContain('.hover-lift-sm');
    expect(cssContent).toContain('.hover-gold-glow');
    expect(cssContent).toContain('.table-row-hover');
    expect(cssContent).toContain('.group-hover-nudge-x');
  });

  it('maintains prefers-reduced-motion overrides', () => {
    expect(cssContent).toContain('prefers-reduced-motion: reduce');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/styles/motion-tokens.test.ts`  
Expected: FAIL with missing classes or media queries in `app/globals.css`.

- [ ] **Step 3: Write minimal implementation in `app/globals.css`**

Add the standardized motion tokens and utilities to `app/globals.css`:

```css
/* ─────────────────────────────────────────────────────────────
   GLOBAL MOTION & INTERACTION SYSTEM
   ───────────────────────────────────────────────────────────── */

/* Universal tactile button press (Desktop & Mobile) */
.btn-tactile {
  transition:
    transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 120ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
  touch-action: manipulation;
  user-select: none;
}
.btn-tactile:active {
  transform: scale(0.975);
}

/* Desktop-only hover elevation & illumination */
@media (hover: hover) and (pointer: fine) {
  .hover-lift {
    transition:
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 200ms ease;
    will-change: transform;
  }
  .hover-lift:hover {
    transform: translateY(-3px);
    box-shadow:
      0 12px 24px -8px rgba(0, 0, 0, 0.08),
      0 4px 8px -4px rgba(0, 0, 0, 0.04);
  }
  .dark .hover-lift:hover {
    box-shadow:
      0 14px 28px -8px rgba(0, 0, 0, 0.5),
      0 0 1px 1px rgba(255, 255, 255, 0.08);
  }

  .hover-lift-sm {
    transition:
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 180ms ease,
      border-color 150ms ease;
  }
  .hover-lift-sm:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.06);
  }
  .dark .hover-lift-sm:hover {
    box-shadow: 0 8px 18px -4px rgba(0, 0, 0, 0.4);
  }

  .hover-gold-glow:hover {
    border-color: rgba(212, 175, 55, 0.45);
    box-shadow: 0 0 20px -4px rgba(212, 175, 55, 0.2);
  }

  .table-row-hover {
    transition: background-color 120ms ease;
  }
  .table-row-hover:hover {
    background-color: rgba(248, 250, 252, 0.85);
  }
  .dark .table-row-hover:hover {
    background-color: rgba(30, 41, 59, 0.4);
  }

  .group:hover .group-hover-nudge-x {
    transform: translateX(3px);
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .group:hover .group-hover-nudge-y {
    transform: translateY(-2px);
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/styles/motion-tokens.test.ts`  
Expected: PASS (4/4 tests passing).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css __tests__/styles/motion-tokens.test.ts
git commit -m "feat(ui): add global motion tokens and desktop hover utility primitives"
```

---

### Task 2: Centralized Haptics Utility & Unit Tests

**Target:** Create a robust, safe haptic feedback utility in `src/lib/haptics.ts` that gracefully supports browser vibration, Capacitor WebViews, and SSR without throwing errors.

**Files:**

- Create: `src/lib/haptics.ts`
- Create: `__tests__/lib/haptics.test.ts`

**Interfaces:**

- Produces:

  ```typescript
  export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection';
  export function triggerHaptic(type?: HapticFeedbackType): void;
  ```

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/haptics.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '@/src/lib/haptics';

describe('triggerHaptic Utility', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it('safely no-ops when navigator.vibrate is not available', () => {
    Object.defineProperty(global, 'navigator', {
      value: {},
      configurable: true,
      writable: true,
    });

    expect(() => triggerHaptic('light')).not.toThrow();
  });

  it('triggers a 10ms vibration for light and selection feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('light');
    expect(vibrateMock).toHaveBeenCalledWith(10);

    triggerHaptic('selection');
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it('triggers a 20ms vibration for medium feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('medium');
    expect(vibrateMock).toHaveBeenCalledWith(20);
  });

  it('triggers a multi-pulse vibration array for heavy feedback', () => {
    const vibrateMock = vi.fn();
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalledWith([25, 50, 25]);
  });

  it('swallows errors if navigator.vibrate throws', () => {
    const vibrateMock = vi.fn().mockImplementation(() => {
      throw new Error('Vibration permission denied');
    });
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
      writable: true,
    });

    expect(() => triggerHaptic('light')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/lib/haptics.test.ts`  
Expected: FAIL with "Cannot find module '@/src/lib/haptics'".

- [ ] **Step 3: Write minimal implementation in `src/lib/haptics.ts`**

```typescript
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection';

/**
 * Triggers safe haptic feedback on devices supporting the Vibration API / Capacitor bridge.
 * Gracefully no-ops in SSR, non-supporting browsers, or when vibration is blocked.
 */
export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (
    typeof window === 'undefined' ||
    !('navigator' in window) ||
    typeof navigator.vibrate !== 'function'
  ) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate([25, 50, 25]);
        break;
    }
  } catch {
    // Gracefully ignore permission or hardware errors
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/lib/haptics.test.ts`  
Expected: PASS (5/5 tests passing).

- [ ] **Step 5: Commit**

```bash
git add src/lib/haptics.ts __tests__/lib/haptics.test.ts
git commit -m "feat(haptics): add centralized touch-adaptive haptic feedback utility"
```

---

### Task 3: Public Marketing Surface Polish (`ProjectCard` & `BlogCard`)

**Target:** Apply `.hover-lift`, `.hover-gold-glow`, smooth image zoom, and `.group-hover-nudge-x` to marketing showcase cards.

**Files:**

- Modify: `src/components/home/ProjectCard.tsx`
- Modify: `src/components/home/BlogCard.tsx`
- Test: `__tests__/ui/MarketingCardsMotion.test.tsx`

**Interfaces:**

- Consumes: `.hover-lift`, `.hover-gold-glow`, `.group-hover-nudge-x`, `triggerHaptic` from `@/src/lib/haptics`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/ui/MarketingCardsMotion.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProjectCard from '@/src/components/home/ProjectCard';
import BlogCard from '@/src/components/home/BlogCard';

describe('Marketing Cards Motion & Hover Styling', () => {
  it('renders ProjectCard with hover-lift and group classes', () => {
    const { container } = render(
      <ProjectCard
        title="Royal Heritage Estate"
        location="Lucknow"
        type="Villas"
        img="/images/projects/project1.jpg"
        completedLabel="Ready to Move"
        exploreLabel="Explore Project"
      />
    );

    const card = container.querySelector('.hover-lift');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('hover-gold-glow');
    expect(screen.getByText('Explore Project')).toBeDefined();
  });

  it('renders BlogCard with hover-lift styling', () => {
    const { container } = render(
      <BlogCard
        slug="real-estate-trends-2026"
        title="Top Real Estate Trends in 2026"
        excerpt="An in-depth analysis of emerging luxury infra corridors."
        category="Market Insights"
        date="08 Sep 2026"
        readTime="4 min read"
        coverImage="/images/blog/trend.jpg"
      />
    );

    const card = container.querySelector('.hover-lift');
    expect(card).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/ui/MarketingCardsMotion.test.tsx`  
Expected: FAIL because `hover-lift` and `hover-gold-glow` are not yet on `ProjectCard` or `BlogCard`.

- [ ] **Step 3: Update `ProjectCard.tsx` and `BlogCard.tsx`**

In `src/components/home/ProjectCard.tsx`:

1. Add `.hover-lift` and `.hover-gold-glow` to the outer card container.
2. Upgrade image transition to `transition-transform duration-500 ease-out group-hover:scale-105`.
3. Add `group-hover-nudge-x` to `ArrowRight`.

In `src/components/home/BlogCard.tsx`:

1. Add `.hover-lift` and `.hover-gold-glow` to the article card.
2. Add smooth image zoom on hover.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/ui/MarketingCardsMotion.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ProjectCard.tsx src/components/home/BlogCard.tsx __tests__/ui/MarketingCardsMotion.test.tsx
git commit -m "feat(marketing): enhance project and blog cards with hover-lift and smooth zoom"
```

---

### Task 4: Admin Workforce & Timesheet Console Polish

**Target:** Apply `.table-row-hover` to table rows in `TimesheetTable.tsx`, `.btn-tactile` to action buttons in `WorkforceHeader.tsx`, and `.hover-lift-sm` to KPI cards in `WorkforceKpiGrid.tsx`.

**Files:**

- Modify: `src/components/admin/attendance/timesheet/TimesheetTable.tsx`
- Modify: `src/components/admin/workforce/WorkforceHeader.tsx`
- Modify: `src/components/admin/workforce/WorkforceKpiGrid.tsx`
- Test: `__tests__/admin/WorkforceMotion.test.tsx`

**Interfaces:**

- Consumes: `.table-row-hover`, `.btn-tactile`, `.hover-lift-sm`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/admin/WorkforceMotion.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TimesheetTable } from '@/src/components/admin/attendance/timesheet/TimesheetTable';
import { WorkforceHeader } from '@/src/components/admin/workforce/WorkforceHeader';
import { WorkforceKpiGrid } from '@/src/components/admin/workforce/WorkforceKpiGrid';

describe('Admin Workforce Motion & Table Hover Styling', () => {
  it('applies table-row-hover class to TimesheetTable rows', () => {
    const mockRecord = {
      id: 'rec-1',
      user_id: 'user-1',
      date: '2026-09-08',
      status: 'present' as const,
      check_in_time: '2026-09-08T09:00:00Z',
      check_out_time: '2026-09-08T17:00:00Z',
      work_hours: 8,
      punch_in_photo: null,
      punch_out_photo: null,
      notes: null,
      punch_in_address: 'Office',
      punch_out_address: 'Office',
      punch_in_lat: 26.8,
      punch_in_lng: 80.9,
      punch_out_lat: 26.8,
      punch_out_lng: 80.9,
      is_late: false,
      is_geofence_verified: true,
      full_name: 'Rahul Sharma',
      email: 'rahul@sviinfra.com',
      department: 'Civil Engineering',
      role: 'Site Engineer',
      employee_id: 'EMP-001',
      shift_start: '09:00',
      shift_end: '17:00',
    };

    const { container } = render(
      <TimesheetTable
        records={[mockRecord]}
        loading={false}
        dateFilter="2026-09-08"
        todayStr="2026-09-08"
        isCurrentDateToday={true}
        hasActiveFilters={false}
        onToday={vi.fn()}
        onResetFilters={vi.fn()}
        onViewWorkLog={vi.fn()}
        onEditRecord={vi.fn()}
      />
    );

    const row = container.querySelector('tbody tr');
    expect(row?.className).toContain('table-row-hover');
  });

  it('applies btn-tactile to WorkforceHeader action buttons', () => {
    const { container } = render(
      <WorkforceHeader
        activeTab="directory"
        payrollSubTab="monthly"
        onAddEmployee={vi.fn()}
        onLogAttendance={vi.fn()}
        onSetupSalary={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Add Employee/i });
    expect(button.className).toContain('btn-tactile');
  });

  it('applies hover-lift-sm to WorkforceKpiGrid cards', () => {
    const { container } = render(
      <WorkforceKpiGrid
        totalEmployees={42}
        presentToday={38}
        onLeaveToday={4}
        pendingApprovals={2}
        monthlyPayrollTotal={1250000}
        loading={false}
      />
    );

    const cards = container.querySelectorAll('.hover-lift-sm');
    expect(cards.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/admin/WorkforceMotion.test.tsx`  
Expected: FAIL due to missing utility classes.

- [ ] **Step 3: Update `TimesheetTable.tsx`, `WorkforceHeader.tsx`, and `WorkforceKpiGrid.tsx`**

1. In `TimesheetTable.tsx`: Update `<tbody>` `<tr>` to include `table-row-hover`.
2. In `WorkforceHeader.tsx`: Add `btn-tactile` to action buttons (`Add Employee`, `Log Attendance`).
3. In `WorkforceKpiGrid.tsx`: Add `hover-lift-sm` to KPI cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/admin/WorkforceMotion.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/attendance/timesheet/TimesheetTable.tsx src/components/admin/workforce/WorkforceHeader.tsx src/components/admin/workforce/WorkforceKpiGrid.tsx __tests__/admin/WorkforceMotion.test.tsx
git commit -m "feat(admin): apply table-row-hover, btn-tactile, and hover-lift-sm across workforce console"
```

---

### Task 5: Employee Workspace & Mobile App Interaction Polish

**Target:** Connect `triggerHaptic` and `.btn-tactile` into `EmployeeBottomNav.tsx`, `PunchTerminalWidget.tsx`, and `DashboardQuickShortcuts.tsx`.

**Files:**

- Modify: `src/components/employee/EmployeeBottomNav.tsx`
- Modify: `src/components/employee/attendance/PunchTerminalWidget.tsx`
- Modify: `src/components/employee/dashboard/DashboardQuickShortcuts.tsx`
- Test: `__tests__/employee/EmployeeInteractions.test.tsx`

**Interfaces:**

- Consumes: `triggerHaptic` from `@/src/lib/haptics`, `.btn-tactile`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/employee/EmployeeInteractions.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import EmployeeBottomNav from '@/src/components/employee/EmployeeBottomNav';
import { DashboardQuickShortcuts } from '@/src/components/employee/dashboard/DashboardQuickShortcuts';
import * as haptics from '@/src/lib/haptics';

vi.mock('next/navigation', () => ({
  usePathname: () => '/employee/dashboard',
}));

describe('Employee Portal Interactions & Haptics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers haptic on EmployeeBottomNav link click', () => {
    const hapticSpy = vi.spyOn(haptics, 'triggerHaptic');
    render(<EmployeeBottomNav />);

    const punchLink = screen.getByText('Punch').closest('a');
    expect(punchLink).not.toBeNull();
    if (punchLink) {
      fireEvent.click(punchLink);
      expect(hapticSpy).toHaveBeenCalledWith('light');
    }
  });

  it('triggers haptic and applies btn-tactile in DashboardQuickShortcuts', () => {
    const hapticSpy = vi.spyOn(haptics, 'triggerHaptic');
    const onLeaveMock = vi.fn();

    render(<DashboardQuickShortcuts onOpenLeaveModal={onLeaveMock} />);

    const leaveBtn = screen.getByRole('button', { name: /Apply Leave/i });
    expect(leaveBtn.className).toContain('btn-tactile');

    fireEvent.click(leaveBtn);
    expect(hapticSpy).toHaveBeenCalledWith('light');
    expect(onLeaveMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/employee/EmployeeInteractions.test.tsx`  
Expected: FAIL due to missing `btn-tactile` or `triggerHaptic` connection.

- [ ] **Step 3: Update `EmployeeBottomNav.tsx`, `PunchTerminalWidget.tsx`, and `DashboardQuickShortcuts.tsx`**

1. In `EmployeeBottomNav.tsx`:
   - Import `triggerHaptic` from `@/src/lib/haptics`.
   - Call `triggerHaptic('light')` on tab link click.
   - Enhance active indicator pill with smooth transition (`transition-all duration-200`).
2. In `PunchTerminalWidget.tsx`:
   - Replace inline `navigator.vibrate(30)` calls with `triggerHaptic('medium')`.
   - Add `.btn-tactile` to the primary punch button.
3. In `DashboardQuickShortcuts.tsx`:
   - Replace local `triggerHaptic` with centralized `@/src/lib/haptics` utility.
   - Add `.btn-tactile` to shortcut buttons.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test __tests__/employee/EmployeeInteractions.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/employee/EmployeeBottomNav.tsx src/components/employee/attendance/PunchTerminalWidget.tsx src/components/employee/dashboard/DashboardQuickShortcuts.tsx __tests__/employee/EmployeeInteractions.test.tsx
git commit -m "feat(employee): integrate centralized haptics and tactile press feedback across workspace"
```

---

### Task 6: Comprehensive Verification & Capacitor Sync

**Target:** Run full strict TypeScript checks, Vitest suite, and synchronize web assets to the Capacitor Android project.

**Files:**

- Execute: `pnpm typecheck`
- Execute: `pnpm test`
- Execute: `node scripts/sync-capacitor-flavors.mjs && npx cap sync android`

- [ ] **Step 1: Run TypeScript type check**

Run: `pnpm typecheck`  
Expected: 0 errors (`$ tsc --noEmit` exits with 0).

- [ ] **Step 2: Run all Vitest test suites**

Run: `pnpm test`  
Expected: All tests pass.

- [ ] **Step 3: Synchronize Capacitor mobile flavors**

Run: `node scripts/sync-capacitor-flavors.mjs && npx cap sync android`  
Expected: Clean sync without errors for both Admin and Employee flavors.

- [ ] **Step 4: Final verification commit**

```bash
git status
git commit -am "chore(release): complete smooth animations and hover system rollout with verified sync"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-08-smooth-animations-and-hover-system.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks sequentially in this session with verification checkpoints.

Which approach would you like to take?
