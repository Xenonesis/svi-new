import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// Haversine formula to calculate distance between two lat/lon points in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
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
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to check in');
    }
    const { user, profile } = verified;

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { lat, lon, team_id } = body;
    if (lat === undefined || lon === undefined) {
      throw AppError.badRequest('Location coordinates (lat, lon) are required');
    }

    // Default distance limit
    const MAX_ALLOWED_DISTANCE_METERS = 200;
    const today = new Date().toISOString().split('T')[0];

    // Check if the user already checked in today
    const { data: existingRecord } = await supabaseAdmin
      .from('attendance_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existingRecord) {
      throw AppError.badRequest('You have already submitted attendance for today');
    }

    // Get active session
    const { data: activeSession } = await supabaseAdmin
      .from('attendance_sessions')
      .select('latitude, longitude')
      .eq('date', today)
      .eq('is_active', true)
      .maybeSingle();

    let is_geofence_verified = false;
    let distance = null;

    if (activeSession && activeSession.latitude && activeSession.longitude) {
      distance = calculateDistance(lat, lon, activeSession.latitude, activeSession.longitude);
      is_geofence_verified = distance <= MAX_ALLOWED_DISTANCE_METERS;
    }

    // Determine the team_id. If not provided in body, try to find from team_members
    let userTeamId = team_id;
    if (!userTeamId) {
      const { data: teamMember } = await supabaseAdmin
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (teamMember) {
        userTeamId = teamMember.team_id;
      }
    }

    if (!userTeamId) {
      // If still no team, we can create record without it if team_id is nullable,
      // but if team_id is required, we should throw an error.
      // Usually team_id is required for attendance_records.
      // Assuming we must have a team_id, we throw an error.
      throw AppError.badRequest('You are not assigned to any team');
    }

    // Insert the pending attendance record
    const { data: newRecord, error: insertError } = await supabaseAdmin
      .from('attendance_records')
      .insert({
        user_id: user.id,
        team_id: userTeamId,
        date: today,
        status: 'pending',
        check_in_lat: lat,
        check_in_lon: lon,
        is_geofence_verified,
        geofence_distance_meters: distance,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting attendance record:', insertError);
      throw AppError.internal('Failed to submit attendance');
    }

    return NextResponse.json({
      success: true,
      record: newRecord,
      geofence: {
        verified: is_geofence_verified,
        distance: distance ? Math.round(distance) : null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
