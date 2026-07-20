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
      punch_in_cutoff: '10:30',
      punch_out_start: '17:00',
      punch_out_end: '21:00',
      geofence_radius_meters: 200,
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
      punch_in_cutoff,
      punch_out_start,
      punch_out_end,
      geofence_radius_meters,
    } = body;

    const updates = [
      { key: 'punch_in_start', value: JSON.stringify(punch_in_start) },
      { key: 'punch_in_cutoff', value: JSON.stringify(punch_in_cutoff) },
      { key: 'punch_out_start', value: JSON.stringify(punch_out_start) },
      { key: 'punch_out_end', value: JSON.stringify(punch_out_end) },
      { key: 'geofence_radius_meters', value: JSON.stringify(geofence_radius_meters) },
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
