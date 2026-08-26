import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { createClient } from '@/src/lib/supabase/server';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw AppError.unauthorized('Please log in');
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'employee') {
      throw AppError.unauthorized('Access denied');
    }
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const istTimeStr = istNow.toISOString().slice(11, 16);

    // 1. Fetch today's attendance record
    const { data: todayRecord } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    // 2. Fetch employee team
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('team_id, teams (name)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    const teamName = (teamMember as any)?.teams?.name || 'Operations Team';

    // 3. Fetch admin attendance settings
    const { data: settingsData } = await supabaseAdmin
      .from('attendance_settings')
      .select('key, value');

    const settingsMap: Record<string, any> = {
      punch_in_start: '09:00',
      punch_in_cutoff: '10:30',
      punch_out_start: '17:00',
      punch_out_end: '21:00',
      geofence_radius_meters: 200,
    };

    for (const s of settingsData || []) {
      if (typeof s.value === 'string') {
        settingsMap[s.key] = s.value.replace(/^"|"$/g, '');
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    // 4. Fetch active geofence locations
    const { data: activeLocations } = await supabaseAdmin
      .from('geofence_locations')
      .select('id, name, latitude, longitude, radius_meters')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    // 4. Fetch today's work log if exists
    const { data: todayWorkLog } = await supabaseAdmin
      .from('employee_work_logs')
      .select('summary, client_interactions_count, site_visits_conducted_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    let status: EmployeeLiveStatus['status'] = 'not_punched';

    if (todayRecord) {
      if (todayRecord.punch_out_time) {
        status = 'punched_out';
      } else if (todayRecord.punch_in_time) {
        status = 'punched_in';
      } else {
        status = 'punched_in';
      }
    }

    const liveStatus = {
      user_id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      team_name: teamName,
      status,
      punch_in_time: todayRecord?.punch_in_time || null,
      punch_out_time: todayRecord?.punch_out_time || null,
      total_hours: todayRecord?.total_hours || null,
      is_late: todayRecord?.is_late || false,
      is_geofence_verified: todayRecord?.is_geofence_verified || false,
      punch_out_geofence_verified: todayRecord?.punch_out_geofence_verified || false,
      geofence_distance_meters: todayRecord?.geofence_distance_meters || null,
      summary_text: todayWorkLog?.summary || null,
      client_interactions_count: todayWorkLog?.client_interactions_count || 0,
      site_visits_conducted_count: todayWorkLog?.site_visits_conducted_count || 0,
    };

    return NextResponse.json({
      status: liveStatus,
      settings: settingsMap,
      locations: activeLocations || [],
      server_time: {
        iso: now.toISOString(),
        ist_time: istTimeStr,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
