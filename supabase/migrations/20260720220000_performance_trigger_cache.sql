-- ═══════════════════════════════════════════════════════════
-- Performance — trigger-based registration filters cache
-- ═══════════════════════════════════════════════════════════
-- Replaces the materialized view with a trigger-based cache
-- table. Updates instantly on every INSERT/UPDATE/DELETE so
-- the RPC always returns fresh data without cron.
--
-- Steps:
--   1. Drop old MV + its index
--   2. Create cache table + unique index
--   3. Create refresh function
--   4. Create trigger on registrations
--   5. Seed initial data
--   6. Update RPC to read from cache
-- ═══════════════════════════════════════════════════════════

-- ── 1. Drop old MV ─────────────────────────────────
DROP MATERIALIZED VIEW IF EXISTS mv_registration_filters;

-- ── 2. Cache table (single row) ─────────────────────
CREATE TABLE IF NOT EXISTS registration_filters_cache (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  filters json NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Read function ────────────────────────────────
CREATE OR REPLACE FUNCTION get_cached_registration_filters()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT filters FROM registration_filters_cache WHERE id = 1;
$$;

-- ── 4. Build filters function ───────────────────────
CREATE OR REPLACE FUNCTION build_registration_filters()
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_build_object(
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
  );
$$;

-- ── 5. Trigger function ─────────────────────────────
CREATE OR REPLACE FUNCTION refresh_registration_filters_cache()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO registration_filters_cache (id, filters, updated_at)
  VALUES (1, build_registration_filters(), now())
  ON CONFLICT (id)
  DO UPDATE SET filters = build_registration_filters(), updated_at = now();
  RETURN NULL;
END;
$$;

-- ── 6. Apply trigger on registrations ───────────────
DROP TRIGGER IF EXISTS trg_refresh_registration_filters ON registrations;
CREATE TRIGGER trg_refresh_registration_filters
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_registration_filters_cache();

-- ── 7. Seed initial data ────────────────────────────
INSERT INTO registration_filters_cache (id, filters, updated_at)
VALUES (1, build_registration_filters(), now())
ON CONFLICT (id) DO NOTHING;

-- ── 8. Update the public RPC to use cache ───────────
CREATE OR REPLACE FUNCTION get_distinct_registration_filters()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT filters FROM registration_filters_cache WHERE id = 1;
$$;
