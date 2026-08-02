-- Phase 1.3b: Strip anon/authenticated EXECUTE on SECURITY DEFINER RPCs
-- 20260802000001 revoked only FROM PUBLIC, but Supabase platform default
-- privileges grant EXECUTE explicitly to anon/authenticated at creation —
-- those grants survive a PUBLIC-only revoke (verified: anon could still call
-- get_distinct_registration_filters after 20260802000001). Revoke by role.

REVOKE EXECUTE ON FUNCTION public.get_distinct_registration_filters() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_distinct_registration_filters() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_distinct_registration_filters() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_distinct_registration_filters() TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_slow_queries(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_slow_queries(integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_slow_queries(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_slow_queries(integer) TO service_role;
