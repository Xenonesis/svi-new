# Vercel React Best Practices Analysis Plan

## Context

This plan outlines a deep analysis of the SVI Infra Solutions Next.js application using the Vercel React Best Practices skill. The application is a complex real estate platform with:

- Admin dashboard for managing users, properties, registrations
- Employee portal for staff management
- Customer portal for clients to view properties, payments, documents
- Internationalization (English/Hindi)
- Supabase backend with React Query for data fetching
- Zustand for state management
- Motion/react for animations

## Approach

I will analyze the codebase against all 70 rules in the Vercel React Best Practices skill, organized by priority categories:

1. **Priority 1: Eliminating Waterfalls** (async- rules) - CRITICAL
2. **Priority 2: Bundle Size Optimization** (bundle- rules) - CRITICAL
3. **Priority 3: Server-Side Performance** (server- rules) - HIGH
4. **Priority 4: Client-Side Data Fetching** (client- rules) - MEDIUM-HIGH
5. **Priority 5: Re-render Optimization** (rerender- rules) - MEDIUM
6. **Priority 6: Rendering Performance** (rendering- rules) - MEDIUM
7. **Priority 7: JavaScript Performance** (js- rules) - LOW-MEDIUM
8. **Priority 8: Advanced Patterns** (advanced- rules) - LOW

For each rule, I will:

- Search for relevant code patterns in the codebase
- Identify violations or areas for improvement
- Provide specific examples from the code
- Prioritize fixes based on impact

## Files to Analyze

Key directories to analyze:

- `app/` - Next.js app router (pages, layouts, route handlers)
- `src/components/` - React components
- `src/lib/` - Utilities, API clients, hooks
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand stores

## Verification

After analysis, I will produce:

1. A comprehensive report categorizing findings by rule priority
2. Specific code examples of violations
3. Prioritized recommendations for fixes
4. Estimated impact of each fix

## Exploration Findings - Priority 1: Eliminating Waterfalls (async- rules)

### ✅ Good Practices Found

1. **Admin Dashboard** (`app/admin/dashboard/page.tsx`): Uses `Promise.all()` to fetch profile and properties in parallel
2. **Analytics API** (`app/api/admin/analytics/route.ts`): Uses `Promise.all()` for parallel data fetching in multiple places

### ❌ Violations Found

1. **Admin Portal Allotments** (`app/[locale]/(main)/admin/portal-allotments/page.tsx`):
   - In `fetchData()` function: Three sequential `await` calls for fetching allotments, profiles, and properties
   - These are independent queries that could be run in parallel with `Promise.all()`

2. **Registration API** (`app/api/registration/route.ts`):
   - In POST handler: Sequential awaits for email settings lookup and advisor profile lookup
   - These could be parallelized as they don't depend on each other
   - Also: The registration ID generation and insertion loop could be optimized

Let me continue exploring other rule categories.
