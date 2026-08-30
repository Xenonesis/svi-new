import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leaveStore } from '@/src/lib/attendance/leaveStore';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view leaves');
    }

    const leaves = await leaveStore.getAllLeaves({ userId: verified.user.id });
    // Compute annual leave quota summary
    const currentYear = new Date().getFullYear();
    const approvedThisYear = (leaves || []).filter(
      (l) => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear
    );

    const breakdown = {
      casual_taken: approvedThisYear
        .filter((l) => l.leave_type === 'casual')
        .reduce((sum, l) => sum + Number(l.total_days || 0), 0),
      sick_taken: approvedThisYear
        .filter((l) => l.leave_type === 'sick')
        .reduce((sum, l) => sum + Number(l.total_days || 0), 0),
      earned_taken: approvedThisYear
        .filter((l) => l.leave_type === 'earned')
        .reduce((sum, l) => sum + Number(l.total_days || 0), 0),
      unpaid_taken: approvedThisYear
        .filter((l) => l.leave_type === 'unpaid')
        .reduce((sum, l) => sum + Number(l.total_days || 0), 0),
    };
    // Fetch Admin Configured Quota Settings
    const { data: settingsData } = await supabaseAdmin
      .from('attendance_settings')
      .select('key, value')
      .in('key', ['annual_casual_leaves', 'annual_sick_leaves', 'annual_earned_leaves']);

    const settingsMap: Record<string, number> = {};
    for (const s of settingsData || []) {
      const num = typeof s.value === 'number' ? s.value : Number(String(s.value).replace(/"/g, ''));
      if (!isNaN(num)) settingsMap[s.key] = num;
    }

    const casualTotal = settingsMap.annual_casual_leaves ?? 12;
    const sickTotal = settingsMap.annual_sick_leaves ?? 8;
    const earnedTotal = settingsMap.annual_earned_leaves ?? 15;

    const quota = {
      casual_total: casualTotal,
      sick_total: sickTotal,
      earned_total: earnedTotal,
      ...breakdown,
    };
    return NextResponse.json({
      leaves: leaves || [],
      quota,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to apply for leave');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      throw AppError.badRequest('Invalid request body');
    }

    const { leave_type, start_date, end_date, reason } = body;

    if (!leave_type || !start_date || !end_date || !reason) {
      throw AppError.badRequest(
        'Missing required fields: leave_type, start_date, end_date, reason'
      );
    }

    const validTypes = ['casual', 'sick', 'earned', 'unpaid', 'half_day'];
    if (!validTypes.includes(leave_type)) {
      throw AppError.badRequest(`Invalid leave_type. Must be one of: ${validTypes.join(', ')}`);
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw AppError.badRequest('Invalid date values');
    }

    if (end < start) {
      throw AppError.badRequest('end_date cannot be before start_date');
    }

    // Calculate total days (minimum 0.5 for half day, or calendar days difference + 1)
    let totalDays: number;
    if (leave_type === 'half_day') {
      totalDays = 0.5;
    } else {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const newLeave = await leaveStore.createLeave({
      user_id: verified.user.id,
      leave_type,
      start_date,
      end_date,
      total_days: totalDays,
      reason: reason.trim(),
    });
    return NextResponse.json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: newLeave,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to cancel leave');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Leave ID is required');
    }

    // Only allow cancelling pending leaves belonging to the user
    const updated = await leaveStore.updateLeaveStatus(body.id, {
      status: 'cancelled',
    });

    if (!updated) {
      throw AppError.badRequest('Leave not found or cannot be cancelled');
    }
    return NextResponse.json({
      success: true,
      message: 'Leave request cancelled',
      leave: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
