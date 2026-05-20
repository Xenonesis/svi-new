-- Attendance Management Tables
-- Idempotent: uses IF NOT EXISTS and IF EXISTS throughout

-- 1. Teams Table
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at
  before update on public.teams
  for each row execute procedure public.handle_updated_at();

alter table public.teams enable row level security;

drop policy if exists "Admins can read all teams" on public.teams;
drop policy if exists "Service role full access" on public.teams;

create policy "Admins can read all teams"
  on public.teams for select using (public.is_admin());

create policy "Service role full access"
  on public.teams for all using (auth.role() = 'service_role');

-- 2. Team Members Table
create table if not exists public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_team_members_user_id on public.team_members(user_id);

alter table public.team_members enable row level security;

drop policy if exists "Admins can read all team_members" on public.team_members;
drop policy if exists "Service role full access" on public.team_members;

create policy "Admins can read all team_members"
  on public.team_members for select using (public.is_admin());

create policy "Service role full access"
  on public.team_members for all using (auth.role() = 'service_role');

-- 3. Attendance Records Table
create table if not exists public.attendance_records (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'half_day', 'leave')),
  notes text,
  marked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(team_id, user_id, date)
);

create index if not exists idx_attendance_team_id on public.attendance_records(team_id);
create index if not exists idx_attendance_user_id on public.attendance_records(user_id);
create index if not exists idx_attendance_date on public.attendance_records(date);

drop trigger if exists attendance_updated_at on public.attendance_records;
create trigger attendance_updated_at
  before update on public.attendance_records
  for each row execute procedure public.handle_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists "Admins can read all attendance" on public.attendance_records;
drop policy if exists "Service role full access" on public.attendance_records;

create policy "Admins can read all attendance"
  on public.attendance_records for select using (public.is_admin());

create policy "Service role full access"
  on public.attendance_records for all using (auth.role() = 'service_role');
