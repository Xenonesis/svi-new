-- Phase 2: Fix contact_groups / contact_group_members RLS
-- The only policies on these tables use
--   auth.jwt() ->> 'role' IN ('admin', 'service_role')
-- which never matches: Supabase JWTs carry role 'authenticated' for logged-in
-- users, so admins were locked out of the Data API entirely (verified live via
-- pg_policies: roles = {public}, same qual on both tables).
-- The app talks to these tables exclusively through supabaseAdmin
-- (service_role), which bypasses RLS — so the fix restores JWT admin access
-- via the established public.is_admin() pattern and hardens anon.
-- Also neutralizes the invalid-pattern policies on fresh DBs (20260602010000).

ALTER TABLE public.contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage groups" ON public.contact_groups;
DROP POLICY IF EXISTS "Admins can manage group members" ON public.contact_group_members;

-- Service role: full access (all app reads/writes go through supabaseAdmin)
CREATE POLICY service_role_full_access_contact_groups
  ON public.contact_groups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_full_access_contact_group_members
  ON public.contact_group_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated admins (Data API / dashboard access via user JWT)
CREATE POLICY admin_manage_contact_groups
  ON public.contact_groups
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY admin_manage_contact_group_members
  ON public.contact_group_members
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Deny anon explicitly + revoke table-level privileges (belt and suspenders)
CREATE POLICY contact_groups_no_anon_read
  ON public.contact_groups
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY contact_groups_no_anon_write
  ON public.contact_groups
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY contact_group_members_no_anon_read
  ON public.contact_group_members
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY contact_group_members_no_anon_write
  ON public.contact_group_members
  FOR INSERT
  TO anon
  WITH CHECK (false);

REVOKE ALL ON public.contact_groups FROM anon;
REVOKE ALL ON public.contact_group_members FROM anon;
