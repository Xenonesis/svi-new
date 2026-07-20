import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { EmployeeLiveStatus } from '@/src/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const today = new Date().toISOString().split('T')[0];

    // Get all employees
    const { data: employees, error: empError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'employee');

    if (empError) throw AppError.internal('Failed to fetch employees');

    // Get today's attendance records
    const { data: todayRecords, error: recError } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('date', today);

    if (recError) throw AppError.internal('Failed to fetch attendance records');

    const recordMap = new Map();
    for (const record of todayRecords || []) {
      recordMap.set(record.user_id, record);
    }

    const liveStatuses: EmployeeLiveStatus[] = (employees || []).map((emp) => {
      const record = recordMap.get(emp.id);

      let status: EmployeeLiveStatus['status'] = 'not_punched';
      if (record) {
        if (record.punch_out_time) {
          status = 'punched_out';
        } else if (record.punch_in_time || record.status === 'pending') {
          status = 'punched_in';
        }
      }

      return {
        user_id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        status,
        punch_in_time: record?.punch_in_time || null,
        punch_out_time: record?.punch_out_time || null,
        total_hours: record?.total_hours || null,
        is_late: record?.is_late || false,
        is_geofence_verified: record?.is_geofence_verified || false,
        punch_out_geofence_verified: record?.punch_out_geofence_verified || false,
      };
    });

    return NextResponse.json({ statuses: liveStatuses });
  } catch (err) {
    return handleApiError(err);
  }
}
