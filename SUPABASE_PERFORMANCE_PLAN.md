# Supabase Performance: Analysis & Safe Fix Plan

**CRITICAL DIRECTIVE**: No existing functionalities or data will be lost. All database changes are purely additive (indexes) or read-optimizations. All API changes will ensure the exact same payload shape is delivered to the UI, just fetched more efficiently.

## Root Cause Summary

Supabase data loading is slow due to **3 main categories**:

1. **N+1 & Waterfall Queries** — sequential DB calls when parallel is possible.
2. **Over-fetching** — loading 1000s of rows for filters, and all columns when only a few are needed.
3. **Missing DB Indexes** — ILIKE searches scan full tables, lacking a trigram index.

---

## Issue 1: Registration Filter Options Fetch All 1000 Rows (HIGH)

**Problem**: Fetches **ALL registrations** (limit=1000) just to build filter dropdowns.
**Safe Fix**: Replace with a dedicated endpoint (`/api/admin/registrations/filters`) that returns only **distinct values** for each filter column.
**Safety Guarantee**: The UI will still receive the exact same list of filter options. We are just moving the deduplication from the client browser to the database level.

---

## Issue 2: Registration Query Uses `SELECT *` (HIGH)

**Problem**: `SELECT *` returns 25+ columns per row even when only 10-12 are shown in the table.
**Safe Fix**: Select only the specific columns needed by the `RegistrationTable` component.
**Safety Guarantee**: We will audit the `RegistrationTable` to ensure every column it uses is explicitly requested in the query. No data will be missing from the UI.

---

## Issue 3: Missing pg_trgm Index for ILIKE Searches (HIGH)

**Problem**: ILIKE searches (`%search%`) cause full table scans.
**Safe Fix**: Add a `pg_trgm` (trigram) GIN index.
**Safety Guarantee**: This is a purely additive database migration. It does not modify, delete, or lock existing data. It simply creates an index in the background to speed up text searches.

---

## Issue 4: Registration Cleanup on Every GET (MEDIUM)

**Problem**: Every GET request runs a DELETE cleanup, adding write overhead to read requests.
**Safe Fix**: Move the exact same DELETE logic to a scheduled cron job.
**Safety Guarantee**: Data retention policies remain identical. Old registrations will still be cleaned up, just asynchronously instead of blocking user page loads.

---

## Execution Strategy: How we can do it safely

To guarantee zero downtime and zero data loss, we will execute in strict phases:

### Phase 1: Database Additions (Safe & Non-Destructive)

- Create a new migration file in `supabase/migrations/` for the `pg_trgm` index.
- Apply the migration. This runs in the background and only adds performance capabilities.

### Phase 2: Additive API Changes (No UI changes yet)

- Create the new `/api/admin/registrations/filters` endpoint.
- Verify the new endpoint returns the correct distinct data by testing it directly.
- Ensure the existing `/api/admin/registrations` endpoint still works perfectly.

### Phase 3: Gradual UI & API Switch-Over

- Update `app/api/admin/registrations/route.ts` to select specific columns, ensuring all UI-required fields are included.
- Update `useRegistrations.ts` to fetch filters from the new `/filters` endpoint instead of downloading 1000 rows.
- Remove the inline DELETE cleanup from the GET request and move it to a dedicated endpoint for cron scheduling.
- Verify all tables, filters, and searches work exactly as before, but significantly faster.
