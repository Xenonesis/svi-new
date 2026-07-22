import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabase() {
  console.log('🔍 Checking Database Schema via Supabase API...\n');

  // 1. Check attendance_settings table
  const settingsCheck = await supabase.from('attendance_settings').select('*').limit(1);
  if (settingsCheck.error) {
    console.log(
      '❌ attendance_settings table: NOT CREATED YET (' + settingsCheck.error.message + ')'
    );
  } else {
    console.log(
      '✅ attendance_settings table: EXISTS (Rows count sample: ' + settingsCheck.data?.length + ')'
    );
  }

  // 2. Check geofence_locations table
  const locationsCheck = await supabase.from('geofence_locations').select('*').limit(1);
  if (locationsCheck.error) {
    console.log(
      '❌ geofence_locations table: NOT CREATED YET (' + locationsCheck.error.message + ')'
    );
  } else {
    console.log(
      '✅ geofence_locations table: EXISTS (Rows count sample: ' + locationsCheck.data?.length + ')'
    );
  }

  // 3. Check new columns in attendance_records table
  const recordsCheck = await supabase
    .from('attendance_records')
    .select('punch_in_time, punch_out_time, is_geofence_verified, is_late, total_hours')
    .limit(1);

  if (recordsCheck.error) {
    console.log(
      '❌ attendance_records new columns: NOT ADDED YET (' + recordsCheck.error.message + ')'
    );
  } else {
    console.log('✅ attendance_records new columns (punch_in_time, etc.): EXIST');
  }

  console.log('\n--- Status Summary ---');
  if (settingsCheck.error || locationsCheck.error || recordsCheck.error) {
    console.log(
      '⚠️ Database is NOT FULLY UPDATED yet. Please run the migration SQL in Supabase Dashboard.'
    );
  } else {
    console.log('🎉 Database is FULLY UPDATED and READY!');
  }
}

checkDatabase().catch(console.error);
