-- Create email_deletions table for tracking deleted sent emails
-- This allows admins to hide emails from the Sent tab without actually
-- deleting them from Resend (which doesn't support deletion).

CREATE TABLE IF NOT EXISTS email_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email_id, admin_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_deletions_admin_id ON email_deletions(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_deletions_email_id ON email_deletions(email_id);

-- Enable RLS (idempotent)
ALTER TABLE email_deletions ENABLE ROW LEVEL SECURITY;

-- Policies: drop first so they can be re-run safely
DROP POLICY IF EXISTS "Users can view their own deletions" ON email_deletions;
CREATE POLICY "Users can view their own deletions"
  ON email_deletions FOR SELECT
  USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can delete emails" ON email_deletions;
CREATE POLICY "Users can delete emails"
  ON email_deletions FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can undelete emails" ON email_deletions;
CREATE POLICY "Users can undelete emails"
  ON email_deletions FOR DELETE
  USING (auth.uid() = admin_id);
