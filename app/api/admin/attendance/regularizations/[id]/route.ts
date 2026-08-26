import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { regularizationStore } from '@/src/lib/attendance/regularizationStore';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;
    if (!id) throw AppError.badRequest('Regularization ID is required');

    const body = await request.json().catch(() => null);
    if (!body || !body.status) {
      throw AppError.badRequest('Missing status field');
    }

    const { status, admin_notes } = body;
    if (status !== 'approved' && status !== 'rejected') {
      throw AppError.badRequest("Status must be 'approved' or 'rejected'");
    }

    const updated = await regularizationStore.updateRegularizationStatus(id, {
      status,
      reviewed_by: admin.id,
      admin_notes: typeof admin_notes === 'string' ? admin_notes.trim() : undefined,
    });

    if (!updated) {
      throw AppError.notFound('Regularization request not found');
    }

    // If approved, update attendance_records for that day
    if (status === 'approved') {
      try {
        const { data: existingRecord } = await supabaseAdmin
          .from('attendance_records')
          .select('*')
          .eq('user_id', updated.user_id)
          .eq('date', updated.date)
          .maybeSingle();

        const updatePayload: Record<string, unknown> = {
          status: 'present',
          marked_by: admin.id,
          updated_at: new Date().toISOString(),
        };

        const noteText = `Regularized by Admin (${updated.punch_type}): ${updated.reason}${admin_notes ? ' | Note: ' + admin_notes : ''}`;
        updatePayload.notes = noteText;

        if (updated.punch_type === 'punch_in') {
          updatePayload.punch_in_time = updated.suggested_time;
          updatePayload.is_geofence_verified = true;
        } else if (updated.punch_type === 'punch_out') {
          updatePayload.punch_out_time = updated.suggested_time;
          updatePayload.punch_out_geofence_verified = true;
          if (existingRecord?.punch_in_time) {
            const inTime = new Date(existingRecord.punch_in_time).getTime();
            const outTime = new Date(updated.suggested_time).getTime();
            if (outTime > inTime) {
              updatePayload.total_hours =
                Math.round(((outTime - inTime) / (1000 * 60 * 60)) * 100) / 100;
            }
          }
        } else if (updated.punch_type === 'full_day') {
          updatePayload.punch_in_time = `${updated.date}T09:30:00.000Z`;
          updatePayload.punch_out_time = `${updated.date}T18:30:00.000Z`;
          updatePayload.total_hours = 9.0;
          updatePayload.is_geofence_verified = true;
          updatePayload.punch_out_geofence_verified = true;
        }

        if (existingRecord) {
          await supabaseAdmin
            .from('attendance_records')
            .update(updatePayload)
            .eq('id', existingRecord.id);
        } else {
          // Find user's team
          const { data: teamMember } = await supabaseAdmin
            .from('team_members')
            .select('team_id')
            .eq('user_id', updated.user_id)
            .limit(1)
            .maybeSingle();

          const teamId = teamMember?.team_id || '00000000-0000-0000-0000-000000000000';

          await supabaseAdmin.from('attendance_records').insert({
            user_id: updated.user_id,
            team_id: teamId,
            date: updated.date,
            ...updatePayload,
          });
        }
      } catch (syncErr) {
        console.error('Error syncing regularization to attendance_records:', syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Regularization request ${status} successfully.`,
      regularization: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
