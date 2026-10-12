-- Migration: Optimize Realtime Publication and Setup pg_cron History Retention
-- Purpose:
-- 1. Remove non-websocket high-churn tables from supabase_realtime publication
-- 2. Setup automatic 7-day retention and purge for cron.job_run_details

-- ============================================================================
-- 1. REALTIME PUBLICATION SCOPE SANITIZATION
-- ============================================================================
-- Tables that never have client-side websocket subscribers are removed
-- from supabase_realtime. This significantly reduces CDC / WAL replication load.

DO $$
DECLARE
  tbl text;
  unneeded_tables text[] := ARRAY[
    'email_drafts',
    'documents',
    'activity_logs',
    'chat_logs',
    'attendance_sessions',
    'email_attachments',
    'email_deletions',
    'email_stars',
    'ivr_call_records',
    'daily_reports'
  ];
BEGIN
  FOREACH tbl IN ARRAY unneeded_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE %I;', tbl);
      RAISE NOTICE 'Dropped % from supabase_realtime publication', tbl;
    END IF;
  END LOOP;
END $$;

-- Verify core tables needed by frontend realtime are present
DO $$
DECLARE
  tbl text;
  core_tables text[] := ARRAY[
    'notifications',
    'email_inbox',
    'email_messages',
    'registrations'
  ];
BEGIN
  FOREACH tbl IN ARRAY core_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', tbl);
        RAISE NOTICE 'Added % to supabase_realtime publication', tbl;
      EXCEPTION WHEN others THEN
        NULL;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 2. PG_CRON RUN DETAILS RETENTION (PURGE LOGS OLDER THAN 7 DAYS)
-- ============================================================================
-- 2a. Immediate cleanup of stale logs older than 7 days
DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days';

-- 2b. Unschedule existing purge job if present to maintain idempotency
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-old-cron-logs') THEN
    PERFORM cron.unschedule('purge-old-cron-logs');
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- 2c. Schedule daily purge at 03:00 AM UTC
SELECT cron.schedule(
  'purge-old-cron-logs',
  '0 3 * * *',
  $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days'$$
);

-- ============================================================================
-- 3. RESET PG_STAT_STATEMENTS FOR FRESH ACCURATE BENCHMARK
-- ============================================================================
SELECT pg_stat_statements_reset();
