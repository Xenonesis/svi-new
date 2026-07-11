-- ============================================================
-- Performance Indexes v4 & Monitoring Setup (Phase 4)
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Enable Database Monitoring Extension (Phase 4 requirement)
-- pg_stat_statements tracks execution statistics of all SQL statements executed by the server
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Add indexes for tables created or missed in v1-v3

-- Properties table: frequently filtered by active = true for public dropdowns
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(active);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);

-- Chat Leads table (from 20260609000001)
-- Only index created_at (already indexed in original, skipping to avoid duplication)

-- Careers table (from 20260706000000)
-- Frequently queried by active status
CREATE INDEX IF NOT EXISTS idx_careers_is_active ON public.careers(is_active);

-- 3. Helper function to find slow queries (run manually when needed)
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
        s.total_time AS total_time_ms,
        s.mean_time AS mean_time_ms
    FROM pg_stat_statements s
    ORDER BY s.mean_time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
