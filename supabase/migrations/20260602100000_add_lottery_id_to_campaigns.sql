-- ============================================================
-- Add lottery_id FK to email_campaigns for Lottery ↔ Campaign sync
-- ============================================================

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS lottery_id uuid REFERENCES public.lotteries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_lottery_id ON public.email_campaigns(lottery_id);
