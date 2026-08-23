-- WhatsApp worker scheduler (Vercel Hobby / Free Tier Optimization)
--
-- Vercel Hobby cron jobs are limited to at most once per day (24h).
-- To support automated background sweeps on free tier without Vercel Pro,
-- this migration provisions Supabase pg_cron + pg_net scheduling to optionally
-- call /api/cron/whatsapp periodically.
--
-- Note: Immediate inbound messages are automatically processed via Next.js
-- after() in the webhook handler without relying on any cron job.
--
-- Setup Instructions (Run once in Supabase Dashboard SQL Editor if using pg_cron):
--   select vault.create_secret('https://YOUR-APP-URL.vercel.app', 'svi_site_url');
--   select vault.create_secret('YOUR_CRON_SECRET_VALUE', 'svi_cron_secret');
--
-- The scheduled job safely no-ops if secrets are not configured in vault.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

do $unsched$
begin
  perform cron.unschedule('svi-whatsapp-worker');
exception
  when undefined_object or undefined_function or undefined_table or others then null;
end
$unsched$;

select cron.schedule(
  'svi-whatsapp-worker',
  '*/5 * * * *',
  $job$
  with cfg as (
    select
      (select decrypted_secret from vault.decrypted_secrets where name = 'svi_site_url') as base_url,
      (select decrypted_secret from vault.decrypted_secrets where name = 'svi_cron_secret') as token
  ),
  req as (
    select
      trim(trailing '/' from base_url) || '/api/cron/whatsapp' as url,
      format('{"Authorization":"Bearer %s","Content-Type":"application/json"}', token) as headers
    from cfg
    where coalesce(base_url, '') <> '' and coalesce(token, '') <> ''
  )
  select net.http_post(
    url := req.url,
    headers := req.headers::jsonb,
    body := '{}'::jsonb,
    timeout_msec := 15000
  )
  from req
  $job$
);
