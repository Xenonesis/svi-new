-- ═══════════════════════════════════════════════════════════
-- Performance Indexes v5 — registrations filter columns
-- ═══════════════════════════════════════════════════════════
-- Adds B-tree indexes on columns queried by
-- get_distinct_registration_filters() RPC that were missing
-- indexes. These accelerate DISTINCT + WHERE NOT NULL scans.
--
-- Migration: 20260720150000_performance_indexes_v5
-- ═══════════════════════════════════════════════════════════

-- ── registrations filter columns ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_registrations_property_type
  ON public.registrations (property_type)
  WHERE property_type IS NOT NULL AND property_type != '';

CREATE INDEX IF NOT EXISTS idx_registrations_property_size
  ON public.registrations (property_size)
  WHERE property_size IS NOT NULL AND property_size != '';

CREATE INDEX IF NOT EXISTS idx_registrations_plot_preference
  ON public.registrations (plot_preference)
  WHERE plot_preference IS NOT NULL AND plot_preference != '';

CREATE INDEX IF NOT EXISTS idx_registrations_payment_plan
  ON public.registrations (payment_plan)
  WHERE payment_plan IS NOT NULL AND payment_plan != '';

CREATE INDEX IF NOT EXISTS idx_registrations_payment_mode
  ON public.registrations (payment_mode)
  WHERE payment_mode IS NOT NULL AND payment_mode != '';
