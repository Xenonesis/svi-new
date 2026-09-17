-- Migration: Targeted Composite Indexes & Consolidated Summary Counts RPC
-- Date: 2026-09-17
-- Non-destructive: Safe to run on live database without table rebuilds, data resets, or table locks

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Composite & partial indexes for IVR query performance
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ivr_call_records') THEN
    -- Partial composite index for DTMF key filtering + time ordering
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_key_time
      ON public.ivr_call_records (pressed_key, dial_time DESC)
      WHERE pressed_key IS NOT NULL;

    -- Composite index for duration range queries + time ordering
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_duration_dial
      ON public.ivr_call_records (call_duration DESC, dial_time DESC);
  END IF;
END $$;

-- 2. Trigram text search indexes for chat_leads ILIKE searches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_leads') THEN
    CREATE INDEX IF NOT EXISTS idx_chat_leads_phone_trgm
      ON public.chat_leads USING gin (phone gin_trgm_ops);

    CREATE INDEX IF NOT EXISTS idx_chat_leads_name_trgm
      ON public.chat_leads USING gin (name gin_trgm_ops);
  END IF;
END $$;

-- 3. Consolidated Single-Query Summary Counts RPC (Replaces 5 round-trips with 1)
CREATE OR REPLACE FUNCTION public.get_chat_leads_summary_counts()
RETURNS json
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'unassigned', COUNT(*) FILTER (WHERE assigned_to IS NULL),
    'hot', COUNT(*) FILTER (WHERE temperature = 'hot'),
    'chatbot', COUNT(*) FILTER (WHERE source = 'chatbot'),
    'site_visits', COUNT(*) FILTER (WHERE source = 'site_visit')
  )
  FROM public.chat_leads;
$$;
