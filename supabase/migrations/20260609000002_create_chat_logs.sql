-- Migration: Create chat_logs table for chatbot conversation history
-- Date: 20260609

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  messages JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for admin lookup and sorting
CREATE INDEX IF NOT EXISTS idx_chat_logs_updated_at ON chat_logs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- Row Level Security
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read chat_logs
CREATE POLICY "Admins can read chat_logs"
  ON chat_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can insert chat_logs"
  ON chat_logs
  FOR INSERT
  WITH CHECK (true);

-- Only admins can update chat_logs
CREATE POLICY "Admins can update chat_logs"
  ON chat_logs
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT INSERT ON chat_logs TO anon;
GRANT INSERT ON chat_logs TO authenticated;
GRANT SELECT ON chat_logs TO authenticated;
GRANT UPDATE ON chat_logs TO authenticated;

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_chat_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_logs_updated_at_trigger
  BEFORE UPDATE ON chat_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_logs_updated_at();

-- Notify helper function for new leads
CREATE OR REPLACE FUNCTION notify_new_chat_lead()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    pg_notify(
      'new_chat_lead',
      json_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'phone', NEW.phone
      )::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_leads_notify_trigger
  AFTER INSERT ON chat_leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_chat_lead();
