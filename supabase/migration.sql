-- ============================================================
-- SVI Infra Solutions — Supabase Database Setup
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 2. Create profiles table (only if it doesn't already exist)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null,
  phone        text,
  property_interest text,
  notes        text,
  role         text not null default 'client' check (role in ('admin', 'client')),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Auto-update updated_at on every row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Drop trigger if it exists before creating to avoid duplicate errors
drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 4. Row Level Security (RLS) — enable it
alter table public.profiles enable row level security;

-- Drop existing policies first to avoid duplicates when re-running
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Service role full access" on public.profiles;

-- Policy: users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: admins can read ALL profiles
-- To avoid infinite recursion in public.profiles, we use a security definer helper function
create or replace function public.is_admin()
returns boolean security definer language plpgsql as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    public.is_admin()
  );


-- Policy: only service role (backend) can insert / update / delete
-- (The createUser API endpoint runs with the service role key, bypassing RLS)
create policy "Service role full access"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Clean up existing corrupted user (safely cascades to profiles/identities)
DELETE FROM auth.users WHERE email = 'admin@sviinfra.com';

-- Enable pgcrypto extension to allow password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the default admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  'authenticated',
  'authenticated',
  'admin@sviinfra.com',
  crypt('REPLACE_WITH_STRONG_PASSWORD', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  '',
  '',
  ''
);

-- Create the identity so GoTrue knows how to log them in
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  '{"sub": "d7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea", "email": "admin@sviinfra.com"}'::jsonb,
  'email',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  now(),
  now(),
  now()
);

-- Associate the default admin user with an admin profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('d7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea', 'admin@sviinfra.com', 'System Admin', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'System Admin';

-- ============================================================
-- Documents Table - Track all generated documents
-- ============================================================

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  document_type text not null check (document_type in ('allotment_letter', 'payment_receipt', 'payment_plan', 'offer_letter', 'bba')),
  user_id uuid references public.profiles(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  form_data jsonb not null default '{}'::jsonb,
  pdf_url text,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'completed', 'archived')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_documents_user_id on public.documents(user_id);
create index idx_documents_type on public.documents(document_type);
create index idx_documents_created_at on public.documents(created_at desc);

-- RLS Policies
alter table public.documents enable row level security;

drop policy if exists "Admins can read all documents" on public.documents;
drop policy if exists "Users can read own documents" on public.documents;
drop policy if exists "Service role full access" on public.documents;

create policy "Admins can read all documents"
  on public.documents for select
  using (public.is_admin());

create policy "Users can read own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.documents for all
  using (auth.role() = 'service_role');

-- Auto-update trigger
drop trigger if exists documents_updated_at on public.documents;
create trigger documents_updated_at
  before update on public.documents
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Notifications Table - Real-time admin notifications
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean not null default false,
  action_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- RLS Policies
alter table public.notifications enable row level security;

drop policy if exists "Admins can read all notifications" on public.notifications;
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Service role full access" on public.notifications;
drop policy if exists "Insert notifications" on public.notifications;

create policy "Admins can read all notifications"
  on public.notifications for select
  using (public.is_admin());

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.notifications for all
  using (auth.role() = 'service_role');

create policy "Insert notifications"
  on public.notifications for insert
  with check (true);

-- Auto-update trigger for updated_at (if needed later)
drop trigger if exists notifications_updated_at on public.notifications;
create trigger notifications_updated_at
  before update on public.notifications
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Activity Logs Table - Track all admin activities
-- ============================================================

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  action_type text not null check (action_type in ('user_created', 'user_deleted', 'document_generated', 'document_downloaded', 'settings_updated', 'profile_updated')),
  description text not null,
  target_id uuid,
  target_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_action_type on public.activity_logs(action_type);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "Admins can read all activities" on public.activity_logs;
drop policy if exists "Service role full access" on public.activity_logs;

create policy "Admins can read all activities"
  on public.activity_logs for select
  using (public.is_admin());

create policy "Service role full access"
  on public.activity_logs for all
  using (auth.role() = 'service_role');

-- Fix: extend activity_logs CHECK constraint to include attendance action types
alter table public.activity_logs drop constraint if exists activity_logs_action_type_check;
alter table public.activity_logs add constraint activity_logs_action_type_check
  check (action_type in (
    'user_created', 'user_deleted', 'document_generated', 'document_downloaded',
    'settings_updated', 'profile_updated', 'team_created', 'team_deleted',
    'attendance_marked'
  ));

