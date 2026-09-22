-- ==============================================================================
-- Migration: 20260923010000_db_performance_and_security_hardening.sql
-- Description:
--   1. Fix P0 Data Leaks on Views: Revoke public anon access and enable
--      security_invoker on compatibility views (salary_structures, allotment_records,
--      tasks, chat_lead_activities).
--   2. Protect PII in lottery_participants: Revoke table-level SELECT from anon
--      and grant SELECT exclusively on non-sensitive public columns (id, lottery_id,
--      name, ticket_number, is_winner, prize_rank, created_at).
--   3. Enable pg_stat_statements in extensions schema and fix get_slow_queries RPC.
--   4. Add missing Foreign Key indexes to optimize JOINs and cascading deletes.
--   5. Optimize frequently evaluated RLS policies with cached subquery wrapping.
-- ==============================================================================

-- ── 1. Security Hardening on Views (Lock Anon Access & Enforce Invoker RLS) ──

-- 1.1 salary_structures view (Exposes bank accounts, salaries, PAN cards)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'salary_structures') THEN
    REVOKE ALL ON public.salary_structures FROM anon;
    ALTER VIEW public.salary_structures SET (security_invoker = true);
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'salary_structures') THEN
    EXECUTE 'ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Restrict salary_structures to admins" ON public.salary_structures;';
    EXECUTE 'CREATE POLICY "Restrict salary_structures to admins" ON public.salary_structures FOR ALL USING ((SELECT public.is_admin()));';
  END IF;
END $$;

-- 1.2 allotment_records view (Exposes customer allotment contracts and form_data)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'allotment_records') THEN
    REVOKE ALL ON public.allotment_records FROM anon;
    ALTER VIEW public.allotment_records SET (security_invoker = true);
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'allotment_records') THEN
    EXECUTE 'ALTER TABLE public.allotment_records ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Restrict allotment_records to admins" ON public.allotment_records;';
    EXECUTE 'CREATE POLICY "Restrict allotment_records to admins" ON public.allotment_records FOR ALL USING ((SELECT public.is_admin()));';
  END IF;
END $$;

-- 1.3 tasks view (Legacy workforce tasks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'tasks') THEN
    REVOKE ALL ON public.tasks FROM anon;
    ALTER VIEW public.tasks SET (security_invoker = true);
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    EXECUTE 'ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Restrict tasks to admins" ON public.tasks;';
    EXECUTE 'CREATE POLICY "Restrict tasks to admins" ON public.tasks FOR ALL USING ((SELECT public.is_admin()));';
  END IF;
END $$;

-- 1.4 chat_lead_activities view (Legacy telecalling notes)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'chat_lead_activities') THEN
    REVOKE ALL ON public.chat_lead_activities FROM anon;
    ALTER VIEW public.chat_lead_activities SET (security_invoker = true);
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_lead_activities') THEN
    EXECUTE 'ALTER TABLE public.chat_lead_activities ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "Restrict chat_lead_activities to admins" ON public.chat_lead_activities;';
    EXECUTE 'CREATE POLICY "Restrict chat_lead_activities to admins" ON public.chat_lead_activities FOR ALL USING ((SELECT public.is_admin()));';
  END IF;
END $$;

-- ── 2. Protect PII in lottery_participants ──────────────────────────────────
-- Revoke table-wide SELECT from anon, then grant SELECT exclusively on public fields.
-- This ensures phone and email are never disclosed to anonymous callers.
REVOKE ALL ON public.lottery_participants FROM anon;
GRANT SELECT (id, lottery_id, name, ticket_number, is_winner, prize_rank, created_at)
  ON public.lottery_participants TO anon;

-- ── 3. Enable Performance Diagnostics Extension & Fix RPC ───────────────────
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.get_slow_queries(limit_count integer DEFAULT 10)
RETURNS TABLE (
    query text,
    calls bigint,
    total_time_ms double precision,
    mean_time_ms double precision
)
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.query,
        s.calls,
        ROUND(s.total_exec_time::numeric, 2)::double precision AS total_time_ms,
        ROUND(s.mean_exec_time::numeric, 2)::double precision AS mean_time_ms
    FROM extensions.pg_stat_statements s
    ORDER BY s.mean_exec_time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.get_slow_queries(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_slow_queries(integer) TO service_role;

-- ── 4. Add Missing Foreign Key Indexes (schema-foreign-key-indexes.md) ──────

-- Workforce & Attendance
CREATE INDEX IF NOT EXISTS idx_fk_attendance_records_marked_by
  ON public.attendance_records(marked_by);

CREATE INDEX IF NOT EXISTS idx_fk_employee_tasks_assigned_by
  ON public.employee_tasks(assigned_by);

CREATE INDEX IF NOT EXISTS idx_fk_employee_leaves_reviewed_by
  ON public.employee_leaves(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_fk_attendance_regularizations_reviewed_by
  ON public.attendance_regularizations(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_fk_employee_work_logs_attendance_record_id
  ON public.employee_work_logs(attendance_record_id);

CREATE INDEX IF NOT EXISTS idx_fk_geofence_locations_created_by
  ON public.geofence_locations(created_by);

CREATE INDEX IF NOT EXISTS idx_fk_attendance_sessions_admin_id
  ON public.attendance_sessions(admin_id);

-- Customer Portal & Allotments
CREATE INDEX IF NOT EXISTS idx_fk_allotments_created_by
  ON public.allotments(created_by);

CREATE INDEX IF NOT EXISTS idx_fk_payment_schedules_created_by
  ON public.payment_schedules(created_by);

-- Contact Groups
CREATE INDEX IF NOT EXISTS idx_fk_contact_groups_created_by
  ON public.contact_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_fk_contact_group_members_group_id
  ON public.contact_group_members(group_id);

-- Properties & Project Images
CREATE INDEX IF NOT EXISTS idx_fk_project_images_project_id
  ON public.project_images(project_id);

-- WhatsApp CRM & Sales Agent
CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_conv_contact_id
  ON public.whatsapp_conversations(contact_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_conv_lead_id
  ON public.whatsapp_conversations(lead_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_conv_assigned_to
  ON public.whatsapp_conversations(assigned_to);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_conv_project_id
  ON public.whatsapp_conversations(project_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_follow_ups_template_id
  ON public.whatsapp_follow_ups(template_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_follow_ups_sent_message_id
  ON public.whatsapp_follow_ups(sent_message_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_site_visits_conv_id
  ON public.whatsapp_site_visit_requests(conversation_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_site_visits_contact_id
  ON public.whatsapp_site_visit_requests(contact_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_site_visits_lead_id
  ON public.whatsapp_site_visit_requests(lead_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_site_visits_project_id
  ON public.whatsapp_site_visit_requests(project_id);

CREATE INDEX IF NOT EXISTS idx_fk_whatsapp_company_settings_verified_by
  ON public.whatsapp_company_settings(verified_by);

-- ── 5. Optimize Critical RLS Policies (security-rls-performance.md) ─────────
-- Wrap auth.uid() and public.is_admin() inside (SELECT ...) to enable initplan caching

-- Employee Tasks
DROP POLICY IF EXISTS "Employees can view their own tasks" ON public.employee_tasks;
CREATE POLICY "Employees can view their own tasks"
  ON public.employee_tasks FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

DROP POLICY IF EXISTS "Employees can update their own tasks" ON public.employee_tasks;
CREATE POLICY "Employees can update their own tasks"
  ON public.employee_tasks FOR UPDATE
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Employee Work Logs
DROP POLICY IF EXISTS "Employees can view their own work logs" ON public.employee_work_logs;
CREATE POLICY "Employees can view their own work logs"
  ON public.employee_work_logs FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Employee Leaves
DROP POLICY IF EXISTS "Employees can view their own leaves" ON public.employee_leaves;
CREATE POLICY "Employees can view their own leaves"
  ON public.employee_leaves FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Attendance Regularizations
DROP POLICY IF EXISTS "Employees can view their own regularizations" ON public.attendance_regularizations;
CREATE POLICY "Employees can view their own regularizations"
  ON public.attendance_regularizations FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Employee Salary Structures
DROP POLICY IF EXISTS "Employees can view their own salary structure" ON public.employee_salary_structures;
CREATE POLICY "Employees can view their own salary structure"
  ON public.employee_salary_structures FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Customer Allotments
DROP POLICY IF EXISTS "Users can view their own allotments" ON public.allotments;
CREATE POLICY "Users can view their own allotments"
  ON public.allotments FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));

-- Customer Payment Schedules
DROP POLICY IF EXISTS "Users can view their own payment schedules" ON public.payment_schedules;
CREATE POLICY "Users can view their own payment schedules"
  ON public.payment_schedules FOR SELECT
  USING (((SELECT auth.uid()) = user_id) OR ((SELECT public.is_admin())));
