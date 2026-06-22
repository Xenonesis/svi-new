-- ============================================================
-- Performance Indexes v3 — Add missing trigram indexes and RPC
-- Run this in: Supabase Dashboard > SQL Editor
-- Safe: CREATE INDEX IF NOT EXISTS — never drops existing data
-- ============================================================

-- 1. Add trigram indexes for the remaining fields searched in the fuzzy search query
CREATE INDEX IF NOT EXISTS idx_registrations_search_last_name_trgm
  ON registrations USING gin (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_aadhar_number_trgm
  ON registrations USING gin (aadhar_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_advisor_name_trgm
  ON registrations USING gin (advisor_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_registrations_search_project_trgm
  ON registrations USING gin (project gin_trgm_ops);

-- 2. Create function to get distinct filter options database-side (single round-trip, aggregated)
CREATE OR REPLACE FUNCTION get_distinct_registration_filters()
RETURNS json
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'projects', COALESCE((SELECT json_agg(DISTINCT project ORDER BY project) FROM registrations WHERE project IS NOT NULL AND project != ''), '[]'::json),
    'advisors', COALESCE((SELECT json_agg(DISTINCT advisor_name ORDER BY advisor_name) FROM registrations WHERE advisor_name IS NOT NULL AND advisor_name != ''), '[]'::json),
    'propertyTypes', COALESCE((SELECT json_agg(DISTINCT property_type ORDER BY property_type) FROM registrations WHERE property_type IS NOT NULL AND property_type != ''), '[]'::json),
    'propertySizes', COALESCE((SELECT json_agg(DISTINCT property_size ORDER BY property_size) FROM registrations WHERE property_size IS NOT NULL AND property_size != ''), '[]'::json),
    'plotPreferences', COALESCE((SELECT json_agg(DISTINCT plot_preference ORDER BY plot_preference) FROM registrations WHERE plot_preference IS NOT NULL AND plot_preference != ''), '[]'::json),
    'paymentPlans', COALESCE((SELECT json_agg(DISTINCT payment_plan ORDER BY payment_plan) FROM registrations WHERE payment_plan IS NOT NULL AND payment_plan != ''), '[]'::json),
    'paymentModes', COALESCE((SELECT json_agg(DISTINCT payment_mode ORDER BY payment_mode) FROM registrations WHERE payment_mode IS NOT NULL AND payment_mode != ''), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
