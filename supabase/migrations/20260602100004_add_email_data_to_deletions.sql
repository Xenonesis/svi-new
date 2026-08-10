-- Add email_data JSONB column to email_deletions table
-- This stores a snapshot of the email metadata at deletion time,
-- so the Recycle Bin can display deleted emails without calling Resend.

ALTER TABLE email_deletions ADD COLUMN IF NOT EXISTS email_data JSONB;

-- Index for querying deleted emails, ordered by deletion date
CREATE INDEX IF NOT EXISTS idx_email_deletions_deleted_at ON email_deletions(deleted_at DESC);
