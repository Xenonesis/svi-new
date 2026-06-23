-- Migration: Add site visit columns to chat_leads table
-- Date: 20260623

ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS project_interest TEXT,
  ADD COLUMN IF NOT EXISTS preferred_date TEXT;

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_chat_leads_source ON chat_leads(source);
