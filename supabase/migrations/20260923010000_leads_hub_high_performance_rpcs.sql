-- Migration: 20260923010000_leads_hub_high_performance_rpcs.sql
-- Description: Deploy high-performance PostgreSQL RPC functions for Leads Hub and Telecalling Dashboard
-- Eliminates high-latency multi-query loops and 29-chunk 28k-row downloads

-- 1. High-Performance Chat Leads Summary Aggregation
CREATE OR REPLACE FUNCTION public.get_chat_leads_summary_counts()
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'unassigned', COUNT(*) FILTER (WHERE assigned_to IS NULL),
    'hot', COUNT(*) FILTER (WHERE temperature = 'hot'),
    'chatbot', COUNT(*) FILTER (WHERE source = 'chatbot'),
    'site_visits', COUNT(*) FILTER (WHERE source = 'site_visit')
  )
  INTO v_result
  FROM public.chat_leads;

  RETURN v_result;
END;
$$;

-- 2. High-Performance Telecalling Aggregation RPC Function
CREATE OR REPLACE FUNCTION public.get_telecalling_performance(
  p_time_cutoff TIMESTAMPTZ DEFAULT NULL,
  p_advisor_id UUID DEFAULT NULL
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_summary json;
  v_campaigns json;
  v_advisors json;
  v_recent_hot json;
BEGIN
  -- 1. Overall campaign summary
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
    WHERE ((call_duration >= 60 AND dial_status = 'ANSWER') OR pressed_key = '1')
      AND (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
      AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id)
    ORDER BY dial_time DESC
    LIMIT 10
  ) h;

  RETURN json_build_object(
    'summary', v_summary,
    'campaigns', v_campaigns,
    'advisors', v_advisors,
    'recent_hot_calls', v_recent_hot
  );
END;
$$;

-- 3. Grant Permissions to service_role and authenticated users
GRANT EXECUTE ON FUNCTION public.get_chat_leads_summary_counts() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_telecalling_performance(TIMESTAMPTZ, UUID) TO authenticated, service_role;
