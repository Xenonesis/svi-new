-- Fix for get_slow_queries for Postgres >= 13 where total_time is total_exec_time
CREATE OR REPLACE FUNCTION get_slow_queries(limit_count integer DEFAULT 10)
RETURNS TABLE (
    query text,
    calls bigint,
    total_time_ms double precision,
    mean_time_ms double precision
)
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.query,
        s.calls,
        s.total_exec_time AS total_time_ms,
        s.mean_exec_time AS mean_time_ms
    FROM pg_stat_statements s
    ORDER BY s.mean_exec_time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
