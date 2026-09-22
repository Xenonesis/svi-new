-- Migration: 20260923000000_performance_optimizations_v5.sql
-- Description: Targeted composite and partial indexes for high-frequency dashboard queries

-- 1. Properties: Index-only scan for active property dropdowns (ordered by name)
CREATE INDEX IF NOT EXISTS idx_properties_active_name
  ON public.properties (active, name ASC);

-- 2. Email Inbox: Instant unread badge count for active inbox threads
CREATE INDEX IF NOT EXISTS idx_email_inbox_unread_active
  ON public.email_inbox (received_at DESC)
  WHERE is_archived = false AND is_read = false;

-- 3. Lottery Participants: Partial index for winners lookup by lottery
CREATE INDEX IF NOT EXISTS idx_lottery_participants_winner_lottery
  ON public.lottery_participants (lottery_id)
  WHERE is_winner = true;

-- 4. Notifications: Fast retrieval and ordering by user and read state
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read_created
  ON public.notifications (user_id, is_read, created_at DESC);
