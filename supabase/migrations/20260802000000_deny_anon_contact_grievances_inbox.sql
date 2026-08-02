-- Phase 1.2: Lock RLS on public.contact_submissions, public.grievances, public.email_inbox
-- Mirrors 20260728000000_anon_deny_registrations.sql. The existing *_full_access_*
-- policies have no TO clause, so they apply to ALL roles — anon can read and write
-- every contact submission, grievance, and inbox email.
-- All public writes go through server-side supabaseAdmin (service_role), which
-- bypasses RLS, so removing anon access breaks nothing.

-- 1. contact_submissions ─────────────────────────────────────────────
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_full_access_contact ON public.contact_submissions;
CREATE POLICY service_role_full_access_contact
  ON public.contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY contact_submissions_no_anon_read
  ON public.contact_submissions
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY contact_submissions_no_anon_write
  ON public.contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Belt-and-suspenders: anon has no table-level privileges at all
REVOKE ALL ON public.contact_submissions FROM anon;

-- 2. grievances ──────────────────────────────────────────────────────
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_full_access_grievances ON public.grievances;
CREATE POLICY service_role_full_access_grievances
  ON public.grievances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY grievances_no_anon_read
  ON public.grievances
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY grievances_no_anon_write
  ON public.grievances
  FOR INSERT
  TO anon
  WITH CHECK (false);

REVOKE ALL ON public.grievances FROM anon;

-- 3. email_inbox ─────────────────────────────────────────────────────
ALTER TABLE public.email_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_inbox FORCE ROW LEVEL SECURITY;

-- INSERT was open to every role (WITH CHECK (true), no TO) — spam injection vector
DROP POLICY IF EXISTS "System can insert emails" ON public.email_inbox;
CREATE POLICY "System can insert emails"
  ON public.email_inbox
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- SELECT was USING (true) with no TO — anon could read the whole inbox
DROP POLICY IF EXISTS "Admins can view all inbox emails" ON public.email_inbox;
CREATE POLICY "Admins can view all inbox emails"
  ON public.email_inbox
  FOR SELECT
  TO service_role
  USING (true);

-- Authenticated admin reads, matching the admin_read_* pattern on other tables
DROP POLICY IF EXISTS admin_read_email_inbox ON public.email_inbox;
CREATE POLICY admin_read_email_inbox
  ON public.email_inbox
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY email_inbox_no_anon_read
  ON public.email_inbox
  FOR SELECT
  TO anon
  USING (false);

CREATE POLICY email_inbox_no_anon_write
  ON public.email_inbox
  FOR INSERT
  TO anon
  WITH CHECK (false);

REVOKE ALL ON public.email_inbox FROM anon;
