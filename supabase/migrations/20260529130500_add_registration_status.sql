-- Add status column to registrations table
-- Idempotent: uses IF NOT EXISTS

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_registrations_status
  ON public.registrations (status);
