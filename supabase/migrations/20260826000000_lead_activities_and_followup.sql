-- Migration: Lead Activities, Follow-up Tracking, and Employee Ownership
-- Date: 2026-08-26
-- Idempotent: safe to run multiple times

-- 1. Enhance chat_leads with follow_up_at, notes, and lead_created_by
ALTER TABLE public.chat_leads
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS lead_created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_leads_follow_up_at ON public.chat_leads(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_chat_leads_lead_created_by ON public.chat_leads(lead_created_by);
CREATE INDEX IF NOT EXISTS idx_chat_leads_assigned_to ON public.chat_leads(assigned_to);

-- 2. Create lead_activities table for chronological audit trail of all updates
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.chat_leads(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_name TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'lead_created',
    'status_change',
    'note_added',
    'call_logged',
    'followup_scheduled',
    'temperature_change'
  )),
  title TEXT NOT NULL,
  notes TEXT,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_employee_id ON public.lead_activities(employee_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read lead activities" ON public.lead_activities;
CREATE POLICY "Authenticated users can read lead activities"
  ON public.lead_activities FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert lead activities" ON public.lead_activities;
CREATE POLICY "Authenticated users can insert lead activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role full access lead activities" ON public.lead_activities;
CREATE POLICY "Service role full access lead activities"
  ON public.lead_activities FOR ALL
  USING (auth.role() = 'service_role');
