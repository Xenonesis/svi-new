-- ==============================================================================
-- Database Performance Migration: Lead Activities, Registrations & WhatsApp Indexes
-- Purely Additive: Zero Table Alteration, Zero Data Reset, Zero Data Loss
-- ==============================================================================

-- 1. Lead Activities: Accelerate Timeline and Batch Leads Lookups
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_created 
ON lead_activities (lead_id, created_at DESC);

-- 2. Customer Registrations: Composite Filter Indexes
CREATE INDEX IF NOT EXISTS idx_registrations_status_created 
ON registrations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_registrations_project_created 
ON registrations (project, created_at DESC);

-- 3. Customer Registrations: Fast Substring Search via Trigram GIN
CREATE INDEX IF NOT EXISTS idx_registrations_name_trgm 
ON registrations USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_phone_trgm 
ON registrations USING gin (phone gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_subid_trgm 
ON registrations USING gin (submission_id gin_trgm_ops);

-- 4. WhatsApp: Message History & Template Follow-ups Ordering
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conv_created 
ON whatsapp_messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_conv_seq 
ON whatsapp_follow_ups (conversation_id, sequence_number);
