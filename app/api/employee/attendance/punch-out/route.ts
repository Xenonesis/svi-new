import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createClient } from '@/src/lib/supabase/server';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// Haversine formula
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
      throw AppError.unauthorized('Please log in to punch out');
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

    // Find today's punch-in record
    const { data: todayRecord } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (!todayRecord) {
      throw AppError.badRequest('You have not punched in today');
    }

    if (todayRecord.punch_out_time) {
      throw AppError.badRequest('You have already punched out today');
    }

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
      isGeofenceVerified = true;
    }

    // Calculate total hours
    const punchInTime = new Date(todayRecord.punch_in_time);
    const totalHours =
      Math.round(((now.getTime() - punchInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;

    const summaryText = typeof body.summary_text === 'string' ? body.summary_text.trim() : null;
    const clientCount = Number(body.client_interactions_count) || 0;
    const visitCount = Number(body.site_visits_conducted_count) || 0;

    // Update record with punch-out data and daily work log
    // Update attendance record with punch-out timestamp and duration
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('attendance_records')
      .update({
        punch_out_time: now.toISOString(),
        punch_out_lat: lat,
        punch_out_lon: lon,
        punch_out_geofence_verified: isGeofenceVerified,
        total_hours: totalHours,
        updated_at: now.toISOString(),
      })
      .eq('id', todayRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating punch-out record:', updateError);
      throw AppError.badRequest(
        `Could not record punch out: ${updateError.message || 'Database error'}`
      );
    }

    // Also log work summary to employee_work_logs if provided
    if (summaryText) {
      await supabaseAdmin.from('employee_work_logs').insert({
        user_id: user.id,
        date: today,
        attendance_record_id: todayRecord.id,
        summary: summaryText,
        client_interactions_count: clientCount,
        site_visits_conducted_count: visitCount,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Shift completed! Punch-out recorded successfully.',
      record: updatedRecord,
      geofence: {
        verified: isGeofenceVerified,
        distance: closestDistance,
        location_name: matchedLocationName,
      },
      total_hours: totalHours,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
