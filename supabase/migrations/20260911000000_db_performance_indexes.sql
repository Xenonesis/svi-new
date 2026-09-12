-- Migration: Performance Composite Indexes for High-Traffic Queries
-- Date: 2026-09-11
-- 100% Non-destructive: Safe to run on live database without resets or locks

-- 1. Chat Leads: Fast filtering and sorting by assigned staff, source, and temperature
CREATE INDEX IF NOT EXISTS idx_chat_leads_assigned_created
  ON public.chat_leads (assigned_to, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_leads_source_created
  ON public.chat_leads (source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_leads_temp_created
  ON public.chat_leads (temperature, created_at DESC);

-- 2. Attendance Records: Fast employee monthly calendar range lookups and status stats
CREATE INDEX IF NOT EXISTS idx_attendance_user_date
  ON public.attendance_records (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_user_status
  ON public.attendance_records (user_id, status);

-- 3. Documents: Fast quotation, allotment, and offer letter table queries
CREATE INDEX IF NOT EXISTS idx_documents_type_created
  ON public.documents (type, created_at DESC);

-- 4. Notifications: Fast notification center and bell pagination
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- 5. Profiles: Instant index-only scans for active workforce directory
CREATE INDEX IF NOT EXISTS idx_profiles_role_active
  ON public.profiles (role, is_active);
