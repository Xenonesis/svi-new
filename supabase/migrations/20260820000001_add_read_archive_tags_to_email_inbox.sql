-- Migration: Add is_read, is_archived, is_starred, and tags to email_inbox
-- Run this in Supabase SQL editor

-- 1. Add missing state columns to email_inbox
ALTER TABLE email_inbox 
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- 2. Populate is_read for legacy emails if needed (optional default is false)
UPDATE email_inbox 
SET is_read = false 
WHERE is_read IS NULL;

UPDATE email_inbox 
SET is_archived = false 
WHERE is_archived IS NULL;

UPDATE email_inbox 
SET is_starred = false 
WHERE is_starred IS NULL;

UPDATE email_inbox 
SET tags = '{}'::text[] 
WHERE tags IS NULL;

-- 3. Create high-performance indexes for state filters
CREATE INDEX IF NOT EXISTS idx_email_inbox_is_read ON email_inbox(is_read);
CREATE INDEX IF NOT EXISTS idx_email_inbox_is_archived ON email_inbox(is_archived);
CREATE INDEX IF NOT EXISTS idx_email_inbox_is_starred ON email_inbox(is_starred);
CREATE INDEX IF NOT EXISTS idx_email_inbox_tags ON email_inbox USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_email_inbox_composite_inbox ON email_inbox(is_archived, received_at DESC);
