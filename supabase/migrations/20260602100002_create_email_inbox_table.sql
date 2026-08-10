-- Create email_inbox table for storing incoming emails
CREATE TABLE IF NOT EXISTS email_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL UNIQUE,
  thread_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL,
  html_content TEXT,
  text_content TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'received',
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_inbox_received_at ON email_inbox(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_inbox_thread_id ON email_inbox(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_inbox_admin_id ON email_inbox(admin_id);

-- Enable RLS
ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own emails
DROP POLICY IF EXISTS "Users can view their emails" ON email_inbox;
CREATE POLICY "Users can view their emails"
  ON email_inbox FOR SELECT
  USING (auth.uid() = admin_id);

-- Policy: System can insert emails
DROP POLICY IF EXISTS "System can insert emails" ON email_inbox;
CREATE POLICY "System can insert emails"
  ON email_inbox FOR INSERT
  WITH CHECK (true);