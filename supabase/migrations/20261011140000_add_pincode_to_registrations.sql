-- Migration: Add pincode column to registrations table
-- Idempotent: uses IF NOT EXISTS

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS pincode text;

-- Create index for pincode querying/filtering
CREATE INDEX IF NOT EXISTS idx_registrations_pincode
  ON public.registrations (pincode)
  WHERE pincode IS NOT NULL AND pincode != '';
