-- ==============================================================================
-- Database Performance Migration: Approvals, Leaves, Analytics & Search Indexes
-- Purely Additive: Zero Table Alteration, Zero Data Reset, Zero Data Loss
-- ==============================================================================

-- 1. Employee Leaves: Fast Status Filtering & User History
CREATE INDEX IF NOT EXISTS idx_employee_leaves_status_created 
ON employee_leaves (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employee_leaves_user_status 
ON employee_leaves (user_id, status);

-- 2. Attendance Regularizations: Approvals Tab & Badges
CREATE INDEX IF NOT EXISTS idx_attendance_regularizations_status_created 
ON attendance_regularizations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_regularizations_user_status 
ON attendance_regularizations (user_id, status);

-- 3. Profiles: Substring Search by Email
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm 
ON profiles USING gin (email gin_trgm_ops);

-- 4. Registrations: 30-day Analytics Index-Only Scan
CREATE INDEX IF NOT EXISTS idx_registrations_created_status 
ON registrations (created_at DESC, status);

-- 5. Lottery Participants: Chronological Draw & List Ordering
CREATE INDEX IF NOT EXISTS idx_lottery_participants_lottery_created 
ON lottery_participants (lottery_id, created_at DESC);
