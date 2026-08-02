-- Phase 1.3: Harden SECURITY DEFINER RPCs
-- These functions run with definer rights (bypass RLS) but were executable by
-- anon/authenticated through the public grant. Lock EXECUTE to service_role only
-- and pin search_path (definer functions must not resolve objects via a caller-
-- controlled search path).

-- get_distinct_registration_filters — called only from /api/admin/registrations/filters
-- (verifyAdmin-gated, via supabaseAdmin.rpc → service_role)
CREATE OR REPLACE FUNCTION public.get_distinct_registration_filters()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT filters FROM registration_filters_cache WHERE id = 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_distinct_registration_filters() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_distinct_registration_filters() TO service_role;

-- get_slow_queries — manual diagnostic over pg_stat_statements
CREATE OR REPLACE FUNCTION public.get_slow_queries(limit_count integer DEFAULT 10)
RETURNS TABLE (
    query text,
    calls bigint,
    total_time_ms double precision,
    mean_time_ms double precision
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.query,
        s.calls,
        s.total_time AS total_time_ms,
        s.mean_time AS mean_time_ms
    FROM pg_stat_statements s
    ORDER BY s.mean_time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.get_slow_queries(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_slow_queries(integer) TO service_role;

-- refresh_registration_filters is dangling: it refreshed mv_registration_filters,
-- superseded by refresh_registration_filters_cache() (20260720180000/20260720220000).
-- Nothing references it (no trigger, no app code) — drop.
DROP FUNCTION IF EXISTS public.refresh_registration_filters();
