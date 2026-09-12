-- ==============================================================================
-- Database Performance Migration: Employee Workspace & Analytics Composite Indexes
-- Purely Additive: Zero Table Alteration, Zero Data Reset, Zero Data Loss
-- ==============================================================================

-- 1. Employee Tasks: Fast Filter by User & Status, and Timeline Ordering
CREATE INDEX IF NOT EXISTS idx_employee_tasks_user_status 
ON employee_tasks (user_id, status);

CREATE INDEX IF NOT EXISTS idx_employee_tasks_user_created 
ON employee_tasks (user_id, created_at DESC);

-- 2. Employee Work Logs: User Daily Work Summary Lookup
CREATE INDEX IF NOT EXISTS idx_employee_work_logs_user_date 
ON employee_work_logs (user_id, date DESC);

-- 3. Site Visits: User Active Assigned Visits
CREATE INDEX IF NOT EXISTS idx_site_visits_assigned_status 
ON whatsapp_site_visit_requests (assigned_to, status);

-- 4. Profiles: User Growth & Registration Timeline Analytics
CREATE INDEX IF NOT EXISTS idx_profiles_created 
ON profiles (created_at DESC);
