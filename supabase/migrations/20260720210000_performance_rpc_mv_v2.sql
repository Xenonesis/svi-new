-- ═══════════════════════════════════════════════════════════
-- Performance — RPC simplified to single SQL pass
-- ═══════════════════════════════════════════════════════════
-- LANGUAGE sql + COALESCE reads MV first (instant) with
-- fallback to live subqueries. Single pass, no plpgsql
-- DECLARE/BEGIN/END overhead.
--
-- Expected: ~400ms → ~5-10ms (40-80× faster)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_distinct_registration_filters()
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE(
    (SELECT filters FROM mv_registration_filters LIMIT 1),
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
    )
  );
$$;
