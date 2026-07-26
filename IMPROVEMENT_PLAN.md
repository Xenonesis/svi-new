# SVI Infra Solutions - Website Improvement Plan

Based on the newly installed skills and the project's current state, here's a comprehensive improvement plan.

## Project Context

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + @supabase/ssr
- **Testing**: Playwright (87 tests passing)
- **Monitoring**: Sentry + Vercel Analytics/Speed Insights
- **i18n**: next-intl (English + Hindi)

---

## Priority 1: SEO Improvements (High Impact)

### 1.1 Technical SEO - robots.txt & sitemap.xml

- [ ] Verify `robots.txt` exists and is correct
- [ ] Verify `sitemap.xml` is generated and includes all pages
- [ ] Add proper `lastmod` dates to sitemap
- [ ] Ensure canonical URLs on all pages

### 1.2 On-Page SEO

- [ ] Add proper meta titles/descriptions to all pages (using next-intl)
- [ ] Add Open Graph / Twitter Card meta tags
- [ ] Add JSON-LD structured data:
  - Organization schema (already in layout.tsx)
  - LocalBusiness schema (already in contact page)
  - BlogPosting schema for blog posts
  - Product schema for properties
  - FAQPage schema for FAQ sections
- [ ] Add breadcrumb schema (already in BreadcrumbSchema component)

### 1.3 Core Web Vitals (LCP/CLS/INP)

- [ ] Preload critical fonts (Playfair Display, Outfit)
- [ ] Add `fetchpriority="high"` to LCP images
- [ ] Add `loading="lazy"` to below-fold images
- [ ] Implement Speculation Rules API for instant navigation
- [ ] Optimize font loading with `font-display: swap`

---

## Priority 2: Accessibility (WCAG 2.2 AA)

### 2.1 Semantic HTML & ARIA

- [ ] Audit all pages for proper heading hierarchy (h1 → h2 → h3)
- [ ] Ensure all interactive elements have accessible names
- [ ] Add `aria-label` / `aria-labelledby` where needed
- [ ] Fix any missing `alt` attributes on images
- [ ] Ensure form inputs have proper `<label>` associations

### 2.2 Color Contrast

- [ ] Audit all text against WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Fix any low-contrast text (especially gold/yellow on white)
- [ ] Ensure focus indicators meet 3:1 contrast

### 2.3 Keyboard Navigation

- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add visible focus styles for all focusable elements
- [ ] Test tab order on all pages
- [ ] Add skip-to-main-content link

### 2.4 Screen Reader Support

- [ ] Add `aria-live` regions for dynamic content
- [ ] Ensure proper heading structure
- [ ] Add `aria-describedby` for complex form fields
- [ ] Test with NVDA/VoiceOver

---

## Priority 3: Supabase/Database Optimization

### 3.1 Query Optimization

- [ ] Add indexes for frequently queried columns
- [ ] Use `select()` with specific columns instead of `*`
- [ ] Implement pagination with `range()` instead of loading all
- [ ] Use `count: 'exact'` only when needed

### 3.2 RLS Policies

- [ ] Audit all RLS policies for correctness
- [ ] Ensure `TO authenticated` + ownership predicates
- [ ] Add `WITH CHECK` to UPDATE policies
- [ ] Remove any `auth.role()` usage (deprecated)

### 3.3 Connection Pooling

- [ ] Use Supabase connection pooler (PgBouncer)
- [ ] Configure appropriate pool size
- [ ] Monitor connection usage

---

## Priority 4: Next.js App Router Patterns

### 4.1 Server Components & Data Fetching

- [ ] Convert client components to server components where possible
- [ ] Use `fetch()` with `next: { revalidate }` for ISR
- [ ] Implement streaming with `loading.tsx` and Suspense
- [ ] Use parallel data fetching with `Promise.all()`

### 4.2 Client Components

- [ ] Minimize `'use client'` directives
- [ ] Extract interactivity to small client components
- [ ] Use `useTransition` for non-urgent updates

### 4.3 Caching & Revalidation

- [ ] Configure `next: { revalidate }` appropriately
- [ ] Use `unstable_cache` for expensive computations
- [ ] Implement on-demand revalidation with `revalidatePath`

---

## Priority 5: Tailwind v4 Polish

### 5.1 Design Tokens

- [ ] Migrate all custom colors to `@theme` in CSS
- [ ] Define semantic color tokens (primary, secondary, etc.)
- [ ] Define spacing, radius, animation tokens
- [ ] Use OKLCH colors for better perception

### 5.2 Component Patterns

- [ ] Create reusable component variants with `@utility`
- [ ] Standardize focus/hover/active states
- [ ] Implement dark mode with `@custom-variant dark`
- [ ] Use `@starting-style` for entry animations

### 5.3 Responsive & Accessible

- [ ] Use container queries where appropriate
- [ ] Ensure all components work at all breakpoints
- [ ] Add `prefers-reduced-motion` support

---

## Priority 6: Playwright Test Audit

### 6.1 Test Coverage

- [ ] Audit existing 87 tests for coverage gaps
- [ ] Add tests for critical user flows:
  - Registration flow
  - Contact form submission
  - Property search/filter
  - Language switching
  - Payment flow

### 6.2 Test Quality

- [ ] Remove flaky tests
- [ ] Add proper assertions (not just visibility)
- [ ] Use page objects for maintainability
- [ ] Add visual regression tests for key pages

### 6.3 CI/CD Integration

- [ ] Ensure tests run in CI
- [ ] Add performance budgets
- [ ] Add accessibility checks in tests

---

## Priority 7: Sentry & Monitoring

### 7.1 Error Tracking

- [ ] Configure source maps upload
- [ ] Set up alerting for error spikes
- [ ] Configure release tracking

### 7.2 Performance Monitoring

- [ ] Set up Core Web Vitals alerts
- [ ] Configure custom transactions
- [ ] Add user feedback widget

---

## Execution Order

1. **Week 1**: SEO + Accessibility (highest ROI)
2. **Week 2**: Supabase/DB optimization
3. **Week 3**: Next.js patterns + Tailwind v4
4. **Week 5**: Playwright audit + Sentry

---

## Success Metrics

| Metric                   | Current  | Target     |
| ------------------------ | -------- | ---------- |
| Lighthouse SEO           | ~90      | 100        |
| Lighthouse Accessibility | ~85      | 100        |
| Lighthouse Performance   | ~70      | 90+        |
| Core Web Vitals (LCP)    | ~1200ms  | < 2500ms   |
| Core Web Vitals (CLS)    | ~0.07    | < 0.1      |
| Core Web Vitals (INP)    | ~150ms   | < 200ms    |
| Test Coverage            | 87 tests | 120+ tests |
| Lighthouse SEO           | 90       | 100        |

---

## Notes

- All changes should maintain Hindi/English i18n support
- Test on mobile (375px) and desktop (1440px)
- Verify dark mode works correctly
- Ensure Sentry source maps upload in CI
- Run `pnpm build` and `pnpm test:e2e` after each major change
