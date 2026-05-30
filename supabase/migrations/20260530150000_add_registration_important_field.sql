-- Migration to add is_important column to registrations table
-- Used by admins to pause 30-day auto-deletion of specific records

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS is_important boolean DEFAULT false;
