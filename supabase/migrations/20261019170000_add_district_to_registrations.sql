-- Migration: Add district column to registrations table
-- Idempotent: uses IF NOT EXISTS

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS district text;

-- Create index for district querying/filtering
CREATE INDEX IF NOT EXISTS idx_registrations_district
  ON public.registrations (district)
  WHERE district IS NOT NULL AND district != '';
