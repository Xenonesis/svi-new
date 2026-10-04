-- -----------------------------------------------------------------------------
-- Migration: 20261004170000_crm_lead_interactions_and_composite_indexes.sql
-- Description: Records CRM schema extensions (chat_leads/ivr columns, lead_interactions table)
--              and advisor/time composite index on ivr_call_records.
-- -----------------------------------------------------------------------------

-- 1. Extend chat_leads with pipeline_stage, site_visit, budget, notes
ALTER TABLE public.chat_leads
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS site_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS site_visit_project TEXT,
  ADD COLUMN IF NOT EXISTS budget_range TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_leads_follow_up_at ON public.chat_leads(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_chat_leads_pipeline_stage ON public.chat_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_chat_leads_site_visit_at ON public.chat_leads(site_visit_at);

-- 2. Extend ivr_call_records with pipeline, follow-up, notes
ALTER TABLE public.ivr_call_records
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS site_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_ivr_call_records_follow_up ON public.ivr_call_records(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_stage ON public.ivr_call_records(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent_time ON public.ivr_call_records(assigned_agent_id, dial_time DESC);

-- 3. Create lead_interactions table for full activity timeline
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_phone VARCHAR(20) NOT NULL,
  advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  advisor_name VARCHAR(100),
  type TEXT NOT NULL CHECK (type IN (
    'note',
    'call_logged',
    'follow_up_scheduled',
    'whatsapp_sent',
    'visit_booked',
    'stage_changed',
    'reassigned'
  )),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_phone ON public.lead_interactions(lead_phone);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON public.lead_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_advisor_id ON public.lead_interactions(advisor_id);

ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read lead interactions" ON public.lead_interactions;
CREATE POLICY "Authenticated users can read lead interactions"
  ON public.lead_interactions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert lead interactions" ON public.lead_interactions;
CREATE POLICY "Authenticated users can insert lead interactions"
  ON public.lead_interactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role full access lead interactions" ON public.lead_interactions;
CREATE POLICY "Service role full access lead interactions"
  ON public.lead_interactions FOR ALL
  USING (auth.role() = 'service_role');
