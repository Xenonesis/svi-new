import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import type { AttendanceStatus } from '@/src/lib/supabase/types';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/attendance/records — get attendance records
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '500')));
    // Fetch teams map safely
    let teamMap = new Map<string, string>();
    try {
      const teamsRes = await supabaseAdmin.from('teams')?.select?.('id, name');
      if (teamsRes && Array.isArray(teamsRes.data)) {
        teamMap = new Map(teamsRes.data.map((t: any) => [t.id, t.name]));
      }
    } catch {
      // Silent fallback
    }
    let query = supabaseAdmin
      .from('attendance_records')
      .select(
        `*,
        profiles!inner(full_name, email)`
      )
      .order('date', { ascending: false })
      .limit(limit);

    if (teamId) query = query.eq('team_id', teamId);
    if (date) query = query.eq('date', date);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    const { data: records, error } = await query;

    if (error) throw AppError.internal(error.message);

    const formatted = (records || []).map((r: Record<string, any>) => {
      const profile = r.profiles as { full_name: string; email: string } | null;

      // Extract work log from notes if JSON
      let workSummary: string | null = null;
      let clientCalls = 0;
      let siteVisits = 0;
      let plainNote: string | null = r.notes || null;

      if (r.notes && typeof r.notes === 'string') {
        try {
          const parsed = JSON.parse(r.notes);
          if (parsed && typeof parsed === 'object') {
            workSummary = parsed.summary || parsed.summary_text || null;
            clientCalls = Number(parsed.client_interactions_count || parsed.client_count || 0);
            siteVisits = Number(parsed.site_visits_conducted_count || parsed.visit_count || 0);
            plainNote = parsed.note || parsed.notes || null;
          }
        } catch {
          // Plain text note
        }
      }

      return {
        id: r.id,
        team_id: r.team_id,
        team_name: teamMap.get(r.team_id) || 'General Team',
        user_id: r.user_id,
        date: r.date,
        status: r.status,
        notes: plainNote,
        punch_in_time: r.punch_in_time || null,
        punch_out_time: r.punch_out_time || null,
        total_hours:
          r.total_hours !== undefined && r.total_hours !== null ? Number(r.total_hours) : null,
        is_late: Boolean(r.is_late),
        is_geofence_verified: Boolean(r.is_geofence_verified),
        punch_out_geofence_verified: Boolean(r.punch_out_geofence_verified),
        geofence_distance_meters: r.geofence_distance_meters || null,
        punch_in_lat: r.punch_in_lat || null,
        punch_in_lon: r.punch_in_lon || null,
        punch_out_lat: r.punch_out_lat || null,
        punch_out_lon: r.punch_out_lon || null,
        marked_by: r.marked_by,
        created_at: r.created_at,
        updated_at: r.updated_at,
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        work_log: {
          summary: workSummary,
          client_calls: clientCalls,
          site_visits: siteVisits,
        },
      };
    });

    return NextResponse.json({ records: formatted });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/attendance/records — bulk upsert attendance records
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: {
      records: Array<{
        team_id: string;
        user_id: string;
        date: string;
        status: AttendanceStatus;
        notes?: string;
      }>;
    };
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    if (!body.records || !Array.isArray(body.records) || body.records.length === 0) {
      throw AppError.badRequest('records array is required');
    }

    const validStatuses = ['present', 'absent', 'half_day', 'leave'];
    for (const r of body.records) {
      if (!r.team_id || !r.user_id || !r.date || !r.status) {
        throw AppError.badRequest('Each record must have team_id, user_id, date, and status');
      }
      if (!validStatuses.includes(r.status)) {
        throw AppError.badRequest(
          `Invalid status: ${r.status}. Must be one of: ${validStatuses.join(', ')}`
        );
      }
    }

    const recordsWithMeta = body.records.map((r) => ({
      ...r,
      notes: r.notes || null,
      marked_by: admin.id,
    }));

    const { data, error } = await supabaseAdmin
      .from('attendance_records')
      .upsert(recordsWithMeta, {
        onConflict: 'team_id,user_id,date',
      })
      .select();

    if (error) throw AppError.internal(error.message);

    // Log activity
    const teamId = body.records[0].team_id;
    const { data: teamData } = await supabaseAdmin
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();

    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'attendance_marked',
      description: `Attendance marked for ${body.records.length} member(s) in ${teamData?.name || 'team'} on ${body.records[0].date}`,
    });

    NotificationHelper.attendanceMarked(
      teamData?.name || 'team',
      body.records[0].date,
      body.records.length,
      profile?.full_name || 'Admin'
    ).catch(() => {});

    return NextResponse.json({ records: data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/attendance/records — Admin manual adjustment / override
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Record ID is required');
    }

    const { id, status, punch_in_time, punch_out_time, total_hours, notes } = body;

    const updatePayload: Record<string, unknown> = {
      marked_by: admin.id,
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (punch_in_time !== undefined) updatePayload.punch_in_time = punch_in_time;
    if (punch_out_time !== undefined) updatePayload.punch_out_time = punch_out_time;
    if (total_hours !== undefined) updatePayload.total_hours = total_hours;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data: updated, error } = await supabaseAdmin
      .from('attendance_records')
      .update(updatePayload)
      .eq('id', id)
      .select('*, profiles!inner(full_name, email)')
      .single();

    if (error) throw AppError.internal(error.message);

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
