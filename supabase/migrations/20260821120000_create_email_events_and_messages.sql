-- Migration: Resend lifecycle webhook ingestion (delivered / opened / clicked / bounced / complained)
--
-- Three tables:
--   1. email_messages   — per-outbound-email aggregate tracking row (upserted by webhook)
--   2. email_events     — immutable audit log of every lifecycle event (deduped via idempotency_key)
--   3. email_suppressions — addresses that must not receive further mail (hard bounce / complaint)

-- ── 1. email_messages: outbound message tracking ────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT UNIQUE,
  subject TEXT,
  from_email TEXT,
  to_emails TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'sent',
  last_event TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  open_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_messages_resend_id ON public.email_messages(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON public.email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_sent_at ON public.email_messages(sent_at DESC);

-- ── 2. email_events: immutable lifecycle audit log ──────────────────────────
CREATE TABLE IF NOT EXISTS public.email_events (
  id BIGSERIAL PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  email_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  ip TEXT,
  user_agent TEXT,
  url TEXT,
  bounce_type TEXT,
  bounce_reason TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_email_id ON public.email_events(email_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events(event_type);

-- ── 3. email_suppressions: bounce / complaint suppression list ──────────────
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,          -- hard_bounce | complained | manual
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON public.email_suppressions(email);

-- ── RLS (mirrors contact groups pattern) ────────────────────────────────────
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

-- Service role: full access (all app reads/writes go through supabaseAdmin)
DROP POLICY IF EXISTS email_messages_service_role_full_access ON public.email_messages;
CREATE POLICY email_messages_service_role_full_access
  ON public.email_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS email_events_service_role_full_access ON public.email_events;
CREATE POLICY email_events_service_role_full_access
  ON public.email_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS email_suppressions_service_role_full_access ON public.email_suppressions;
CREATE POLICY email_suppressions_service_role_full_access
  ON public.email_suppressions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated admins via JWT
DROP POLICY IF EXISTS email_messages_admin_all ON public.email_messages;
CREATE POLICY email_messages_admin_all
  ON public.email_messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS email_events_admin_all ON public.email_events;
CREATE POLICY email_events_admin_all
  ON public.email_events FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS email_suppressions_admin_all ON public.email_suppressions;
CREATE POLICY email_suppressions_admin_all
  ON public.email_suppressions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Deny anon explicitly + revoke table-level privileges (belt and suspenders)
DROP POLICY IF EXISTS email_messages_no_anon ON public.email_messages;
CREATE POLICY email_messages_no_anon
  ON public.email_messages FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS email_events_no_anon ON public.email_events;
CREATE POLICY email_events_no_anon
  ON public.email_events FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS email_suppressions_no_anon ON public.email_suppressions;
CREATE POLICY email_suppressions_no_anon
  ON public.email_suppressions FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

REVOKE ALL ON public.email_messages FROM anon;
REVOKE ALL ON public.email_events FROM anon;
REVOKE ALL ON public.email_suppressions FROM anon;

NOTIFY pgrst, 'reload schema';