import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view dashboard');
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch Today's Attendance Record
    const { data: todayAttendance } = await supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('user_id', verified.user.id)
      .eq('date', today)
      .maybeSingle();

    let punchStatus = 'not_punched';
    if (todayAttendance) {
      if (todayAttendance.punch_out_time) {
        punchStatus = 'punched_out';
      } else if (todayAttendance.punch_in_time) {
        punchStatus = 'punched_in';
      }
    }

    // 2. Fetch Tasks (Today + Pending)
    const { data: tasks } = await supabaseAdmin
      .from('employee_tasks')
      .select('*')
      .eq('user_id', verified.user.id)
      .order('created_at', { ascending: false });

    const allTasks = tasks || [];
    const pendingTasks = allTasks.filter(
      (t) => t.status === 'pending' || t.status === 'in_progress'
    );
    const completedTasksToday = allTasks.filter(
      (t) => t.status === 'completed' && t.completed_at?.startsWith(today)
    );

    // 3. Fetch Assigned Site Visits
    const { data: siteVisits } = await supabaseAdmin
      .from('whatsapp_site_visit_requests')
      .select(
        '*, contact:whatsapp_contacts(name, phone), conversation:whatsapp_conversations(project_id)'
      )
      .eq('assigned_to', verified.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const activeSiteVisits = (siteVisits || []).filter(
      (v) => v.status === 'requested' || v.status === 'confirmed'
    );

    // 4. Fetch Assigned Leads (Chatbot & WhatsApp)
    const { data: chatLeads } = await supabaseAdmin
      .from('chat_leads')
      .select('*')
      .eq('assigned_to', verified.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const pendingLeads = (chatLeads || []).filter(
      (l) => l.lifecycle_status !== 'converted' && l.lifecycle_status !== 'lost'
    );

    // 5. Work stats for this week
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const mondayStr = monday.toISOString().split('T')[0];

    const { data: weekRecords } = await supabaseAdmin
      .from('attendance_records')
      .select('total_hours, status')
      .eq('user_id', verified.user.id)
      .gte('date', mondayStr)
      .lte('date', today);

    let weekHours = 0;
    let daysPresentThisWeek = 0;
    for (const r of weekRecords || []) {
      if (r.total_hours) weekHours += Number(r.total_hours);
      if (r.status === 'present') daysPresentThisWeek += 1;
    }

    return NextResponse.json({
      employee: {
        id: verified.user.id,
        name: verified.profile.full_name,
        email: verified.profile.email,
        role: verified.profile.role,
        department: verified.profile.department,
      },
      today: {
        date: today,
        punch_status: punchStatus,
        punch_in_time: todayAttendance?.punch_in_time || null,
        punch_out_time: todayAttendance?.punch_out_time || null,
        total_hours: todayAttendance?.total_hours || null,
        is_late: todayAttendance?.is_late || false,
        is_geofence_verified: todayAttendance?.is_geofence_verified || false,
      },
      metrics: {
        pending_tasks_count: pendingTasks.length,
        completed_tasks_today: completedTasksToday.length,
        active_site_visits_count: activeSiteVisits.length,
        pending_leads_count: pendingLeads.length,
        days_present_this_week: daysPresentThisWeek,
        hours_logged_this_week: Number(weekHours.toFixed(1)),
      },
      urgent_tasks: pendingTasks
        .filter((t) => t.priority === 'urgent' || t.priority === 'high')
        .slice(0, 5),
      upcoming_site_visits: activeSiteVisits.slice(0, 5),
      recent_leads: pendingLeads.slice(0, 5),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
