-- Create email_stars table for favorite/starred emails
-- This allows admins to star important emails for quick access

CREATE TABLE IF NOT EXISTS email_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (email_id, admin_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_stars_admin_id ON email_stars(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_stars_email_id ON email_stars(email_id);

-- Enable RLS
ALTER TABLE email_stars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own starred emails" ON email_stars;
CREATE POLICY "Users can view their own starred emails"
  ON email_stars FOR SELECT
  USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can star emails" ON email_stars;
CREATE POLICY "Users can star emails"
  ON email_stars FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can unstar emails" ON email_stars;
CREATE POLICY "Users can unstar emails"
  ON email_stars FOR DELETE
  USING (auth.uid() = admin_id);