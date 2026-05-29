-- Migration to add real_email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS real_email text;
