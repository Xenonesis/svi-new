-- Forms backend: contact_submissions, registrations, grievances tables
-- Idempotent: uses IF NOT EXISTS and IF EXISTS throughout

-- 1. Contact Submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "service_role_full_access_contact" on public.contact_submissions;
create policy "service_role_full_access_contact"
  on public.contact_submissions
  for all
  using (true)
  with check (true);

drop policy if exists "admin_read_contact" on public.contact_submissions;
create policy "admin_read_contact"
  on public.contact_submissions
  for select
  using (public.is_admin());

create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);

-- 2. Registrations
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  property_interest text not null,
  preferred_date date,
  message text,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

drop policy if exists "service_role_full_access_registrations" on public.registrations;
create policy "service_role_full_access_registrations"
  on public.registrations
  for all
  using (true)
  with check (true);

drop policy if exists "admin_read_registrations" on public.registrations;
create policy "admin_read_registrations"
  on public.registrations
  for select
  using (public.is_admin());

create index if not exists idx_registrations_created_at
  on public.registrations (created_at desc);

-- 3. Grievances
create table if not exists public.grievances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  ticket_id text not null unique,
  category text not null,
  subject text not null,
  description text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.grievances enable row level security;

drop policy if exists "service_role_full_access_grievances" on public.grievances;
create policy "service_role_full_access_grievances"
  on public.grievances
  for all
  using (true)
  with check (true);

drop policy if exists "admin_read_grievances" on public.grievances;
create policy "admin_read_grievances"
  on public.grievances
  for select
  using (public.is_admin());

create index if not exists idx_grievances_created_at
  on public.grievances (created_at desc);

create index if not exists idx_grievances_ticket_id
  on public.grievances (ticket_id);
