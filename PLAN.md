# Plan: Speed up /admin login & dashboard load

## Context

The user reports `/admin` takes too long to load/login. Investigation found four causes:

1. **Artificial 1.8s delay** on the login success screen before redirecting to `/admin/dashboard` (`app/admin/page.tsx:1800`).
2. **Duplicate auth initialization** — `app/admin/layout.tsx` calls `useAuthStore.initialize()` (session check + profile fetch), then `app/admin/dashboard/page.tsx` runs its **own** second auth check (`getUser()` → `getSession()` → profile) before showing anything.
3. **Token waterfall** — dashboard's React Query hooks (`useUsers`, `useAnalytics`, `useActivities`) are gated on a _local_ `token` state that is only set after the dashboard's own auth effect finishes, delaying data fetches.
4. **Realtime channels on the login page** — the layout subscribes to Supabase realtime (`registrations`, `chat_leads`) immediately, even on the public login screen where it's wasted work.

## Approach

1. **Login page (`app/admin/page.tsx`)**
   - Reduce redirect delay from 1800ms → 450ms (keeps the success animation visible but snappy).
   - After the admin role check, populate the auth store directly (`useAuthStore.setState(...)`) with the session + profile we already have, so the dashboard never waits on a second auth round-trip.

2. **Dashboard (`app/admin/dashboard/page.tsx`)**
   - Read auth state from the shared store (`token`, `userId`, `isAdmin`, `loading`) instead of running a second `getUser()/getSession()/profile` chain.
   - Replace the old auth effect with:
     - a redirect guard (`if !token || !isAdmin → /admin`, skipped while `authLoading`),
     - a properties fetch effect that runs as soon as the store token is available (kills the waterfall — queries now enable the moment the store settles, not after a second local auth pass).
   - Remove now-unused `setToken`, `setAdminName`, `setCurrentAdminId`, `setAuthLoading` state and the unused `useCallback` import. `currentAdminId` becomes `userId || ''` derived from the store.

3. **Layout (`app/admin/layout.tsx`)**
   - Extract the realtime subscription logic into an `AdminRealtimeListeners` component (returns `null`).
   - Render `<AdminRealtimeListeners />` only in the authenticated branch (the `/admin` login page early-returns without it), so no realtime channels are opened on the login screen. It stays mounted across admin-page navigation (no re-subscribe churn).

## Files to modify

- `app/admin/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/layout.tsx`

## Reuse

- `useAuthStore` (`src/stores/authStore.ts`) — already initializes session + profile once; dashboard should consume it rather than duplicate the logic.
- `useUsers` / `useAnalytics` / `useActivities` (`src/hooks/useDashboard.ts`) — unchanged; they already take `token` and gate on `enabled: !!token`.
- Existing realtime subscription code — moved verbatim into `AdminRealtimeListeners`.

## Steps

- [ ] `app/admin/page.tsx`: add `useAuthStore` import; select `role, full_name, email` in profile check; `useAuthStore.setState(...)` on success; change `setTimeout` 1800 → 450.
- [ ] `app/admin/dashboard/page.tsx`: add `useAuthStore` import; drop `useCallback` import; replace local auth state with store selectors; replace auth effect with redirect guard + properties effect.
- [ ] `app/admin/layout.tsx`: extract realtime listeners into `AdminRealtimeListeners`; remove inline effect; render component in authenticated branch only.

## Verification

- `pnpm dev`, open `/admin`, log in with admin credentials:
  - Redirect to dashboard should be near-instant after the brief success animation (was ~2s).
  - Dashboard should render content as soon as the store settles — no visible second auth delay.
  - Log out → login page loads without realtime channel errors.
- Watch Network tab: `getSession`/profile calls should happen **once** (not twice) when entering the dashboard.
- `pnpm lint` (or pre-push hook) passes.
- Push to GitHub.
