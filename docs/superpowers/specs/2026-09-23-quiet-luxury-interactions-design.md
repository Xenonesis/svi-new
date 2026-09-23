# Design Specification: Quiet Luxury Responsive Interaction & Touch Feedback System

- **Date**: 2026-09-23
- **Author**: SVI Infra Solutions Architecture Team
- **Status**: Approved (Pending Implementation Plan)
- **Scope**: Public Marketing Experience (Home, Projects, Header/Nav, CTAs, Mobile Dock)

---

## 1. Executive Summary & Vision

The objective of this specification is to elevate the responsiveness, tactile touch feedback, and hover micro-interactions across SVI Infra's public marketing experience. Guided by a **"Quiet Luxury & Elegance"** design philosophy, all interactive elements will deliver weighted, bespoke, and responsive visual/tactile feedback without feeling gimmicky, bouncy, or overly energetic.

### Core Goals

1. **Instant Mobile Tactile Feedback**: Mobile touches produce immediate, smooth compression (`scale-[0.98]`) with subtle ambient gold illumination, preventing sticky-hover artifacts.
2. **Weighted Desktop Hover Elevation**: Desktop pointers experience silky cubic-bezier lifts (`-3px`), warm gold perimeter luminescence, and gentle ambient shadows.
3. **Compositor-Only Performance**: Zero layout thrashing; transitions animate exclusively on `transform`, `opacity`, `border-color`, and `box-shadow` for rock-solid 60/120fps performance.
4. **Universal Accessibility**: Strict adherence to $\ge 44\text{px}$ touch targets, WCAG 2.2 focus-visible outlines, and automatic reduction for `prefers-reduced-motion`.

---

## 2. Interaction Design Tokens & CSS Architecture

All tokens will be defined in `app/globals.css` within the `@layer utilities` block, ensuring seamless reuse via Tailwind CSS utility classes.

### 2.1 Easing & Timing Matrix

- **Luxury Smooth Curve**: `cubic-bezier(0.22, 1, 0.36, 1)`
- **Duration**:
  - Touch compression/release: `150ms–200ms`
  - Hover elevation/glow: `300ms–350ms`
  - Image scale reveal: `600ms–800ms`

### 2.2 Utility Classes Specification

```css
@layer utilities {
  /* 1. Mobile Tactile Touch Feedback */
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

  /* 2. Quiet Luxury Card Hover */
  .card-lux-hover {
    transition:
      transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 350ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 300ms ease;
    will-change: transform;
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

  /* 3. Primary CTA Luxury Styling */
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

  /* 4. Secondary CTA Outline Luxury Styling */
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

  /* 5. Mobile Dock Interactive Items */
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
}
```

---

## 3. Component Target Touchpoints

| Component                     | File Path                                                          | Interaction Upgrades                                                                                |
| :---------------------------- | :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Header & Nav Links**        | `src/components/layout/Header.tsx`                                 | Smooth text color cross-fades, `.hover-underline-gold` micro-animations, `.touch-lux` on CTA        |
| **Header Toggles**            | `ThemeToggle.tsx`, `LanguageToggle.tsx`, `HamburgerButton.tsx`     | `.touch-lux` integration with clean active tap damping                                              |
| **Mobile Drawer Nav Items**   | `src/components/layout/MobileDrawer.tsx`                           | Tactile tap highlights (`active:bg-brand-gold/10 active:scale-[0.985]`)                             |
| **Hero CTAs & Badges**        | `src/components/home/Hero.tsx`                                     | Primary action `.btn-lux-primary`, secondary `.btn-lux-outline`, trust badges subtle floating depth |
| **Project Showcase Cards**    | `src/components/projects/ProjectCard.tsx` / `FeaturedProjects.tsx` | Card `.card-lux-hover`, image luxury zoom over 700ms, detail action button tap responsiveness       |
| **Bento Grid Features**       | `src/components/home/BentoGrid.tsx` / `WhyChooseUs.tsx`            | Feature tiles receive quiet hover elevation and radial warm gold perimeter glow                     |
| **Mobile Sticky Action Dock** | `src/components/layout/FloatingContact.tsx`                        | Dock buttons adopt `.dock-lux-item` with instant tactile feedback on touch                          |

---

## 4. Technical Guardrails & Performance Invariants

1. **Strict Media Query Scoping**:
   - Hover effects (`:hover`, `translateY`, shadow blooms) MUST be scoped under `@media (hover: hover) and (pointer: fine)`. Touch devices will NEVER trigger sticky hover states.
2. **Disabled/Loading State Invariant**:
   - Selectors enforce `:not(:disabled)` and `:not([aria-busy="true"])` to prevent tap bounce during asynchronous operations.
3. **No Layout Thrashing**:
   - Properties affecting geometry (`width`, `height`, `padding`, `margin`, `top`, `bottom`) MUST NEVER be animated.
4. **Motion Preference Exemption**:
   - Existing `@media (prefers-reduced-motion: reduce)` block handles zeroing out animation durations and transforms.

---

## 5. Verification & Testing Matrix

- [ ] **Mobile Viewport Test (375px x 812px)**: Verify touch feedback on bottom dock items, mobile drawer items, and hero CTA with no stickiness.
- [ ] **Desktop Pointer Test (1440px)**: Verify card lift, gold glow shadows, and shimmer transitions.
- [ ] **Accessibility Audit**: Validate that focus outlines (`focus-visible`) remain high contrast and distinct from hover states.
- [ ] **Type & Suite Integrity**: Confirm `npx tsc --noEmit` and `npx vitest run tests/` pass cleanly with zero regressions.
