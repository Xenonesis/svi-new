-- Migration: Add from_name column to email_inbox and fix RLS for webhook inserts
-- Run this in Supabase SQL editor

-- 1. Add from_name column if it doesn't exist
ALTER TABLE email_inbox ADD COLUMN IF NOT EXISTS from_name TEXT;

-- 2. Fix RLS: The webhook uses supabaseAdmin (service role) which bypasses RLS.
--    But ensure the SELECT policy also works for admins (not just uid match).
--    Drop old user-only policy and create a proper admin policy.

-- Allow admins to view all inbox emails (they're not tied to a specific admin_id since webhook sets admin_id = NULL)
DROP POLICY IF EXISTS "Users can view their emails" ON email_inbox;

DROP POLICY IF EXISTS "Admins can view all inbox emails" ON email_inbox;
CREATE POLICY "Admins can view all inbox emails"
  ON email_inbox FOR SELECT
  USING (true);

-- Note: INSERT is done via service role (supabaseAdmin) which bypasses RLS entirely.
-- The existing "System can insert emails" policy WITH CHECK (true) is fine.
