-- Phase 1.1: Lock RLS on public.registrations
-- The existing service_role_full_access_registrations policy targets `{public}` (ALL roles)
-- with `USING(true)` — meaning anon and authenticated users have full access.
-- This migration:
--   1. Drops the misconfigured policy
--   2. Recreates it with proper TO service_role restriction
--   3. Revokes anon table-level privileges

-- 1. Drop permissive policy that leaks to anon
DROP POLICY IF EXISTS service_role_full_access_registrations ON public.registrations;
DROP POLICY IF EXISTS registrations_anon_read ON public.registrations;
DROP POLICY IF EXISTS registrations_public_read ON public.registrations;

-- 2. Confirm RLS is on
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations FORCE ROW LEVEL SECURITY;

-- 3. Recreate service_role policy — only service_role JWT can bypass
CREATE POLICY service_role_full_access_registrations
  ON public.registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Deny anon reads; authenticated users can still read via admin_read_registrations (is_admin())
CREATE POLICY registrations_no_anon_read
  ON public.registrations
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY registrations_no_anon_write
  ON public.registrations
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY registrations_no_anon_update
  ON public.registrations
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

-- 5. Revoke table-level grants from anon (belt-and-suspenders)
REVOKE ALL ON public.registrations FROM anon;
