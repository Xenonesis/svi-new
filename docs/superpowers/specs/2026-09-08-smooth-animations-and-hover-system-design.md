# System Design Spec: Smooth Animations & Unified Hover System

**Spec Date:** 2026-09-08  
**Scope:** Public Marketing Website, Admin Workforce Console, Employee Workspace & Capacitor Mobile Apps  
**Status:** Approved by Engineering Lead

---

## 1. Executive Summary & Objectives

This specification defines a comprehensive, cohesive animation and interaction system for SVI Infra Solutions across all client-facing and internal digital surfaces.

### Core Objectives

1. **Elevate Brand Quality:** Provide a luxurious, high-end real estate aesthetic on public pages (smooth card reveals, gentle image scale, gold border illumination, and magnetic feel buttons).
2. **Snappy Portal Utility:** Deliver crisp, immediate micro-interactions across the Admin Console and Employee Workspace (120ms–200ms transitions, table row highlighting without layout shifts, tactile button presses).
3. **Touch-Adaptive & Mobile Optimized:** Eliminate sticky `:hover` states on touch devices and Capacitor mobile apps via `@media (hover: hover) and (pointer: fine)` guards, paired with instant press states (`:active`) and subtle micro-haptics.
4. **Zero-Reflow Performance & WCAG A11y:** Exclusively animate GPU-composited properties (`transform`, `opacity`, `filter`), maintain strict `prefers-reduced-motion` compliance, and ensure 60fps on Android WebViews.

---

## 2. Global Motion Tokens & Architecture

### 2.1 Physics & Easing Curves

Unified easing functions prevent jarring transitions between CSS animations and React Motion components:

- **Luxury Ease (`--ease-luxury`):** `cubic-bezier(0.22, 1, 0.36, 1)`
  - Use: Marketing section reveals, card lifts, modal entries, image zooms.
- **Tactile Ease (`--ease-tactile`):** `cubic-bezier(0.16, 1, 0.3, 1)`
  - Use: Button presses, tab switching, dropdowns, sheet drawers.
- **Smooth Linear:** `linear`
  - Use: Continuous subtle rotations (e.g. loading spinners, ambient rings).

### 2.2 Duration Tiers

- **Instant (`100ms – 150ms`):** Active press states, dropdown toggles, table row hover highlights.
- **Micro (`200ms – 250ms`):** Card elevation, icon translation, border glow transitions.
- **Standard (`300ms – 400ms`):** Modal window scaling, drawer sliding, accordion disclosure.
- **Expressive (`600ms – 800ms`):** Hero typography entrance, staggered section in-view animations.

---

## 3. CSS Utility Primitives (`app/globals.css`)

We define standardized CSS utility classes that can be applied to standard HTML elements without requiring React wrapper components:

```css
/* ─────────────────────────────────────────────────────────────
   TACTILE PRESS PRIMITIVES (Universal: Desktop & Mobile)
   ───────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────
   DESKTOP-ONLY HOVER PRIMITIVES
   Guarded behind (hover: hover) to prevent mobile sticky states
   ───────────────────────────────────────────────────────────── */
@media (hover: hover) and (pointer: fine) {
  /* Subtle 3px lift with soft ambient shadow */
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

  /* Gentle 1.5px micro-lift for dense admin cards and list items */
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

  /* Gold Border Highlight with Soft Radial Sheen */
  .hover-gold-glow:hover {
    border-color: rgba(212, 175, 55, 0.45);
    box-shadow: 0 0 20px -4px rgba(212, 175, 55, 0.2);
  }

  /* Fast Table Row Hover Tint */
  .table-row-hover {
    transition: background-color 120ms ease;
  }
  .table-row-hover:hover {
    background-color: rgba(248, 250, 252, 0.85);
  }
  .dark .table-row-hover:hover {
    background-color: rgba(30, 41, 59, 0.4);
  }

  /* Icon Micro-Translate on Parent Hover */
  .group:hover .group-hover-nudge-x {
    transform: translateX(3px);
  }
  .group:hover .group-hover-nudge-y {
    transform: translateY(-2px);
  }
  .group:hover .group-hover-rotate-12 {
    transform: rotate(12deg);
  }
}
```

---

## 4. Mobile & Touch Haptic Integration (`src/lib/haptics.ts`)

To provide native-quality tactile feedback in mobile browsers and Capacitor apps (`com.svi.infrasolutions` and `com.svi.infrasolutions.employee`), a centralized safe utility handles micro-vibrations:

```typescript
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection';

export function triggerHaptic(type: HapticFeedbackType = 'light'): void {
  if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
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
    // Gracefully ignore devices that restrict vibration permissions
  }
}
```

---

## 5. Surface-Specific Implementation Details

### 5.1 Public Marketing Surfaces

1. **Navigation Header (`Header.tsx`):**
   - Link hovers with smooth underline expansion or gold color transition.
   - "Get in Touch" / CTA button enhanced with `.btn-tactile` and gentle gold sheen.
2. **Project Cards (`ProjectCard.tsx`):**
   - Enhanced with `.hover-lift` and `.hover-gold-glow`.
   - Image zoom: Optical smooth zoom (`scale-105` over `500ms ease-luxury`).
   - "Explore Project" link nudges arrow right by `3px` (`group-hover-nudge-x`).
3. **Blog Cards & Testimonials (`BlogCard.tsx` / `stagger-testimonials.tsx`):**
   - Subtle card elevation and reading badge pulse on hover.
4. **Hero & Interactive Calculator (`HeroSection.tsx` / `InteractiveCalculator.tsx`):**
   - Counter transitions and smooth slider thumb scaling (`active:scale-110`).

### 5.2 Admin Workforce & Timesheet Console

1. **Data Tables (`MasterTimesheet.tsx`, `WorkforceDirectoryTab.tsx`, `ReceiptsTable.tsx`):**
   - Apply `.table-row-hover` across all table rows.
   - Maintain zero layout shifts (strict padding/height stability).
   - Row actions (Edit/Delete/Review) transition colors smoothly on hover.
2. **Metric & KPI Cards (`WorkforceKpiGrid.tsx`, `TimesheetKpiGrid.tsx`):**
   - Apply `.hover-lift-sm` for interactive KPI cards.
3. **Action Buttons (Add Employee, Log Attendance, Export CSV):**
   - Apply `.btn-tactile` for immediate click feedback.

### 5.3 Employee Workspace & Mobile App

1. **Bottom Navigation (`EmployeeBottomNav.tsx`):**
   - Pill indicator transitions smoothly on route change.
   - 10ms micro-haptic on tab touch.
2. **Punch Terminal Widget (`PunchTerminalWidget.tsx`):**
   - Pulsing ambient glow when geofence is valid.
   - Tactile press (`active:scale-[0.96]`) and 20ms haptic confirmation on Punch In/Out.
3. **Quick Action Center (`DashboardQuickShortcuts.tsx`):**
   - Icon bounce (`group-hover:scale-110`) and clean active scale.

---

## 6. Accessibility & Performance Guardrails

1. **`prefers-reduced-motion`:**
   - Handled globally in `globals.css`: When enabled, all durations drop to `0.01ms`, animations halt, and transforms become `none`.
2. **Composited GPU Layers Only:**
   - Only `transform`, `opacity`, and hardware-accelerated `box-shadow` are animated.
   - `will-change` is strictly scoped to active hover states, avoiding GPU memory exhaustion.
3. **High-Contrast Focus Indicators:**
   - Interactive elements maintain `focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:outline-none`.

---

## 7. Verification & Testing Plan

1. **Unit Tests:**
   - Unit test `src/lib/haptics.ts` for safe behavior in non-vibrating, SSR, and vibrating browser environments.
2. **Full Repository Checks:**
   - `pnpm typecheck` (`tsc --noEmit`) passes with 0 errors.
   - `pnpm test` runs cleanly across all test suites.
3. **Cross-Platform Verification:**
   - Desktop browser test for smooth hover lifts, border glows, and row highlights.
   - Mobile touch simulation to confirm zero sticky hover states.
   - Capacitor Android sync verification (`npx cap sync android`).
