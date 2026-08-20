-- WhatsApp AI sales-agent MVP. Server-side service-role access only.
-- Existing chatbot tables remain compatible; all changes are additive.

alter table public.chat_leads
  alter column phone drop not null,
  add column if not exists normalized_phone text,
  add column if not exists lifecycle_status text not null default 'new',
  add column if not exists qualification_status text not null default 'unqualified',
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null,
  add column if not exists consent_status text not null default 'unknown',
  add column if not exists temperature text not null default 'cold',
  add column if not exists summary text,
  add column if not exists duplicate_of uuid references public.chat_leads(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.chat_leads drop constraint if exists chat_leads_lifecycle_status_check;
alter table public.chat_leads add constraint chat_leads_lifecycle_status_check
  check (lifecycle_status in ('new', 'qualified', 'contacted', 'visit_requested', 'won', 'lost', 'duplicate'));
alter table public.chat_leads drop constraint if exists chat_leads_qualification_status_check;
alter table public.chat_leads add constraint chat_leads_qualification_status_check
  check (qualification_status in ('unqualified', 'qualifying', 'qualified', 'disqualified'));
alter table public.chat_leads drop constraint if exists chat_leads_consent_status_check;
alter table public.chat_leads add constraint chat_leads_consent_status_check
  check (consent_status in ('unknown', 'opted_in', 'opted_out'));
alter table public.chat_leads drop constraint if exists chat_leads_temperature_check;
alter table public.chat_leads add constraint chat_leads_temperature_check
  check (temperature in ('cold', 'warm', 'hot'));

-- Retain duplicates but give only the newest lead for each Indian number a
-- canonical E.164 value so subsequent upserts are deterministic.
with normalized as (
  select id,
    case when regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') ~ '^(91)?[6-9][0-9]{9}$'
      then '+91' || right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) end as e164,
    row_number() over (
      partition by right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10)
      order by created_at desc nulls last, id desc
    ) as phone_rank,
    first_value(id) over (
      partition by right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10)
      order by created_at desc nulls last, id desc
    ) as canonical_id
  from public.chat_leads
)
update public.chat_leads lead
set normalized_phone = case when normalized.phone_rank = 1 then normalized.e164 end,
    duplicate_of = case when normalized.phone_rank > 1 and normalized.e164 is not null then normalized.canonical_id else lead.duplicate_of end,
    lifecycle_status = case when normalized.phone_rank > 1 and normalized.e164 is not null then 'duplicate' else lead.lifecycle_status end
from normalized
where lead.id = normalized.id;

create unique index if not exists chat_leads_normalized_phone_key on public.chat_leads(normalized_phone);
create index if not exists chat_leads_lifecycle_status_idx on public.chat_leads(lifecycle_status, created_at desc);

create table if not exists public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  display_name text,
  provider_profile_name text,
  consent_status text not null default 'unknown' check (consent_status in ('unknown', 'opted_in', 'opted_out')),
  consent_source text,
  consent_recorded_at timestamptz,
  opted_out_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references public.whatsapp_contacts(id) on delete cascade,
  lead_id uuid references public.chat_leads(id) on delete set null,
  mode text not null default 'ai' check (mode in ('ai', 'human', 'paused')),
  status text not null default 'open' check (status in ('open', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  project_id uuid references public.properties(id) on delete set null,
  service_window_expires_at timestamptz,
  ai_disclosed_at timestamptz,
  summary text,
  qualification jsonb not null default '{}'::jsonb,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  provider_message_id text unique,
  dedupe_key text unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_type text not null check (sender_type in ('customer', 'ai', 'admin', 'system')),
  message_type text not null default 'text' check (message_type in ('text', 'template', 'image', 'audio', 'video', 'document', 'location', 'contacts', 'reaction', 'unknown')),
  body text,
  template_name text,
  template_language text,
  status text not null default 'received' check (status in ('received', 'queued', 'accepted', 'sent', 'delivered', 'read', 'failed')),
  provider_error_code text,
  provider_error_message text,
  raw_payload jsonb,
  provider_timestamp timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null unique,
  job_type text not null check (job_type in ('process_inbound', 'recover_message')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 5 check (max_attempts between 1 and 10),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  language text not null default 'en_US',
  category text,
  provider_status text not null default 'pending' check (provider_status in ('pending', 'approved', 'rejected', 'paused', 'disabled')),
  active boolean not null default false,
  body_preview text,
  parameter_count integer not null default 0 check (parameter_count >= 0),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, language)
);

create table if not exists public.whatsapp_follow_ups (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  template_id uuid not null references public.whatsapp_templates(id) on delete restrict,
  sequence_number integer not null check (sequence_number between 1 and 2),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'cancelled', 'skipped', 'failed')),
  reason text,
  dedupe_key text not null unique,
  attempts integer not null default 0 check (attempts >= 0),
  locked_at timestamptz,
  locked_by text,
  sent_message_id uuid references public.whatsapp_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conversation_id, sequence_number)
);

create table if not exists public.whatsapp_site_visit_requests (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  contact_id uuid not null references public.whatsapp_contacts(id) on delete cascade,
  lead_id uuid references public.chat_leads(id) on delete set null,
  project_id uuid references public.properties(id) on delete set null,
  requested_date date,
  requested_time time,
  customer_timezone text not null default 'Asia/Kolkata',
  notes text,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  assigned_to uuid references public.profiles(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only admin-verified values from this allowlist can be exposed by the agent.
create table if not exists public.whatsapp_company_settings (
  key text primary key check (key in ('company_name', 'phone', 'email', 'office_address', 'gst', 'rera', 'privacy_url')),
  value text not null,
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_verified or verified_at is not null)
);

create index if not exists whatsapp_conversations_last_message_idx on public.whatsapp_conversations(last_message_at desc nulls last);
create index if not exists whatsapp_messages_conversation_idx on public.whatsapp_messages(conversation_id, created_at desc);
create index if not exists whatsapp_messages_status_idx on public.whatsapp_messages(status, created_at desc) where direction = 'outbound';
create index if not exists whatsapp_jobs_claim_idx on public.whatsapp_processing_jobs(status, available_at, created_at) where status in ('pending', 'processing');
create index if not exists whatsapp_followups_claim_idx on public.whatsapp_follow_ups(status, scheduled_for) where status in ('pending', 'processing');
create index if not exists whatsapp_visits_status_idx on public.whatsapp_site_visit_requests(status, created_at desc);

create or replace function public.whatsapp_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'chat_leads', 'whatsapp_contacts', 'whatsapp_conversations', 'whatsapp_messages',
    'whatsapp_processing_jobs', 'whatsapp_templates', 'whatsapp_follow_ups',
    'whatsapp_site_visit_requests', 'whatsapp_company_settings'
  ] loop
    execute format('drop trigger if exists whatsapp_updated_at on public.%I', table_name);
    execute format('create trigger whatsapp_updated_at before update on public.%I for each row execute function public.whatsapp_set_updated_at()', table_name);
  end loop;
end;
$$;

-- Atomic SKIP LOCKED claims prevent concurrent cron runs from processing the
-- same job or follow-up twice.
create or replace function public.claim_whatsapp_jobs(
  p_limit integer default 10,
  p_worker text default 'cron',
  p_lock_seconds integer default 120
)
returns setof public.whatsapp_processing_jobs
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  with candidates as (
    select id from public.whatsapp_processing_jobs
    where ((status = 'pending' and available_at <= now())
      or (status = 'processing' and locked_at < now() - make_interval(secs => p_lock_seconds)))
    order by available_at, created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  )
  update public.whatsapp_processing_jobs jobs
  set status = 'processing', attempts = jobs.attempts + 1, locked_at = now(),
      locked_by = p_worker, updated_at = now()
  from candidates
  where jobs.id = candidates.id
  returning jobs.*;
end;
$$;

create or replace function public.claim_whatsapp_followups(
  p_limit integer default 10,
  p_worker text default 'cron',
  p_lock_seconds integer default 120
)
returns setof public.whatsapp_follow_ups
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  with candidates as (
    select id from public.whatsapp_follow_ups
    where ((status = 'pending' and scheduled_for <= now())
      or (status = 'processing' and locked_at < now() - make_interval(secs => p_lock_seconds)))
    order by scheduled_for, created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  )
  update public.whatsapp_follow_ups follow_ups
  set status = 'processing', attempts = follow_ups.attempts + 1, locked_at = now(),
      locked_by = p_worker, updated_at = now()
  from candidates
  where follow_ups.id = candidates.id
  returning follow_ups.*;
end;
$$;

alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.whatsapp_processing_jobs enable row level security;
alter table public.whatsapp_templates enable row level security;
alter table public.whatsapp_follow_ups enable row level security;
alter table public.whatsapp_site_visit_requests enable row level security;
alter table public.whatsapp_company_settings enable row level security;

-- The browser never queries these tables directly. Admin access goes through
-- authenticated API routes, and webhook/cron work uses the server-only key.
revoke all on table public.whatsapp_contacts, public.whatsapp_conversations,
  public.whatsapp_messages, public.whatsapp_processing_jobs,
  public.whatsapp_templates, public.whatsapp_follow_ups,
  public.whatsapp_site_visit_requests, public.whatsapp_company_settings
  from anon, authenticated;
grant all on table public.whatsapp_contacts, public.whatsapp_conversations,
  public.whatsapp_messages, public.whatsapp_processing_jobs,
  public.whatsapp_templates, public.whatsapp_follow_ups,
  public.whatsapp_site_visit_requests, public.whatsapp_company_settings
  to service_role;

revoke all on function public.claim_whatsapp_jobs(integer, text, integer) from public, anon, authenticated;
revoke all on function public.claim_whatsapp_followups(integer, text, integer) from public, anon, authenticated;
grant execute on function public.claim_whatsapp_jobs(integer, text, integer) to service_role;
grant execute on function public.claim_whatsapp_followups(integer, text, integer) to service_role;

notify pgrst, 'reload schema';
