-- Fix: notifications table has updated_at trigger but no updated_at column
-- Add the column so the trigger works

alter table public.notifications add column if not exists updated_at timestamptz not null default now();
