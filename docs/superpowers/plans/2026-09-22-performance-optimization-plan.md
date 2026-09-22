# Database Fetch & Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate database latency bottlenecks across admin settings, email center, workforce employee metrics, and dashboard analytics without any database reset, data loss, or destructive schema changes.

**Architecture:**

1. **Server-Side In-Memory Route Caching:** Apply 60s TTL caching on high-frequency read-heavy configuration/analytics routes (`/api/admin/settings`, `/api/admin/analytics`) with atomic invalidation on mutations.
2. **Selective Column Projection:** Strip multi-kilobyte raw HTML payloads from email list endpoints (`/api/admin/email`) while preserving full content on single-item retrieval.
3. **Database-Level Lead Stats Aggregation:** Introduce a non-destructive, additive PostgreSQL RPC `get_employee_lead_stats` that aggregates assigned lead metrics inside the database engine in ~15ms, eliminating the 1,000-row PostgREST truncation bug and high memory transfer on `/api/admin/employees`.
4. **Query Consolidation:** Replace 5 separate document count queries in `/api/admin/analytics` with a single grouped query.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Supabase PostgreSQL, Vitest.

---

## Global Constraints

- **Zero DB Reset:** Strictly NO table drops, NO truncations, NO column deletions, and NO schema alterations.
- **Strict TypeScript:** No `: any` or `as any`. Use concrete interfaces and `import type`.
- **Backward Compatibility:** All routes must feature graceful fallbacks if newly added RPCs are not yet executed in Supabase.
- **Verification First:** Benchmark and test before declaring each task complete.

---

### Task 1: In-Memory Server Cache & Invalidation for `/api/admin/settings`

**Files:**

- Modify: `app/api/admin/settings/route.ts:49-164`
- Test: `tests/api/admin-settings-cache.test.ts`

**Context:**
`/api/admin/settings` is queried by 36+ components across the administration portal. Currently, every single navigation triggers a 335ms Supabase query for 38 rows (~17.8 KB).

- [ ] **Step 1: Write unit test for settings caching & invalidation**

Create `tests/api/admin-settings-cache.test.ts` to test in-memory cache TTL and mutation invalidation.

- [ ] **Step 2: Implement 60-second in-memory cache in `app/api/admin/settings/route.ts`**

Add an in-memory cache structure:

```ts
let settingsCache: { data: unknown; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;
```

In `GET`: If cache is fresh and no specific `key` requested, return cached settings immediately.
In `POST`: Reset `settingsCache = null` on successful update.

- [ ] **Step 3: Run Vitest to verify test passes**

Run: `npx vitest run tests/api/admin-settings-cache.test.ts`
Expected: PASS

- [ ] **Step 4: Verify latency drop with benchmark script**

Run benchmark in Node/Bun to prove repeat requests execute in < 1ms.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/settings/route.ts tests/api/admin-settings-cache.test.ts
git commit -m "perf(settings): add 60s in-memory server cache and mutation invalidation"
```

---

### Task 2: Strip Heavy HTML Payloads from Email Inbox List (`/api/admin/email`)

**Files:**

- Modify: `app/api/admin/email/route.ts:350-495`
- Test: `tests/api/admin-email-payload.test.ts`

**Context:**
`app/api/admin/email/route.ts` currently fetches full `html_content` and `text_content` for every message in the inbox list, resulting in a 76 KB payload for just 14 emails (452ms). Single-email retrieval (`?action=email&id=...`) already exists and fetches full content on demand.

- [ ] **Step 1: Write test verifying list view returns slim snippet without full HTML**

Create `tests/api/admin-email-payload.test.ts`.

- [ ] **Step 2: Update `app/api/admin/email/route.ts` query projection**

In the inbox listing query (lines 353-388), remove `html_content` from the SELECT query. Use `snippet` or truncated text for the preview snippet. Keep `html_content` intact for single-email views (`action === 'email'` or specific ID lookup).

- [ ] **Step 3: Run Vitest to verify test passes**

Run: `npx vitest run tests/api/admin-email-payload.test.ts`
Expected: PASS

- [ ] **Step 4: Verify 91% payload reduction with benchmark script**

Confirm payload drops from ~76 KB to ~6.7 KB and query time drops from 452ms to ~230ms.

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/email/route.ts tests/api/admin-email-payload.test.ts
git commit -m "perf(email): exclude heavy html_content from inbox list view query"
```

---

### Task 3: Non-Destructive RPC & Accurate Aggregation for `/api/admin/employees`

**Files:**

- Create: `supabase/migrations/20260923020000_employee_lead_stats_rpc.sql`
- Modify: `app/api/admin/employees/route.ts:50-95`
- Test: `tests/api/admin-employees-stats.test.ts`

**Context:**
Currently, `/api/admin/employees` fetches leads with `.in('assigned_to', employeeIds)` without pagination, which hits the Supabase 1,000-row limit. 20,737 assigned leads are ignored, leading to inaccurate employee statistics and 824ms response times.

- [ ] **Step 1: Create non-destructive additive RPC migration**

Create `supabase/migrations/20260923020000_employee_lead_stats_rpc.sql`:

```sql
CREATE OR REPLACE FUNCTION get_employee_lead_stats(p_employee_ids UUID[])
RETURNS TABLE (
  assigned_to UUID,
  total_leads INT,
  won_leads INT,
  active_leads INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    assigned_to,
    COUNT(*)::INT AS total_leads,
    COUNT(*) FILTER (WHERE lifecycle_status = 'won')::INT AS won_leads,
    COUNT(*) FILTER (WHERE lifecycle_status NOT IN ('won', 'lost'))::INT AS active_leads
  FROM chat_leads
  WHERE assigned_to = ANY(p_employee_ids)
  GROUP BY assigned_to;
$$;
```

- [ ] **Step 2: Update `app/api/admin/employees/route.ts` to call RPC with safe fallback**

Call `supabaseAdmin.rpc('get_employee_lead_stats', { p_employee_ids: employeeIds })`.
If RPC is present, map results directly. If RPC returns an error (e.g. migration pending in cloud), fall back gracefully to the existing query logic.

- [ ] **Step 3: Run Vitest to verify employee stats logic**

Run: `npx vitest run tests/api/admin-employees-stats.test.ts`
Expected: PASS

- [ ] **Step 4: Benchmark `/api/admin/employees` query**

Confirm execution time drops from 824ms to < 200ms and accurately counts all 21,737 leads.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260923020000_employee_lead_stats_rpc.sql app/api/admin/employees/route.ts tests/api/admin-employees-stats.test.ts
git commit -m "perf(employees): aggregate lead stats in database RPC eliminating truncation"
```

---

### Task 4: Consolidate Queries & Cache in `/api/admin/analytics`

**Files:**

- Modify: `app/api/admin/analytics/route.ts:80-156`
- Test: `tests/api/admin-analytics.test.ts`

**Context:**
`/api/admin/analytics` runs 11 separate count queries on every mount of the Admin Dashboard, resulting in 693ms latency.

- [ ] **Step 1: Consolidate document counts into a single query**

Replace 5 individual `types.map(...)` queries with a single query on `documents` table (`select('document_type').eq('status', 'completed')`), grouping counts in JavaScript (since total documents is only ~114 rows).

- [ ] **Step 2: Add 60-second in-memory server cache**

Add 60-second in-memory cache to `app/api/admin/analytics/route.ts`.

- [ ] **Step 3: Run Vitest to verify analytics payload**

Run: `npx vitest run tests/api/admin-analytics.test.ts`
Expected: PASS

- [ ] **Step 4: Verify latency drop from 693ms to < 200ms (and 0.1ms repeat)**

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/analytics/route.ts tests/api/admin-analytics.test.ts
git commit -m "perf(analytics): consolidate document queries and add in-memory server cache"
```

---

### Task 5: End-to-End Verification & Full Test Suite

- [ ] **Step 1: Run TypeScript typecheck**
      Run: `npm run type-check` or `npx tsc --noEmit`
      Expected: 0 errors

- [ ] **Step 2: Run all Vitest test suites**
      Run: `npx vitest run`
      Expected: 100% passing

- [ ] **Step 3: Run comprehensive speed benchmark script**
      Prove all admin and public pages respond in sub-200ms (with cached repeat requests at ~0.1ms).
