-- Migration: Add score column to chat_leads table for auto-scoring
-- Date: 20260704

ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
