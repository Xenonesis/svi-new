-- Distributed rate limiting for API routes (Vercel serverless-safe).
-- Counters live in Postgres so limits hold across all function instances;
-- the previous in-memory Map reset per isolate and never limited anything in prod.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;
-- No policies: only service_role (bypasses RLS) can read/write.

comment on table public.rate_limits is 'Sliding-window rate limit counters, purged by /api/cron/cleanup-registrations';

-- Atomic check-and-increment. Returns {allowed, retry_after}.
create or replace function public.increment_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max_count integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_reset timestamptz;
  v_count integer;
begin
  insert into rate_limits (key, count, reset_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count = case
          when rate_limits.reset_at <= v_now then 1
          else rate_limits.count + 1
        end,
        reset_at = case
          when rate_limits.reset_at <= v_now then v_now + make_interval(secs => p_window_seconds)
          else rate_limits.reset_at
        end
  returning count, reset_at into v_count, v_reset;

  if v_count > p_max_count then
    return jsonb_build_object(
      'allowed', false,
      'retry_after', greatest(1, ceil(extract(epoch from (v_reset - v_now)))::int)
    );
  end if;

  return jsonb_build_object('allowed', true, 'retry_after', 0);
end;
$$;

-- Lock down execution to service role only (matches 20260802000002 pattern).
revoke execute on function public.increment_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.increment_rate_limit(text, integer, integer) to service_role;
