-- Migration: Add email column to chat_leads table
-- Date: 20260701

ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS email TEXT;
