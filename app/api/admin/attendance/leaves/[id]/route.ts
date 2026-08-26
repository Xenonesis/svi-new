import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leaveStore } from '@/src/lib/attendance/leaveStore';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    if (!id) throw AppError.badRequest('Leave ID is required');

    const body = await request.json().catch(() => null);
    if (!body || !body.status) {
      throw AppError.badRequest('Missing status field');
    }

    const { status, admin_notes } = body;
    if (status !== 'approved' && status !== 'rejected') {
      throw AppError.badRequest("Status must be 'approved' or 'rejected'");
    }

    const updated = await leaveStore.updateLeaveStatus(id, {
      status,
      reviewed_by: admin.id,
      admin_notes: typeof admin_notes === 'string' ? admin_notes.trim() : undefined,
    });

    if (!updated) {
      throw AppError.notFound('Leave request not found');
    }

    // If approved, automatically update attendance_records for each day of leave
    if (status === 'approved') {
      try {
        const start = new Date(updated.start_date);
        const end = new Date(updated.end_date);
        const dates: string[] = [];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }

        // Get user's team if available
        const { data: teamMember } = await supabaseAdmin
          .from('team_members')
          .select('team_id')
          .eq('user_id', updated.user_id)
          .limit(1)
          .maybeSingle();

        const teamId = teamMember?.team_id || '00000000-0000-0000-0000-000000000000';

        for (const dateStr of dates) {
          // Check if record exists for this date
          const { data: existing } = await supabaseAdmin
            .from('attendance_records')
            .select('id')
            .eq('user_id', updated.user_id)
            .eq('date', dateStr)
            .maybeSingle();

          if (existing) {
            await supabaseAdmin
              .from('attendance_records')
              .update({
                status: 'leave',
                notes: `Approved Leave (${updated.leave_type})${admin_notes ? ': ' + admin_notes : ''}`,
                marked_by: admin.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id);
          } else {
            await supabaseAdmin.from('attendance_records').insert({
              user_id: updated.user_id,
              team_id: teamId,
              date: dateStr,
              status: 'leave',
              notes: `Approved Leave (${updated.leave_type})${admin_notes ? ': ' + admin_notes : ''}`,
              marked_by: admin.id,
            });
          }
        }
      } catch (leaveSyncErr) {
        console.error('Error synchronizing attendance records for approved leave:', leaveSyncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${status} successfully.`,
      leave: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
