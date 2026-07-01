-- Migration: Add lead qualification fields to chat_leads table
-- Date: 20260701

ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS budget TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT;
