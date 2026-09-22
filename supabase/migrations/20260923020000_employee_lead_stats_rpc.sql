-- Migration: 20260923020000_employee_lead_stats_rpc.sql
-- Description: Additive, non-destructive RPC for employee lead stats aggregation

CREATE OR REPLACE FUNCTION public.get_employee_lead_stats(p_employee_ids UUID[])
RETURNS TABLE (
  assigned_to UUID,
  total_leads INT,
  won_leads INT,
  active_leads INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    assigned_to,
    COUNT(*)::INT AS total_leads,
    COUNT(*) FILTER (WHERE lifecycle_status = 'won')::INT AS won_leads,
    COUNT(*) FILTER (WHERE lifecycle_status NOT IN ('won', 'lost'))::INT AS active_leads
  FROM chat_leads
  WHERE assigned_to = ANY(p_employee_ids)
  GROUP BY assigned_to;
$$;

GRANT EXECUTE ON FUNCTION public.get_employee_lead_stats(UUID[]) TO authenticated, service_role;
