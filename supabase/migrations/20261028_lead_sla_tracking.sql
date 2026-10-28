CREATE TABLE IF NOT EXISTS lead_sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES chat_leads(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  assigned_advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_advisor_name TEXT,
  sla_threshold_minutes INTEGER NOT NULL DEFAULT 15,
  sla_expires_at TIMESTAMPTZ NOT NULL,
  contacted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending_contact' CHECK (status IN ('pending_contact', 'contacted_in_sla', 'breached_escalated')),
  escalated_at TIMESTAMPTZ,
  escalation_target TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_sla_status_expires
ON lead_sla_tracking (status, sla_expires_at)
WHERE status = 'pending_contact';

ALTER TABLE lead_sla_tracking ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lead_sla_tracking' 
    AND policyname = 'Allow authenticated read lead_sla_tracking'
  ) THEN
    CREATE POLICY "Allow authenticated read lead_sla_tracking"
    ON lead_sla_tracking FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;
