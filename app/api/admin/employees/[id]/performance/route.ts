import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadActivityStore } from '@/src/lib/leads/leadActivityStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    // 1. Fetch employee profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (profileErr || !profile) {
      throw AppError.notFound('Employee not found');
    }

    // 2. Fetch Attendance Records for this employee
    const { data: attendanceRecords } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('user_id', employeeId)
      .order('date', { ascending: false });

    const records = attendanceRecords || [];
    const totalDaysRecorded = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const halfDays = records.filter((r) => r.status === 'half_day').length;
    const leaveDays = records.filter((r) => r.status === 'leave').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const lateDays = records.filter((r) => r.is_late).length;
    const geofenceVerifiedDays = records.filter((r) => r.is_geofence_verified).length;

    const totalHours = records.reduce((sum, r) => sum + (Number(r.total_hours) || 0), 0);
    const avgDailyHours =
      totalDaysRecorded > 0 ? Number((totalHours / totalDaysRecorded).toFixed(1)) : 0;
    const punctualityRate =
      presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;
    const geofenceComplianceRate =
      presentDays > 0 ? Math.round((geofenceVerifiedDays / presentDays) * 100) : 100;

    // Today's attendance status
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = records.find((r) => r.date === todayStr);

    // 3. Fetch Leads for this employee
    const { data: rawLeads } = await supabaseAdmin
      .from('chat_leads')
      .select('*')
      .or(`assigned_to.eq.${employeeId},lead_created_by.eq.${employeeId}`)
      .order('created_at', { ascending: false });

    const leads = rawLeads || [];
    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.lifecycle_status === 'won').length;
    const hotLeads = leads.filter((l) => l.temperature === 'hot').length;
    const warmLeads = leads.filter((l) => l.temperature === 'warm').length;
    const coldLeads = leads.filter((l) => l.temperature === 'cold').length;
    const newLeads = leads.filter((l) => l.lifecycle_status === 'new').length;
    const contactedLeads = leads.filter((l) => l.lifecycle_status === 'contacted').length;
    const qualifiedLeads = leads.filter((l) => l.lifecycle_status === 'qualified').length;
    const visitScheduledLeads = leads.filter(
      (l) => l.lifecycle_status === 'visit_requested'
    ).length;
    const lostLeads = leads.filter((l) => l.lifecycle_status === 'lost').length;

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Check overdue follow-ups
    const now = new Date();
    const overdueFollowups = leads.filter((l) => {
      if (!l.follow_up_at || l.lifecycle_status === 'won' || l.lifecycle_status === 'lost')
        return false;
      return new Date(l.follow_up_at) < now;
    }).length;

    const todayFollowups = leads.filter((l) => {
      if (!l.follow_up_at) return false;
      const fDate = new Date(l.follow_up_at).toISOString().split('T')[0];
      return fDate === todayStr;
    }).length;

    // 4. Fetch Field activities / work logs
    const activities = await leadActivityStore.getEmployeeActivities(employeeId);
    const totalCallsLogged = activities.filter(
      (a) => a.activity_type === 'call_logged' || a.activity_type === 'note_added'
    ).length;

    return NextResponse.json({
      success: true,
      profile,
      attendance: {
        total_days: totalDaysRecorded,
        present_days: presentDays,
        half_days: halfDays,
        leave_days: leaveDays,
        absent_days: absentDays,
        late_days: lateDays,
        punctuality_rate: punctualityRate,
        geofence_compliance_rate: geofenceComplianceRate,
        total_hours: Math.round(totalHours),
        avg_daily_hours: avgDailyHours,
        today: todayRecord
          ? {
              status: todayRecord.status,
              punch_in: todayRecord.punch_in_time,
              punch_out: todayRecord.punch_out_time,
              is_late: todayRecord.is_late,
              total_hours: todayRecord.total_hours,
            }
          : null,
      },
      leads: {
        total: totalLeads,
        won: wonLeads,
        conversion_rate: conversionRate,
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        visit_scheduled: visitScheduledLeads,
        lost: lostLeads,
        overdue_followups: overdueFollowups,
        today_followups: todayFollowups,
      },
      activity: {
        total_calls_logged: totalCallsLogged,
        recent_activities_count: activities.length,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
