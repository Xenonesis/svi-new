-- Migration: Create chat_leads table for chatbot lead capture
-- Date: 20260609

CREATE TABLE IF NOT EXISTS chat_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT DEFAULT 'chatbot',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for admin lookup
CREATE INDEX IF NOT EXISTS idx_chat_leads_created_at ON chat_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_leads_phone ON chat_leads(phone);

-- Row Level Security
ALTER TABLE chat_leads ENABLE ROW LEVEL SECURITY;

-- Only admins can read chat_leads
CREATE POLICY "Admins can read chat_leads"
  ON chat_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can insert chat_leads"
  ON chat_leads
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT INSERT ON chat_leads TO anon;
GRANT INSERT ON chat_leads TO authenticated;
GRANT SELECT ON chat_leads TO authenticated;
