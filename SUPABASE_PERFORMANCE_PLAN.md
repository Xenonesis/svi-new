# Supabase Performance: Analysis & Fix Plan

## Root Cause Summary

Supabase data loading slow due to **3 main categories**:

1. **N+1 & Waterfall Queries** — sequential DB calls when parallel possible
2. **Over-fetching** — loading 1000s of rows for filters, all columns when few needed
3. **Missing DB Indexes** — ILIKE searches scan full tables, no trigram index

---

## Issue 1: Registration Filter Options Fetch All 1000 Rows (HIGH)

**File**: `src/components/admin/registrations/useRegistrations.ts`

```ts
fetch('/api/admin/registrations?limit=1000', { ... })
```

Fetches **ALL registrations** (limit=1000) just to build filter dropdowns (project names, advisors, etc.). This `SELECT *` + `count: exact` on every page visit = massive data transfer.

**Fix**: Replace with a dedicated endpoint that returns only **distinct values** for each filter column. Use `DISTINCT` SQL queries instead of full row fetch + JS dedup.

```sql
-- New endpoint: /api/admin/registrations/filters
SELECT DISTINCT project FROM registrations ORDER BY project;
SELECT DISTINCT advisor_name FROM registrations ORDER BY advisor_name;
-- ... etc (can be parallel queries or UNION)
```

---

## Issue 2: Registration Query Uses `SELECT *` (HIGH)

**File**: `app/api/admin/registrations/route.ts` line ~55

```ts
let query = supabaseAdmin
  .from('registrations')
  .select('*', { count: 'exact' })
  .order(sortCol, { ascending })
  .range(offset, offset + limit - 1);
```

`SELECT *` returns 25+ columns per row even when only 10-12 are shown in table. Wastes bandwidth.

**Fix**: Select only needed columns (e.g., the 12 shown in RegistrationTable).

---

## Issue 3: Missing pg_trgm Index for ILIKE Searches (HIGH)

**File**: `app/api/admin/registrations/route.ts`

```ts
query = query.or(`submission_id.ilike.%${search}%,name.ilike.%${search}%...`);
```

ILIKE with leading `%` cannot use standard B-tree indexes. With 1000s registrations, this is a **full table scan** on every search.

**Fix**: Add a **pg_trgm GIN index** for fast fuzzy text search:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_registrations_search_trgm ON registrations
  USING gin (
    submission_id gin_trgm_ops,
    name gin_trgm_ops,
    last_name gin_trgm_ops,
    email gin_trgm_ops,
    phone gin_trgm_ops,
    advisor_name gin_trgm_ops,
    project gin_trgm_ops
  );
```

Or use Supabase's `textSearchConfig` / `tsvector` for full-text search.

---

## Issue 4: Registration Cleanup on Every GET (MEDIUM)

**File**: `app/api/admin/registrations/route.ts` lines ~20-28

```ts
const { error: cleanupError } = await supabaseAdmin
  .from('registrations')
  .delete()
  .lt('created_at', thirtyDaysAgo.toISOString())
  .or('is_important.eq.false,is_important.is.null');
```

Every single GET request runs a DELETE cleanup. This adds **write overhead to every read request**.

**Fix**: Move to a scheduled cron job (Supabase cron or Vercel Cron Jobs). Remove from GET handler.

---

## Issue 5: Dashboard Auth Waterfall (MEDIUM)

**File**: `app/admin/dashboard/page.tsx`

```
1. supabase.auth.getSession()              → 1 network round trip
2. profiles.select('role, full_name')      → 2nd round trip (after #1)
3. properties.select('name, slug')         → 3rd round trip (after #2)
4. useUsers()                              → 4th (React Query, parallel with below)
5. useAnalytics()                          → 5th (React Query)
6. useActivities()                         → 6th (React Query)
```

Steps 1→2→3 are strictly sequential waterfall. Steps 4-6 start after 1-2 complete.

**Fix**:

- Move auth + profile check to an API endpoint `/api/admin/me` that returns admin info + properties in one call
- Or await session first, then run profile check + properties fetch in parallel

---

## Issue 6: Email syncInboundEmails Sequential (MEDIUM)

**File**: `app/api/admin/email/route.ts` syncInboundEmails()

```ts
for (const e of missingEmails) {
  const { data: emailData } = await resend.emails.receiving.get(emailId);  // sequential!
  ...
}
```

Each missing email fetched from Resend API one-by-one. N emails = N serial API calls.

**Fix**: Use `Promise.allSettled()` to fetch missing emails in parallel (with concurrency limit).

---

## Issue 7: Attendance getMemberCounts Fetches All Rows (MEDIUM)

**File**: `src/lib/repositories/attendanceRepository.ts`

```ts
const { data: allMembers } = await supabaseAdmin.from('team_members').select('team_id');
// ... counts computed in JS loop
```

Fetches **every row** from team_members table to count members per team.

**Fix**: Use database-level aggregation:

```ts
const { data } = await supabaseAdmin.from('team_members').select('team_id', { count: 'exact' }); // won't help

// Better: use raw SQL for GROUP BY count
const { data } = await supabaseAdmin.rpc('get_team_member_counts');
```

Or simpler: use a subquery with `select('*, team_members(count)')` if team table supports it.

---

## Issue 8: Notification Index Not Optimal (LOW)

**File**: `supabase/migrations/20260531090000_performance_indexes.sql`

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE is_read = false;
```

This partial index is good, but there's no **composite index on `(user_id, is_read)`** for the case when admins query both read and unread.

**Fix**: Add composite index:

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read
  ON notifications(user_id, is_read);
```

---

## Issue 9: No Caching on Frequent Data (LOW)

Properties, filter options, and analytics data change infrequently but are re-fetched on every page load.

**Fix**:

- Use `staleTime: 5 * 60 * 1000` (5 min) in React Query for properties and filter options
- Use Next.js `stale-while-revalidate` caching headers (already partially done on analytics)
- Consider React Query's `gcTime` for longer persistence

---

## Issue 10: Client-Side Email Filtering (LOW)

**File**: `src/components/admin/email/hooks/useSentEmails.ts`

All search/filter/sort happens on client after fetching ALL emails. For 1000+ emails, this means loading data that's never displayed.

**Fix**: Push filters to server-side API (search, status, date range, from) so fewer emails are transferred.

---

## Priority Order

| Priority | Issue                                           | Effort  | Impact     |
| -------- | ----------------------------------------------- | ------- | ---------- |
| P0       | #1 Registration filter options fetch 1000 rows  | Small   | High       |
| P0       | #3 Missing pg_trgm index for ILIKE/OR search    | Small   | High       |
| P1       | #2 SELECT \* on registrations                   | Small   | Medium     |
| P1       | #4 Registration cleanup on every GET            | Small   | Medium     |
| P1       | #5 Dashboard auth waterfall                     | Medium  | Medium     |
| P2       | #6 Email syncInboundEmails sequential           | Small   | Low-Medium |
| P2       | #7 Attendance getMemberCounts all rows          | Small   | Low        |
| P3       | #8-10 Index tuning, caching, client-side filter | Various | Low        |

---

## Quick Wins (Can fix in 1 session)

1. **#1 + #2**: New `/api/admin/registrations/filters` endpoint + column select
2. **#3**: Run pg_trgm migration SQL
3. **#4**: Remove cleanup from GET, create cron endpoint
4. **#6**: Use Promise.allSettled in syncInboundEmails
