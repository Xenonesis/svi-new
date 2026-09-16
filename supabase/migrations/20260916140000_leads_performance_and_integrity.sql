-- Migration: Leads Performance Optimization, Unique Constraints, and Telecalling RPC
-- Date: 2026-09-16
-- 100% Non-destructive: Safe to run on live database without table rebuilds or locks

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Deduplicate any existing (phone, source) pairs on chat_leads and enforce UNIQUE index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_leads') THEN
    DELETE FROM public.chat_leads a
    USING public.chat_leads b
    WHERE a.created_at < b.created_at
      AND a.phone = b.phone
      AND a.source = b.source;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_leads_phone_source_unique
      ON public.chat_leads (phone, source);

    CREATE INDEX IF NOT EXISTS idx_chat_leads_status_created
      ON public.chat_leads (lifecycle_status, created_at DESC);
  END IF;
END $$;

-- 2. Performance Composite & Trigram Indexes for ivr_call_records
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ivr_call_records') THEN
    -- Fast advisor filtering + descending time sorting
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent_dial_time
      ON public.ivr_call_records (assigned_agent_id, dial_time DESC);

    -- Fast dial status filtering + descending time sorting
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_status_dial_time
      ON public.ivr_call_records (dial_status, dial_time DESC);

    -- Fast time-range filtering + status lookups for telemetry
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_time_status
      ON public.ivr_call_records (dial_time DESC, dial_status);

    -- Instant substring search on customer phone and advisor name
    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_phone_trgm
      ON public.ivr_call_records USING gin (customer_phone gin_trgm_ops);

    CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent_name_trgm
      ON public.ivr_call_records USING gin (agent_name gin_trgm_ops);
  END IF;
END $$;

-- 3. Lead Interactions Fast Lookup Index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_interactions') THEN
    CREATE INDEX IF NOT EXISTS idx_lead_interactions_phone_created
      ON public.lead_interactions (lead_phone, created_at DESC);
  END IF;
END $$;

-- 4. High-Performance Telecalling Aggregation RPC Function
-- Replaces in-memory 15,000 row download with microsecond PostgreSQL aggregation
CREATE OR REPLACE FUNCTION public.get_telecalling_performance(
  p_time_cutoff TIMESTAMPTZ DEFAULT NULL,
  p_advisor_id UUID DEFAULT NULL
)
RETURNS json
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_summary json;
  v_campaigns json;
  v_advisors json;
  v_recent_hot json;
BEGIN
  -- 1. Calculate overall summary
  SELECT json_build_object(
    'total_calls', COUNT(*),
    'answered_calls', COUNT(*) FILTER (WHERE dial_status = 'ANSWER'),
    'missed_calls', COUNT(*) FILTER (WHERE dial_status = 'NOANSWER'),
    'total_talk_time_sec', COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0),
    'avg_talk_time_sec', CASE
      WHEN COUNT(*) FILTER (WHERE dial_status = 'ANSWER') > 0
      THEN ROUND(COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0)::numeric / COUNT(*) FILTER (WHERE dial_status = 'ANSWER'))
      ELSE 0
    END,
    'hot_leads', COUNT(*) FILTER (WHERE (call_duration >= 60 AND dial_status = 'ANSWER') OR pressed_key = '1'),
    'key1_count', COUNT(*) FILTER (WHERE pressed_key = '1')
  )
  INTO v_summary
  FROM public.ivr_call_records
  WHERE (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
    AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id);

  -- 2. Campaign breakdown
  SELECT COALESCE(json_agg(c), '[]'::json)
  INTO v_campaigns
  FROM (
    SELECT
      COALESCE(campaign_name, 'General Campaign') AS name,
      COUNT(*) AS total_calls,
      COUNT(*) FILTER (WHERE dial_status = 'ANSWER') AS answered_calls,
      COUNT(*) FILTER (WHERE dial_status = 'NOANSWER') AS missed_calls,
      COUNT(*) FILTER (WHERE (call_duration >= 60 AND dial_status = 'ANSWER') OR pressed_key = '1') AS hot_leads,
      CASE
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE dial_status = 'ANSWER')::numeric / COUNT(*)) * 100)
        ELSE 0
      END AS answer_rate
    FROM public.ivr_call_records
    WHERE (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
      AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id)
    GROUP BY COALESCE(campaign_name, 'General Campaign')
    ORDER BY total_calls DESC
  ) c;

  -- 3. Advisor breakdown
  SELECT COALESCE(json_agg(a), '[]'::json)
  INTO v_advisors
  FROM (
    SELECT
      assigned_agent_id AS advisor_id,
      COALESCE(agent_name, 'Unassigned') AS agent_name,
      COUNT(*) AS total_calls,
      COUNT(*) FILTER (WHERE dial_status = 'ANSWER') AS answered_calls,
      COUNT(*) FILTER (WHERE dial_status = 'NOANSWER') AS missed_calls,
      COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0) AS total_talk_time_sec,
      COUNT(*) FILTER (WHERE (call_duration >= 60 AND dial_status = 'ANSWER') OR pressed_key = '1') AS hot_leads,
      COUNT(*) FILTER (WHERE pressed_key = '1') AS key1_count
    FROM public.ivr_call_records
    WHERE (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
      AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id)
    GROUP BY assigned_agent_id, COALESCE(agent_name, 'Unassigned')
    ORDER BY answered_calls DESC, hot_leads DESC
  ) a;

  -- 4. Recent Hot Calls (Last 10)
  SELECT COALESCE(json_agg(h), '[]'::json)
  INTO v_recent_hot
  FROM (
    SELECT
      customer_phone,
      COALESCE(agent_name, 'Advisor') AS agent_name,
      call_duration,
      dial_status,
      pressed_key,
      dial_time
    FROM public.ivr_call_records
    WHERE (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
      AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id)
      AND ((call_duration >= 60 AND dial_status = 'ANSWER') OR pressed_key = '1')
    ORDER BY dial_time DESC
    LIMIT 10
  ) h;

  RETURN json_build_object(
    'summary', COALESCE(v_summary, '{}'::json),
    'campaigns', v_campaigns,
    'advisors', v_advisors,
    'recent_hot_calls', v_recent_hot
  );
END;
$$;
