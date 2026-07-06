-- ============================================================
-- SVI Infra — Performance Indexes v2
-- Run this in: Supabase Dashboard > SQL Editor
-- NOTE: CONCURRENTLY removed — required for transaction block
-- ============================================================

-- Step 1: Enable trigram extension (for fast ILIKE search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── profiles indexes ──────────────────────────────────────────

-- Role index (used in verifyAdmin + is_admin RLS check)
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role);

-- created_at index (ordering in analytics, user listing)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON profiles(created_at DESC);

-- Trigram indexes for ILIKE search on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_trgm
  ON profiles USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm
  ON profiles USING GIN (email gin_trgm_ops);

-- ── registrations indexes ─────────────────────────────────────

-- Trigram indexes for ILIKE search on registrations
CREATE INDEX IF NOT EXISTS idx_registrations_name_trgm
  ON registrations USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_email_trgm
  ON registrations USING GIN (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_submission_id_trgm
  ON registrations USING GIN (submission_id gin_trgm_ops);

-- Filter indexes (used in .eq() filter calls)
CREATE INDEX IF NOT EXISTS idx_registrations_status
  ON registrations(status);

CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON registrations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_registrations_project
  ON registrations(project);

CREATE INDEX IF NOT EXISTS idx_registrations_advisor
  ON registrations(advisor_name);

-- Composite index for status + date filter (most common pattern)
CREATE INDEX IF NOT EXISTS idx_registrations_status_date
  ON registrations(status, created_at DESC);

-- ── documents indexes ─────────────────────────────────────────

-- Status filter (used in analytics count queries)
CREATE INDEX IF NOT EXISTS idx_documents_status
  ON documents(status);

-- ── attendance indexes ────────────────────────────────────────

-- Composite: team_id + date (most common attendance filter)
CREATE INDEX IF NOT EXISTS idx_attendance_team_date
  ON attendance_records(team_id, date);

-- ── notifications indexes ─────────────────────────────────────

-- Partial index: only unread notifications (much smaller, faster)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE is_read = false;
