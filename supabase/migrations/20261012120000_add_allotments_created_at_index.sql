-- Migration: Add B-tree index on allotments(created_at DESC)
-- Purpose: Accelerate ORDER BY created_at DESC queries recommended by Postgres Index Advisor (reduces query cost by ~77%)

CREATE INDEX IF NOT EXISTS idx_allotments_created_at
  ON public.allotments USING btree (created_at DESC);
