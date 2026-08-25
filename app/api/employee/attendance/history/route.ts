import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in as an employee to view attendance history');
    }

    const { searchParams } = new URL(request.url);
    // Format: 'YYYY-MM' (e.g. '2026-08')
    const monthParam = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    // Validate month format YYYY-MM
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
      throw AppError.badRequest('Invalid month format. Expected YYYY-MM');
    }

    const startDate = `${monthParam}-01`;
    // Compute end of month
    const [yearStr, monthStr] = monthParam.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${monthParam}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // Query attendance records for this month
    const { data: records, error: recordsError } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('user_id', verified.user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (recordsError) {
      console.error('Error fetching attendance history:', recordsError);
      throw AppError.internal('Failed to fetch attendance history');
    }

    const attendanceRecords = records || [];

    // Calculate monthly statistics
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let leaveCount = 0;
    let totalMinutesWorked = 0;

    for (const rec of attendanceRecords) {
      if (rec.status === 'present') {
        presentCount += 1;
      } else if (rec.status === 'half_day') {
        halfDayCount += 1;
      } else if (rec.status === 'leave') {
        leaveCount += 1;
      }

      if (rec.is_late) {
        lateCount += 1;
      }

      if (rec.total_hours && Number(rec.total_hours) > 0) {
        totalMinutesWorked += Math.round(Number(rec.total_hours) * 60);
      }
    }

    const totalHoursWorked = Number((totalMinutesWorked / 60).toFixed(1));
    const effectiveWorkingDays = presentCount + halfDayCount * 0.5;
    const avgDailyHours =
      effectiveWorkingDays > 0 ? Number((totalHoursWorked / effectiveWorkingDays).toFixed(1)) : 0;

    return NextResponse.json({
      month: monthParam,
      stats: {
        total_records: attendanceRecords.length,
        present_count: presentCount,
        late_count: lateCount,
        half_day_count: halfDayCount,
        leave_count: leaveCount,
        total_hours_worked: totalHoursWorked,
        avg_daily_hours: avgDailyHours,
      },
      records: attendanceRecords,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
