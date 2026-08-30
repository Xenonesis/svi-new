-- Migration: Add department column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- Index on department for filtering / grouping
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

COMMENT ON COLUMN public.profiles.department IS 'Department or organizational division of the user/employee (e.g. Sales & Business Development, IT & Engineering, Operations)';
