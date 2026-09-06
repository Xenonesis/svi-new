-- Migration: Add is_active column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Index for fast status filtering and queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
