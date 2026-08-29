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

    const rawLat = body.lat ?? body.latitude;
    const rawLon = body.lon ?? body.longitude;

    if (rawLat === undefined || rawLon === undefined || rawLat === null || rawLon === null) {
      throw AppError.badRequest('Location coordinates (lat, lon) are required');
    }

    const lat = Number(rawLat);
    const lon = Number(rawLon);

    if (isNaN(lat) || isNaN(lon)) {
      throw AppError.badRequest('Invalid GPS coordinate values');
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

    const punchInStart = settingsMap['punch_in_start']?.replace(/"/g, '') || '09:00';
    const punchInLateAfter = settingsMap['punch_in_late_after']?.replace(/"/g, '') || '09:15';
    const punchInCutoff = settingsMap['punch_in_cutoff']?.replace(/"/g, '') || '10:30';

    // Check time - convert to IST (UTC+5:30) for comparison
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentTimeStr = istNow.toISOString().slice(11, 16); // "HH:MM"

    // Check late and cutoff thresholds
    const isLate = currentTimeStr > punchInLateAfter;
    const isAfterCutoff = currentTimeStr > punchInCutoff;

    // Geofence verification against all active locations
    const { data: locations } = await supabaseAdmin
      .from('geofence_locations')
      .select('*')
      .eq('is_active', true);

    let isGeofenceVerified = false;
    let closestDistance: number | null = null;
    let matchedLocationName: string | null = null;

    if (locations && locations.length > 0) {
      for (const loc of locations) {
        const dist = calculateDistance(lat, lon, Number(loc.latitude), Number(loc.longitude));
        const radius = Number(loc.radius_meters) || 200;

        if (closestDistance === null || dist < closestDistance) {
          closestDistance = Math.round(dist);
          matchedLocationName = loc.name;
        }

        if (dist <= radius) {
          isGeofenceVerified = true;
          closestDistance = Math.round(dist);
          matchedLocationName = loc.name;
          break;
        }
      }
    } else {
      // No locations configured - allow without geofence
      isGeofenceVerified = true;
    }

    // Find employee's team with automatic fallback if not yet assigned
    let teamId: string | null = null;
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (teamMember?.team_id) {
      teamId = teamMember.team_id;
    } else {
      const { data: firstTeam } = await supabaseAdmin
        .from('teams')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstTeam) {
        teamId = firstTeam.id;
        await supabaseAdmin.from('team_members').insert({
          team_id: firstTeam.id,
          user_id: user.id,
        });
      }
    }

    // Status: If punched after cutoff, automatically assign 'half_day' (50% salary).
    // If punched on-time or late within shift window, assign 'present' (or 'pending' if geofence unverified).
    const statusValue = isAfterCutoff ? 'half_day' : isGeofenceVerified ? 'present' : 'pending';

    const noteText = isAfterCutoff
      ? `Half-Day arrival punch-in at ${currentTimeStr} IST (Cutoff was ${punchInCutoff})`
      : isLate
        ? `Late punch-in at ${currentTimeStr} IST (Grace period was till ${punchInLateAfter})`
        : `On-time punch-in at ${currentTimeStr} IST`;
    // Insert punch-in record
    const { data: newRecord, error: insertError } = await supabaseAdmin
      .from('attendance_records')
      .insert({
        user_id: user.id,
        team_id: teamId,
        date: today,
        status: statusValue,
        punch_in_time: now.toISOString(),
        check_in_lat: lat,
        check_in_lon: lon,
        is_geofence_verified: isGeofenceVerified,
        geofence_distance_meters: closestDistance,
        is_late: isLate,
        notes: noteText,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting punch-in record:', insertError);
      if (insertError.code === '23505') {
        throw AppError.badRequest('You have already punched in for today.');
      }
      throw AppError.badRequest(
        `Could not record attendance: ${insertError.message || 'Database error'}`
      );
    }
    const message = isAfterCutoff
      ? `Punched in at ${currentTimeStr} IST (After ${punchInCutoff} Cutoff). Recorded as Half Day (50% Day Salary count).`
      : isLate
        ? `Punched in at ${currentTimeStr} IST (Late Arrival). Grace was till ${punchInLateAfter}. Full-day shift active.`
        : `Successfully punched in on-time at ${currentTimeStr} IST! Have a productive shift.`;
    return NextResponse.json({
      success: true,
      message,
      record: newRecord,
      geofence: {
        verified: isGeofenceVerified,
        distance: closestDistance,
        location_name: matchedLocationName,
      },
      is_late: isLate,
      is_after_cutoff: isAfterCutoff,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
