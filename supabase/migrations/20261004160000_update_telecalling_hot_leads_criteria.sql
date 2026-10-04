-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 20261004160000_update_telecalling_hot_leads_criteria.sql
-- Description: Refine hot leads formula to require dial_status = 'ANSWER'
--              ((call_duration >= 60 OR pressed_key = '1') AND dial_status = 'ANSWER')
-- ─────────────────────────────────────────────────────────────────────────────

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
  v_result json;
BEGIN
  WITH filtered_calls AS (
    SELECT
      customer_phone,
      assigned_agent_id,
      COALESCE(agent_name, 'Unassigned') AS agent_name,
      COALESCE(campaign_name, 'General Campaign') AS campaign_name,
      dial_status,
      COALESCE(call_duration, 0) AS call_duration,
      pressed_key,
      dial_time
    FROM public.ivr_call_records
    WHERE (p_time_cutoff IS NULL OR dial_time >= p_time_cutoff)
      AND (p_advisor_id IS NULL OR assigned_agent_id = p_advisor_id)
  ),
  summary_agg AS (
    SELECT
      COUNT(*) AS total_calls,
      COUNT(*) FILTER (WHERE dial_status = 'ANSWER') AS answered_calls,
      COUNT(*) FILTER (WHERE dial_status = 'NOANSWER') AS missed_calls,
      COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0) AS total_talk_time_sec,
      CASE
        WHEN COUNT(*) FILTER (WHERE dial_status = 'ANSWER') > 0
        THEN ROUND(COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0)::numeric / COUNT(*) FILTER (WHERE dial_status = 'ANSWER'))
        ELSE 0
      END AS avg_talk_time_sec,
      COUNT(*) FILTER (WHERE dial_status = 'ANSWER' AND (call_duration >= 60 OR pressed_key = '1')) AS hot_leads,
      COUNT(*) FILTER (WHERE pressed_key = '1') AS key1_count
    FROM filtered_calls
  ),
  campaign_agg AS (
    SELECT json_agg(c ORDER BY c.total_calls DESC) AS campaigns
    FROM (
      SELECT
        campaign_name AS name,
        COUNT(*) AS total_calls,
        COUNT(*) FILTER (WHERE dial_status = 'ANSWER') AS answered_calls,
        COUNT(*) FILTER (WHERE dial_status = 'NOANSWER') AS missed_calls,
        COUNT(*) FILTER (WHERE dial_status = 'ANSWER' AND (call_duration >= 60 OR pressed_key = '1')) AS hot_leads,
        CASE
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE dial_status = 'ANSWER')::numeric / COUNT(*)) * 100)
          ELSE 0
        END AS answer_rate
      FROM filtered_calls
      GROUP BY campaign_name
    ) c
  ),
  advisor_agg AS (
    SELECT json_agg(a ORDER BY a.answered_calls DESC, a.hot_leads DESC) AS advisors
    FROM (
      SELECT
        assigned_agent_id AS advisor_id,
        agent_name,
        COUNT(*) AS total_calls,
        COUNT(*) FILTER (WHERE dial_status = 'ANSWER') AS answered_calls,
        COUNT(*) FILTER (WHERE dial_status = 'NOANSWER') AS missed_calls,
        COALESCE(SUM(call_duration) FILTER (WHERE dial_status = 'ANSWER'), 0) AS total_talk_time_sec,
        COUNT(*) FILTER (WHERE dial_status = 'ANSWER' AND (call_duration >= 60 OR pressed_key = '1')) AS hot_leads,
        COUNT(*) FILTER (WHERE pressed_key = '1') AS key1_count
      FROM filtered_calls
      GROUP BY assigned_agent_id, agent_name
    ) a
  ),
  recent_hot_calls AS (
    SELECT json_agg(rh) AS recent_hot
    FROM (
      SELECT
        customer_phone,
        agent_name,
        call_duration,
        dial_status,
        pressed_key,
        dial_time
      FROM filtered_calls
      WHERE dial_status = 'ANSWER' AND (call_duration >= 60 OR pressed_key = '1')
      ORDER BY dial_time DESC
      LIMIT 10
    ) rh
  )
  SELECT json_build_object(
    'summary', (SELECT row_to_json(s.*) FROM summary_agg s),
    'campaigns', COALESCE((SELECT campaigns FROM campaign_agg), '[]'::json),
    'advisors', COALESCE((SELECT advisors FROM advisor_agg), '[]'::json),
    'recent_hot_calls', COALESCE((SELECT recent_hot FROM recent_hot_calls), '[]'::json)
  )
  INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_telecalling_performance(TIMESTAMPTZ, UUID) TO authenticated, service_role;
