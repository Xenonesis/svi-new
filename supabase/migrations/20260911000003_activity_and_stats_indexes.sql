-- ==============================================================================
-- Database Performance Migration: Lead Stats Index-Only Scan & Activity Log Indexes
-- Purely Additive: Zero Table Alteration, Zero Data Reset, Zero Data Loss
-- ==============================================================================

-- 1. Chat Leads: Employee Conversion Pipeline Index-Only Scan
-- Allows PostgreSQL to calculate total, won, and active leads directly from index
CREATE INDEX IF NOT EXISTS idx_chat_leads_assigned_status 
ON chat_leads (assigned_to, lifecycle_status);

-- 2. Activity Logs: Admin Audit History & Filtering
CREATE INDEX IF NOT EXISTS idx_activity_logs_created 
ON activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action 
ON activity_logs (action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_desc_trgm 
ON activity_logs USING gin (description gin_trgm_ops);
