# Quiet Luxury Responsive Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a quiet luxury responsive interaction layer with tactile mobile touch feedback, weighted desktop hover elevation, and GPU-accelerated styling across public marketing components.

**Architecture:** Define standardized design tokens and responsive utilities in `app/globals.css` (`.touch-lux`, `.card-lux-hover`, `.btn-lux-primary`, `.btn-lux-outline`, `.dock-lux-item`), strictly scoped with `@media (hover: hover) and (pointer: fine)` to eliminate mobile sticky-hover bugs. Adopt these utilities across `Header`, `FloatingContact`, `HeroContent`, `ProjectCard`, and `MobileDrawer`.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Motion (`motion/react`).

**Spec:** `docs/superpowers/specs/2026-09-23-quiet-luxury-interactions-design.md`

## Global Constraints

- Strict TypeScript: No `: any` or `as any`.
- Interaction easing curve: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Minimum touch target: $\ge 44\text{px} \times 44\text{px}$ on all interactive controls.
- Compositor-only animations: only `transform`, `opacity`, `border-color`, and `box-shadow`.
- Hover elevation must be scoped inside `@media (hover: hover) and (pointer: fine)`.
- Honor `@media (prefers-reduced-motion: reduce)`.

---

### Task 1: Quiet Luxury Interaction Design Tokens in `app/globals.css`

**Files:**

- Modify: `app/globals.css:117-210`
- Test: `tests/styles/interactions.test.ts`

**Interfaces:**

- Produces: CSS utility classes `.touch-lux`, `.card-lux-hover`, `.btn-lux-primary`, `.btn-lux-outline`, `.dock-lux-item`.

- [ ] **Step 1: Write verification test for interaction utility classes**

Create `tests/styles/interactions.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Quiet Luxury CSS Tokens', () => {
  it('defines required luxury interaction classes in globals.css', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');

    expect(cssContent).toContain('.touch-lux');
    expect(cssContent).toContain('.card-lux-hover');
    expect(cssContent).toContain('.btn-lux-primary');
    expect(cssContent).toContain('.btn-lux-outline');
    expect(cssContent).toContain('.dock-lux-item');
    expect(cssContent).toContain('(hover: hover) and (pointer: fine)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/styles/interactions.test.ts`
Expected: FAIL with missing tokens.

- [ ] **Step 3: Add luxury interaction utility tokens to `app/globals.css`**

Add the quiet luxury utilities under `@layer utilities` in `app/globals.css`:

```css
/* Quiet Luxury Interaction Tokens */
.touch-lux {
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 200ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 200ms ease;
}
.touch-lux:active:not(:disabled) {
  transform: scale(0.978);
  filter: brightness(0.96);
}
.dark .touch-lux:active:not(:disabled) {
  filter: brightness(1.08);
}

.card-lux-hover {
  transition:
    transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 350ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 300ms ease;
}
@media (hover: hover) and (pointer: fine) {
  .card-lux-hover:hover {
    transform: translateY(-3px);
    border-color: rgba(212, 175, 55, 0.38);
    box-shadow:
      0 16px 36px -12px rgba(0, 0, 0, 0.12),
      0 0 20px -2px rgba(212, 175, 55, 0.08);
  }
  .dark .card-lux-hover:hover {
    border-color: rgba(212, 175, 55, 0.45);
    box-shadow:
      0 18px 40px -12px rgba(0, 0, 0, 0.45),
      0 0 24px -2px rgba(212, 175, 55, 0.12);
  }
}

.btn-lux-primary {
  position: relative;
  overflow: hidden;
  transition:
    transform 250ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 250ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 200ms ease;
}
.btn-lux-primary:active:not(:disabled) {
  transform: scale(0.975);
}
@media (hover: hover) and (pointer: fine) {
  .btn-lux-primary:hover {
    box-shadow: 0 8px 24px -4px rgba(212, 175, 55, 0.35);
    transform: translateY(-1px);
  }
}

.btn-lux-outline {
  transition:
    transform 250ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 250ms ease,
    background-color 250ms ease,
    box-shadow 250ms ease;
}
.btn-lux-outline:active:not(:disabled) {
  transform: scale(0.975);
}
@media (hover: hover) and (pointer: fine) {
  .btn-lux-outline:hover {
    border-color: var(--color-brand-gold);
    box-shadow: 0 0 16px -2px rgba(212, 175, 55, 0.18);
    transform: translateY(-1px);
  }
}

.dock-lux-item {
  transition:
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 180ms ease,
    color 180ms ease;
}
.dock-lux-item:active {
  transform: scale(0.94);
  background-color: rgba(212, 175, 55, 0.12);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/styles/interactions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/styles/interactions.test.ts
git commit -m "feat(styles): add quiet luxury interaction and touch feedback tokens"
```

---

### Task 2: Mobile Sticky Dock & Header Interactive Upgrades

**Files:**

- Modify: `src/components/layout/FloatingContact.tsx:200-240`
- Modify: `src/components/layout/MobileDrawerHeader.tsx:40-60`
- Modify: `src/components/layout/DesktopNavActions.tsx` (or Header CTAs)

**Interfaces:**

- Consumes: `.dock-lux-item`, `.touch-lux` from `app/globals.css`.

- [ ] **Step 1: Apply `.dock-lux-item` to mobile bottom bar buttons**

In `src/components/layout/FloatingContact.tsx`, update the 4 dock action items (`Call`, `WhatsApp`, `AI Help`, `Site Visit`) to include `.dock-lux-item` along with `min-h-[44px]` for immediate tactile response on mobile taps.

- [ ] **Step 2: Apply `.touch-lux` to header toggles & mobile close button**

In `src/components/layout/MobileDrawerHeader.tsx` and header toggle buttons, apply `.touch-lux` to ensure smooth scale damping on tap.

- [ ] **Step 3: Verify TypeScript & run tests**

Run: `npx tsc --noEmit && npx vitest run tests/`
Expected: 0 errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/FloatingContact.tsx src/components/layout/MobileDrawerHeader.tsx
git commit -m "feat(layout): apply luxury touch feedback to mobile dock and header controls"
```

---

### Task 3: Hero Section & Project Showcase Interactive Upgrades

**Files:**

- Modify: `src/components/home/hero/HeroContent.tsx:48-73`
- Modify: `src/components/home/ProjectCard.tsx:28-66`

**Interfaces:**

- Consumes: `.btn-lux-primary`, `.btn-lux-outline`, `.card-lux-hover`, `.touch-lux`.

- [ ] **Step 1: Enhance Hero CTA buttons in `HeroContent.tsx`**

Update the primary CTA ("Explore Projects") with `.btn-lux-primary` and the secondary action ("Invest With Us") with `.btn-lux-outline` and `.touch-lux`.

- [ ] **Step 2: Upgrade Project Card in `ProjectCard.tsx`**

Replace generic `hover-lift` with `.card-lux-hover` on the outer card wrapper. Refine image transition timing to a calm 700ms cubic bezier reveal on hover, and add `.touch-lux` on the card details link.

- [ ] **Step 3: Verify TypeScript & run tests**

Run: `npx tsc --noEmit && npx vitest run tests/`
Expected: 0 errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/hero/HeroContent.tsx src/components/home/ProjectCard.tsx
git commit -m "feat(home): upgrade hero CTAs and project cards with quiet luxury feedback"
```

---

### Task 4: Responsive Verification & Visual Audit

**Files:**

- Test via Headless Browser Eval

- [ ] **Step 1: Mobile Viewport Touch & Dock Verification (375px x 812px)**

Run browser emulation test checking:

- Dock button active state response.
- Hero CTA tap responsiveness.
- Absence of horizontal scroll or layout shift.

- [ ] **Step 2: Desktop Viewport Hover Verification (1440px x 900px)**

Run browser verification checking:

- ProjectCard hover elevation (`-3px`) and gold shadow bloom.
- Button hover shimmer and focus outline contrast.

- [ ] **Step 3: Run full suite & commit final verification**

Run: `npx tsc --noEmit && npx vitest run tests/`
Expected: All tests pass.
