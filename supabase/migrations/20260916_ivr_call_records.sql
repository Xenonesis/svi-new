-- Migration: Create ivr_call_records table for granular telephony logs
CREATE TABLE IF NOT EXISTS public.ivr_call_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_phone VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    agent_phone VARCHAR(20),
    assigned_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dial_time TIMESTAMPTZ NOT NULL,
    customer_ans_time TIMESTAMPTZ,
    customer_hang_time TIMESTAMPTZ,
    call_duration INTEGER NOT NULL DEFAULT 0,
    dial_status VARCHAR(50) NOT NULL DEFAULT 'NOANSWER',
    pressed_key VARCHAR(10),
    campaign_name VARCHAR(150) NOT NULL DEFAULT 'General Campaign',
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivr_call_records_phone ON public.ivr_call_records(customer_phone);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_agent ON public.ivr_call_records(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_dial_time ON public.ivr_call_records(dial_time DESC);
CREATE INDEX IF NOT EXISTS idx_ivr_call_records_status_duration ON public.ivr_call_records(dial_status, call_duration DESC);
