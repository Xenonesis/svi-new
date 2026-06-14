-- ============================================================
-- Performance Indexes v2 — Add missing indexes for slow queries
-- Run this in: Supabase Dashboard > SQL Editor
-- Safe: CREATE INDEX IF NOT EXISTS — never drops existing
-- ============================================================

-- 1. pg_trgm extension for fast ILIKE / fuzzy text search
--    Used by registrations search (submission_id, name, email, phone, etc.)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Registration text search trigram index
--    Speeds up: .or(`submission_id.ilike.%q%,name.ilike.%q%...`)
CREATE INDEX IF NOT EXISTS idx_registrations_search_name_trgm
  ON registrations USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_email_trgm
  ON registrations USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_phone_trgm
  ON registrations USING gin (phone gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_submission_id_trgm
  ON registrations USING gin (submission_id gin_trgm_ops);

-- 3. Registration composite index for common filter patterns
--    Sort + filter on project + status is common
CREATE INDEX IF NOT EXISTS idx_registrations_project_status
  ON registrations(project, status);

CREATE INDEX IF NOT EXISTS idx_registrations_created_at_status
  ON registrations(created_at DESC, status);

-- 4. Notifications composite index (allows querying both read & unread per user)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read
  ON notifications(user_id, is_read);

-- 5. Activity logs composite index for faster timeline queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created
  ON activity_logs(user_id, created_at DESC);

-- 6. Email inbox composite index for faster listing
CREATE INDEX IF NOT EXISTS idx_email_inbox_admin_received
  ON email_inbox(admin_id, received_at DESC);

-- 7. Team members composite index (used by getMemberCounts pattern)
CREATE INDEX IF NOT EXISTS idx_team_members_team_user
  ON team_members(team_id, user_id);
