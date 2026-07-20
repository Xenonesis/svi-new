-- ============================================================
-- Punch-In / Punch-Out System Migration
-- ============================================================

-- 1. Attendance Settings Table (admin-configurable rules)
-- Uses key-value pairs similar to portal_settings
CREATE TABLE IF NOT EXISTS public.attendance_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read attendance_settings" ON public.attendance_settings;
DROP POLICY IF EXISTS "Service role full access attendance_settings" ON public.attendance_settings;

CREATE POLICY "Admins can read attendance_settings"
  ON public.attendance_settings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access attendance_settings"
  ON public.attendance_settings FOR ALL
  USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS attendance_settings_updated_at ON public.attendance_settings;
CREATE TRIGGER attendance_settings_updated_at
  BEFORE UPDATE ON public.attendance_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Seed default settings
INSERT INTO public.attendance_settings (key, value) VALUES
  ('punch_in_start', '"09:00"'),
  ('punch_in_cutoff', '"10:30"'),
  ('punch_out_start', '"17:00"'),
  ('punch_out_end', '"21:00"'),
  ('geofence_radius_meters', '200')
ON CONFLICT (key) DO NOTHING;

-- 2. Geofence Locations Table (admin-managed allowed locations)
CREATE TABLE IF NOT EXISTS public.geofence_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  radius_meters NUMERIC DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.geofence_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read geofence_locations" ON public.geofence_locations;
DROP POLICY IF EXISTS "Service role full access geofence_locations" ON public.geofence_locations;

CREATE POLICY "Admins can read geofence_locations"
  ON public.geofence_locations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access geofence_locations"
  ON public.geofence_locations FOR ALL
  USING (auth.role() = 'service_role');

-- 3. Add punch-in/out columns to attendance_records
ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS punch_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_out_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_out_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_lon NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_geofence_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_hours NUMERIC;

-- 4. Index for live status queries
CREATE INDEX IF NOT EXISTS idx_attendance_records_date_status
  ON public.attendance_records(date, status);

CREATE INDEX IF NOT EXISTS idx_geofence_locations_active
  ON public.geofence_locations(is_active);
