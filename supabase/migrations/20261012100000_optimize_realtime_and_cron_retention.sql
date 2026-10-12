-- Migration: Optimize Realtime Publication and Setup pg_cron History Retention
-- Purpose:
-- 1. Ensure supabase_realtime publication only includes active websocket tables
-- 2. Setup automatic 7-day retention for cron.job_run_details to prevent log table bloat

-- ============================================================================
-- 1. REALTIME PUBLICATION SCOPE SANITIZATION
-- ============================================================================
-- Ensure heavy bulk/batch tables that never use websocket events on client side
-- are removed from supabase_realtime. This reduces replication WAL parsing.
DO $$
BEGIN
  -- Drop heavy tables from realtime publication if they were inadvertently added
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ivr_call_records'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE ivr_call_records;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE documents;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'daily_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE daily_reports;
  END IF;
END $$;

-- Verify core tables needed by frontend realtime are present
DO $$
BEGIN
  -- Add notifications if missing from realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN others THEN
      NULL; -- Ignore if table does not exist or already added
    END;
  END IF;

  -- Add email_inbox if missing from realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'email_inbox'
  ) THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE email_inbox;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  -- Add email_messages if missing from realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'email_messages'
  ) THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE email_messages;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  -- Add registrations if missing from realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registrations'
  ) THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- 2. PG_CRON RUN DETAILS RETENTION (PURGE LOGS OLDER THAN 7 DAYS)
-- ============================================================================
-- Unschedule existing purge job if present to maintain idempotency
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-old-cron-logs') THEN
    PERFORM cron.unschedule('purge-old-cron-logs');
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Schedule daily midnight purge for cron.job_run_details
SELECT cron.schedule(
  'purge-old-cron-logs',
  '0 3 * * *', -- Everyday at 03:00 AM UTC
  $$DELETE FROM cron.job_run_details WHERE end_time < now() - interval '7 days'$$
);
