-- ==============================================================================
-- Database Performance Migration: Substring Search & Unread Notifications
-- Purely Additive: Zero Table Alteration, Zero Data Reset, Zero Data Loss
-- ==============================================================================

-- 1. Enable pg_trgm extension for fast ILIKE / substring searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Chat Leads: Substring GIN Trigram Indexes (accelerates search for lead name, phone, email)
CREATE INDEX IF NOT EXISTS idx_chat_leads_name_trgm 
ON chat_leads USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_chat_leads_phone_trgm 
ON chat_leads USING gin (phone gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_chat_leads_email_trgm 
ON chat_leads USING gin (email gin_trgm_ops);

-- 3. Profiles (Employees): Substring GIN Trigram Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
ON profiles USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_phone_trgm 
ON profiles USING gin (phone gin_trgm_ops);

-- 4. Notifications: Partial Indexes for Unread Bell Count & Queries
-- Stored index size is tiny (<5% of table) because it indexes only unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread_created 
ON notifications (created_at DESC) 
WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, created_at DESC) 
WHERE is_read = false;
