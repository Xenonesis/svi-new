-- Performance indexes for admin dashboard queries
-- Run this migration to add missing indexes that improve query performance

-- profiles.role: Used in every verifyAdmin() call and RLS policy is_admin() check
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- profiles.created_at: Used for ordering in analytics and user listing
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- documents.status: Used for filtering completed documents in analytics
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- attendance_records composite: Common filter pattern is team_id + date range
CREATE INDEX IF NOT EXISTS idx_attendance_team_date ON attendance_records(team_id, date);

-- notifications partial index: Only indexes unread notifications (much smaller)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id) WHERE is_read = false;
