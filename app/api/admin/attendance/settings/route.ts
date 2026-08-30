import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: settings, error } = await supabaseAdmin
      .from('attendance_settings')
      .select('key, value');

    if (error) {
      throw AppError.internal('Failed to fetch settings');
    }

    const settingsMap: Record<string, any> = {};
    for (const s of settings || []) {
      // Clean up string values if they were saved with extra quotes
      if (typeof s.value === 'string') {
        settingsMap[s.key] = s.value.replace(/^"|"$/g, '');
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    // Default values if not set
    const defaultSettings = {
      punch_in_start: '09:00',
      punch_in_late_after: '09:15',
      punch_in_cutoff: '10:30',
      punch_out_start: '17:00',
      punch_out_end: '21:00',
      min_hours_half_day: 4,
      min_hours_full_day: 8,
      geofence_radius_meters: 200,
      annual_casual_leaves: 12,
      annual_sick_leaves: 8,
      annual_earned_leaves: 15,
    };
    return NextResponse.json({ settings: { ...defaultSettings, ...settingsMap } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const {
      punch_in_start,
      punch_in_late_after,
      punch_in_cutoff,
      punch_out_start,
      punch_out_end,
      min_hours_half_day,
      min_hours_full_day,
      geofence_radius_meters,
      annual_casual_leaves,
      annual_sick_leaves,
      annual_earned_leaves,
    } = body;
    const updates = [
      { key: 'punch_in_start', value: JSON.stringify(punch_in_start || '09:00') },
      { key: 'punch_in_late_after', value: JSON.stringify(punch_in_late_after || '09:15') },
      { key: 'punch_in_cutoff', value: JSON.stringify(punch_in_cutoff || '10:30') },
      { key: 'punch_out_start', value: JSON.stringify(punch_out_start || '17:00') },
      { key: 'punch_out_end', value: JSON.stringify(punch_out_end || '21:00') },
      { key: 'min_hours_half_day', value: JSON.stringify(Number(min_hours_half_day) || 4) },
      { key: 'min_hours_full_day', value: JSON.stringify(Number(min_hours_full_day) || 8) },
      {
        key: 'geofence_radius_meters',
        value: JSON.stringify(Number(geofence_radius_meters) || 200),
      },
      {
        key: 'annual_casual_leaves',
        value: JSON.stringify(Number(annual_casual_leaves ?? 12)),
      },
      {
        key: 'annual_sick_leaves',
        value: JSON.stringify(Number(annual_sick_leaves ?? 8)),
      },
      {
        key: 'annual_earned_leaves',
        value: JSON.stringify(Number(annual_earned_leaves ?? 15)),
      },
    ];
    const { error } = await supabaseAdmin
      .from('attendance_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) {
      console.error('Error updating settings:', error);
      throw AppError.internal('Failed to update attendance settings');
    }

    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'settings_updated',
      description: 'Attendance timing rules updated',
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
