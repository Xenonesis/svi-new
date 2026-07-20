// Run migration via Supabase REST API
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sql = `
-- 1. Attendance Settings Table
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

INSERT INTO public.attendance_settings (key, value) VALUES
  ('punch_in_start', '"09:00"'),
  ('punch_in_cutoff', '"10:30"'),
  ('punch_out_start', '"17:00"'),
  ('punch_out_end', '"21:00"'),
  ('geofence_radius_meters', '200')
ON CONFLICT (key) DO NOTHING;

-- 2. Geofence Locations Table
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

-- 3. Add punch-in/out columns
ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS punch_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_out_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_out_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_lon NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_geofence_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_hours NUMERIC;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_records_date_status
  ON public.attendance_records(date, status);

CREATE INDEX IF NOT EXISTS idx_geofence_locations_active
  ON public.geofence_locations(is_active);
`;

async function runMigration() {
  console.log('Running punch system migration...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // Fallback: try individual statements via supabase-js
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  // Split and run each statement
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_text: stmt + ';' });
      if (error) {
        // Try alternate approach
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_SERVICE_KEY!,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        });
        console.log(`⚠️  Statement may need manual run: ${stmt.slice(0, 60)}...`);
        failed++;
      } else {
        success++;
        console.log(`✅ ${stmt.slice(0, 60)}...`);
      }
    } catch (e) {
      console.log(`⚠️  ${stmt.slice(0, 60)}...`);
      failed++;
    }
  }

  console.log(`\n✅ Done. Success: ${success}, Needs manual: ${failed}`);
  if (failed > 0) {
    console.log('\n⚠️  Some statements may need to be run manually in the Supabase SQL Editor.');
    console.log('Copy the SQL from: supabase/migrations/20260720100000_punch_system.sql');
  }
}

runMigration().catch(console.error);
