import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createClient } from '@/src/lib/supabase/server';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// Haversine formula to calculate distance between two lat/lon points in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw AppError.unauthorized('Please log in to punch in');
    }

    // Verify employee role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'employee') {
      throw AppError.unauthorized('Only employees can punch in');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { lat, lon } = body;
    if (lat === undefined || lon === undefined) {
      throw AppError.badRequest('Location coordinates (lat, lon) are required');
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if already punched in today
    const { data: existingRecord } = await supabaseAdmin
      .from('attendance_records')
      .select('id, punch_in_time')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existingRecord) {
      throw AppError.badRequest('You have already punched in today');
    }

    // Get attendance settings for timing rules
    const { data: settings } = await supabaseAdmin.from('attendance_settings').select('key, value');

    const settingsMap: Record<string, string> = {};
    for (const s of settings || []) {
      settingsMap[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
    }

    const punchInCutoff = settingsMap['punch_in_cutoff']?.replace(/"/g, '') || '10:30';
    const punchInStart = settingsMap['punch_in_start']?.replace(/"/g, '') || '09:00';

    // Check time - convert to IST (UTC+5:30) for comparison
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentTimeStr = istNow.toISOString().slice(11, 16); // "HH:MM"

    // Block punch-in after cutoff
    if (currentTimeStr > punchInCutoff) {
      throw AppError.badRequest(
        `Punch-in is not allowed after ${punchInCutoff}. Please contact your admin.`
      );
    }

    // Check if late (after start time but before cutoff)
    const isLate = currentTimeStr > punchInStart;

    // Geofence verification against all active locations
    const { data: locations } = await supabaseAdmin
      .from('geofence_locations')
      .select('*')
      .eq('is_active', true);

    let isGeofenceVerified = false;
    let closestDistance: number | null = null;

    if (locations && locations.length > 0) {
      for (const loc of locations) {
        const dist = calculateDistance(lat, lon, Number(loc.latitude), Number(loc.longitude));
        const radius = Number(loc.radius_meters) || 200;

        if (closestDistance === null || dist < closestDistance) {
          closestDistance = Math.round(dist);
        }

        if (dist <= radius) {
          isGeofenceVerified = true;
          closestDistance = Math.round(dist);
          break;
        }
      }
    } else {
      // No locations configured - allow without geofence
      isGeofenceVerified = true;
    }

    // Find employee's team
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!teamMember) {
      throw AppError.badRequest('You are not assigned to any team. Contact your admin.');
    }

    // Insert punch-in record
    const { data: newRecord, error: insertError } = await supabaseAdmin
      .from('attendance_records')
      .insert({
        user_id: user.id,
        team_id: teamMember.team_id,
        date: today,
        status: isGeofenceVerified ? 'present' : 'pending',
        punch_in_time: now.toISOString(),
        check_in_lat: lat,
        check_in_lon: lon,
        is_geofence_verified: isGeofenceVerified,
        geofence_distance_meters: closestDistance,
        is_late: isLate,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting punch-in record:', insertError);
      throw AppError.internal('Failed to punch in');
    }

    return NextResponse.json({
      success: true,
      record: newRecord,
      geofence: {
        verified: isGeofenceVerified,
        distance: closestDistance,
      },
      is_late: isLate,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
