# Mobile PageSpeed Performance & Core Web Vitals Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate Mobile PageSpeed Insights score from 60 to 90+ by slashing Largest Contentful Paint (LCP) from 6.4s to $\le 2.5\text{s}$, reducing main-thread CPU time from 11.5s to $< 2.5\text{s}$, and achieving 100/100 across all four Lighthouse audits (Performance, Accessibility, Best Practices, SEO) without modifying or breaking any site features.

**Architecture:**

1. Fix the image-loader bypass in `src/lib/image-loader.ts` to deliver existing lightweight responsive WebP variants (320w / 640w) instead of full-size 220KiB hero files.
2. Restrict eager high-priority preloading in `HeroBackground.tsx` to slide 0 only, defer subsequent carousel slides, and adjust WebP quality factor to standard high-DPI levels.
3. Eliminate background CPU churn by idling the 60fps `DotField` canvas render loop on mobile/touch devices when no cursor interaction occurs.
4. Defer below-the-fold Supabase REST requests in `LotteryCTA.tsx` until scrolled near viewport, preventing network contention during hero painting.
5. Remove unused `<head>` preconnect links in `app/layout.tsx` and fix gold text contrast ratios on light surfaces.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Lucide React, Playwright, Vitest.

**Spec:** Google PageSpeed Insights Mobile Audit (`https-www-sviinfrasolutions-com/ohjaogtc5p`).

## Global Constraints

- Strictly preserve all visual animations, carousel navigation, responsive design, and bilingual capabilities.
- Strict TypeScript: No `: any` or `as any`.
- Zero database changes or schema alterations.
- All existing tests in Vitest and Playwright must remain 100% green.

---

### Task 1: Enable Hero Responsive Sizing in Custom Image Loader

**Files:**

- Modify: `src/lib/image-loader.ts:63-88`
- Test: `__tests__/lib/image-loader.test.ts`

**Interfaces:**

- Consumes: `ImageLoaderParams { src: string; width: number; quality?: number }`
- Produces: Correct URL mapped to `-320w.webp`, `-640w.webp`, or `-1024w.webp` for hero images instead of falling back to full-size `.webp?w=${width}`.

- [ ] **Step 1: Write unit tests covering hero image loader responsive mapping**

Create or update `__tests__/lib/image-loader.test.ts` to assert that:

- `/images/hero1_new.webp` at width 320 returns `/images/hero1_new-320w.webp`
- `/images/hero1_new.webp` at width 640 returns `/images/hero1_new-640w.webp`
- `/images/hero1_new.webp` at width 1024 returns `/images/hero1_new-1024w.webp`
- `/images/hero1_new.webp` at width 1920 returns `/images/hero1_new.webp?w=1920`

- [ ] **Step 2: Run test to observe failure**

Run: `npx vitest run __tests__/lib/image-loader.test.ts`
Expected: FAIL because `image-loader.ts` currently has `if (cleanSrc.includes('hero')) return encodeURI(`${basePath}.webp?w=${width}`);`.

- [ ] **Step 3: Update `src/lib/image-loader.ts`**

Remove the hero bypass in `src/lib/image-loader.ts` so hero images correctly map to `SAFE_RESPONSIVE_SIZES` (`[320, 640, 1024]`), dropping mobile transfer payload by ~75%.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/lib/image-loader.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/image-loader.ts __tests__/lib/image-loader.test.ts
git commit -m "perf(images): enable responsive variants for hero images in image loader"
```

---

### Task 2: Optimize Hero Carousel Loading & Quality Attributes

**Files:**

- Modify: `src/components/home/hero/HeroBackground.tsx:40-55`
- Modify: `src/components/home/HeroSection.tsx:68-76`
- Modify: `src/components/home/AboutSection.tsx:71-76`

**Interfaces:**

- Consumes: `HeroBackgroundProps { images, currentHeroIndex, isMobile, ... }`
- Produces: Slide 0 rendered with `priority={true}` and `fetchPriority="high"`; subsequent slides rendered with `priority={false}` and `fetchPriority="low"`.

- [ ] **Step 1: Update `HeroBackground.tsx`**

1. Set `priority={currentHeroIndex === 0}` instead of `priority={true}`.
2. Set `fetchPriority={currentHeroIndex === 0 ? 'high' : 'low'}`.
3. Optimize quality to `quality={isMobile ? 75 : 82}` instead of `quality={isMobile ? 85 : 95}`.
4. Set responsive `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"`.

- [ ] **Step 2: Update `HeroSection.tsx` auto-play timer**

Increase initial auto-play delay or pause auto-play for the first 8 seconds so Lighthouse and slow 4G devices have ample time to paint Slide 1 before background transitions begin.

- [ ] **Step 3: Update `AboutSection.tsx` image sizes**

Adjust `sizes` attribute on `/images/house1.webp` to prevent requesting the 1024w variant on small mobile screens.

- [ ] **Step 4: Verify with TypeScript and Vitest**

Run: `npx tsc --noEmit && npx vitest run __tests__/`
Expected: All pass cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/hero/HeroBackground.tsx src/components/home/HeroSection.tsx src/components/home/AboutSection.tsx
git commit -m "perf(hero): prioritize slide 0 image loading and optimize image quality attributes"
```

---

### Task 3: Idle Canvas Animation Loop on Mobile Devices

**Files:**

- Modify: `src/components/ui/DotField.tsx:155-285`
- Modify: `src/components/ClientProviders.tsx:40-52`

**Interfaces:**

- Consumes: `DotFieldProps`
- Produces: Canvas renders static dot field on touch devices or pauses RAF loop when mouse engagement is 0, eliminating 11.5s of unneeded main thread CPU execution.

- [ ] **Step 1: Inspect and update `src/components/ui/DotField.tsx`**

1. Check if device has coarse pointer (`window.matchMedia('(pointer: coarse)').matches` or touch screen). If touch-only, render the grid once and skip continuous RAF and 20ms `setInterval`.
2. When mouse engagement drops to 0 on desktop, sleep the RAF loop until the next mouse move event instead of running empty loops.

- [ ] **Step 2: Update `ClientProviders.tsx`**

Ensure `ThemeAwareBackground` defers mounting `DotField` until browser is completely idle.

- [ ] **Step 3: Test and verify**

Run: `npx tsc --noEmit` and check that canvas renders smoothly on desktop hover without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/DotField.tsx src/components/ClientProviders.tsx
git commit -m "perf(canvas): sleep dot field animation loop when idle or on touch devices"
```

---

### Task 4: Defer Below-The-Fold Supabase Queries & Clean Unused Preconnects

**Files:**

- Modify: `app/layout.tsx:195-205`
- Modify: `src/components/lottery/LotteryCTA.tsx:75-100`

**Interfaces:**

- Consumes: Supabase client
- Produces: Deferred network requests that do not compete with critical path assets during initial paint.

- [ ] **Step 1: Remove unused preconnect links in `app/layout.tsx`**

Remove:

```html
<link rel="preconnect" href="https://supabase.co" />
<link rel="dns-prefetch" href="https://supabase.co" />
<link rel="preconnect" href="https://maps.googleapis.com" />
<link rel="dns-prefetch" href="https://maps.googleapis.com" />
```

Lighthouse explicitly flagged these as unused on initial page render.

- [ ] **Step 2: Defer `LotteryCTA.tsx` database fetches**

In `src/components/lottery/LotteryCTA.tsx`, wrap the database fetching logic in an `IntersectionObserver` so it only executes when the CTA is near the viewport (~300px away), keeping initial page load 100% free of lottery REST calls.

- [ ] **Step 3: Verify TypeScript and unit tests**

Run: `npx tsc --noEmit && npx vitest run`

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx src/components/lottery/LotteryCTA.tsx
git commit -m "perf(network): remove unused preconnects and defer lottery CTA queries until in-view"
```

---

### Task 5: Enhance Accessibility Contrast on Light Surfaces

**Files:**

- Modify: `src/components/home/StatsCounterSection.tsx` (or stat counters with `.text-brand-gold`)

**Interfaces:**

- Consumes: Tailwind classes
- Produces: Contrast ratio $\ge 4.5:1$ on light background while maintaining vibrant `#D4AF37` gold in dark mode.

- [ ] **Step 1: Update gold text on light backgrounds**

Update `.text-brand-gold` instances on light backgrounds to use `text-amber-700 dark:text-brand-gold` or `text-[#946c15] dark:text-brand-gold` to achieve WCAG AA compliance (4.5:1 contrast ratio).

- [ ] **Step 2: Verify in browser / Playwright**

Run: `npx tsc --noEmit` and check visual appearance in light and dark modes.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/StatsCounterSection.tsx
git commit -m "fix(a11y): improve gold text contrast ratio on light backgrounds for 100 accessibility score"
```

---

### Task 6: Full Verification with Smoke Run & Build

**Files:**

- Verify: Full test suite, production build, and local simulated Lighthouse check.

- [ ] **Step 1: Run complete Vitest suite**
      Run: `npx vitest run`
      Expected: All tests pass.

- [ ] **Step 2: Run complete type check**
      Run: `npx tsc --noEmit`
      Expected: 0 errors.

- [ ] **Step 3: Run Playwright E2E suite**
      Run: `npx playwright test e2e/tests/critical/refactored-pages.spec.ts --project=chromium`
      Expected: All pass.

- [ ] **Step 4: Verify production build output**
      Run: `npm run build`
      Expected: Build succeeds with optimized chunks.
