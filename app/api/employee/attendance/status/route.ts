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

    const today = new Date().toISOString().split('T')[0];

    const { data: todayRecord } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
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
        status = 'punched_in'; // fallback if only check_in was used (old logic) or just pending
      }
    }

    const liveStatus: EmployeeLiveStatus = {
      user_id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      status,
      punch_in_time: todayRecord?.punch_in_time || null,
      punch_out_time: todayRecord?.punch_out_time || null,
      total_hours: todayRecord?.total_hours || null,
      is_late: todayRecord?.is_late || false,
      is_geofence_verified: todayRecord?.is_geofence_verified || false,
      punch_out_geofence_verified: todayRecord?.punch_out_geofence_verified || false,
    };

    return NextResponse.json({ status: liveStatus });
  } catch (err) {
    return handleApiError(err);
  }
}
