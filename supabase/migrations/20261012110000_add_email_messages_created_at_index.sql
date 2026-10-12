-- Migration: Add B-tree index on email_messages(created_at DESC)
-- Purpose: Accelerate ORDER BY created_at DESC queries recommended by Postgres Index Advisor (reduces query cost by ~81%)

CREATE INDEX IF NOT EXISTS idx_email_messages_created_at
  ON public.email_messages USING btree (created_at DESC);
