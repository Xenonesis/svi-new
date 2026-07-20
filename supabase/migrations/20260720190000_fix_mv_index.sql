-- ═══════════════════════════════════════════════════════════
-- Fix — materialized view unique index
-- ═══════════════════════════════════════════════════════════
-- Recreate the MV with an integer id column (required for
-- CONCURRENTLY refresh unique index on json columns).
-- ═══════════════════════════════════════════════════════════

DROP MATERIALIZED VIEW IF EXISTS mv_registration_filters;

CREATE MATERIALIZED VIEW mv_registration_filters AS
SELECT
  1 AS id,
  json_build_object(
    'projects',
      COALESCE(
        (SELECT json_agg(DISTINCT project ORDER BY project)
         FROM registrations WHERE project IS NOT NULL AND project != ''),
        '[]'::json
      ),
    'advisors',
      COALESCE(
        (SELECT json_agg(DISTINCT advisor_name ORDER BY advisor_name)
         FROM registrations WHERE advisor_name IS NOT NULL AND advisor_name != ''),
        '[]'::json
      ),
    'propertyTypes',
      COALESCE(
        (SELECT json_agg(DISTINCT property_type ORDER BY property_type)
         FROM registrations WHERE property_type IS NOT NULL AND property_type != ''),
        '[]'::json
      ),
    'propertySizes',
      COALESCE(
        (SELECT json_agg(DISTINCT property_size ORDER BY property_size)
         FROM registrations WHERE property_size IS NOT NULL AND property_size != ''),
        '[]'::json
      ),
    'plotPreferences',
      COALESCE(
        (SELECT json_agg(DISTINCT plot_preference ORDER BY plot_preference)
         FROM registrations WHERE plot_preference IS NOT NULL AND plot_preference != ''),
        '[]'::json
      ),
    'paymentPlans',
      COALESCE(
        (SELECT json_agg(DISTINCT payment_plan ORDER BY payment_plan)
         FROM registrations WHERE payment_plan IS NOT NULL AND payment_plan != ''),
        '[]'::json
      ),
    'paymentModes',
      COALESCE(
        (SELECT json_agg(DISTINCT payment_mode ORDER BY payment_mode)
         FROM registrations WHERE payment_mode IS NOT NULL AND payment_mode != ''),
        '[]'::json
      )
  ) AS filters;

COMMENT ON MATERIALIZED VIEW mv_registration_filters IS
  'Pre-computed distinct registration filter values.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_registration_filters_pkey
  ON mv_registration_filters (id);
