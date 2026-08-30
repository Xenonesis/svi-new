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

    let punchStatus: 'not_punched' | 'punched_in' | 'punched_out' = 'not_punched';
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

    // 6. Calculate On-Time Attendance Streak (Last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: pastRecords } = await supabaseAdmin
      .from('attendance_records')
      .select('date, status, is_late')
      .eq('user_id', verified.user.id)
      .gte('date', thirtyDaysAgoStr)
      .lte('date', today)
      .order('date', { ascending: false });

    let onTimeStreak = 0;
    if (pastRecords && pastRecords.length > 0) {
      for (const rec of pastRecords) {
        if (rec.status === 'present' && !rec.is_late) {
          onTimeStreak += 1;
        } else if (rec.status === 'present' && rec.is_late) {
          // Late breaks streak but counts if today hasn't finished
          if (rec.date === today) continue;
          break;
        } else if (rec.date !== today) {
          break;
        }
      }
    }

    // 7. Fetch Today's Work Log if exists
    const { data: todayWorkLog } = await supabaseAdmin
      .from('employee_work_logs')
      .select('summary, client_interactions_count, site_visits_conducted_count')
      .eq('user_id', verified.user.id)
      .eq('date', today)
      .maybeSingle();

    // 8. Fetch Active Geofence Locations
    const { data: geofenceLocations } = await supabaseAdmin
      .from('geofence_locations')
      .select('id, name, latitude, longitude, radius_meters')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    // 9. Leave Quota Breakdown with Admin Configured Settings
    const { data: leaveSettings } = await supabaseAdmin
      .from('attendance_settings')
      .select('key, value')
      .in('key', ['annual_casual_leaves', 'annual_sick_leaves', 'annual_earned_leaves']);

    const leaveConfig: Record<string, number> = {};
    for (const s of leaveSettings || []) {
      const num = typeof s.value === 'number' ? s.value : Number(String(s.value).replace(/"/g, ''));
      if (!isNaN(num)) leaveConfig[s.key] = num;
    }

    const maxCasual = leaveConfig.annual_casual_leaves ?? 12;
    const maxSick = leaveConfig.annual_sick_leaves ?? 8;
    const maxEarned = leaveConfig.annual_earned_leaves ?? 15;

    let leaveSummary = {
      casual_remaining: maxCasual,
      sick_remaining: maxSick,
      earned_remaining: maxEarned,
      total_remaining: maxCasual + maxSick + maxEarned,
    };

    try {
      const leaves = await leaveStore.getAllLeaves({ userId: verified.user.id });
      const currentYear = new Date().getFullYear();
      const approvedThisYear = (leaves || []).filter(
        (l) => l.status === 'approved' && new Date(l.start_date).getFullYear() === currentYear
      );

      let casualUsed = 0;
      let sickUsed = 0;
      let earnedUsed = 0;

      for (const l of approvedThisYear) {
        if (l.leave_type === 'casual' || l.leave_type === 'half_day') casualUsed += l.total_days;
        else if (l.leave_type === 'sick') sickUsed += l.total_days;
        else if (l.leave_type === 'earned') earnedUsed += l.total_days;
      }

      leaveSummary = {
        casual_remaining: Math.max(0, maxCasual - casualUsed),
        sick_remaining: Math.max(0, maxSick - sickUsed),
        earned_remaining: Math.max(0, maxEarned - earnedUsed),
        total_remaining: Math.max(
          0,
          maxCasual + maxSick + maxEarned - (casualUsed + sickUsed + earnedUsed)
        ),
      };
    } catch {
      // Use default balances if store fails
    }

    // 10. Construct Chronological Recent Activity Feed for Today
    const recentActivities: Array<{
      id: string;
      type: 'punch_in' | 'punch_out' | 'task_completed' | 'site_visit' | 'work_log';
      title: string;
      description: string;
      time: string;
    }> = [];

    if (todayAttendance?.punch_in_time) {
      recentActivities.push({
        id: 'punch-in-act',
        type: 'punch_in',
        title: 'Shift Started',
        description: todayAttendance.is_geofence_verified
          ? 'GPS Verified Geofence Attendance'
          : 'Shift In Logged',
        time: todayAttendance.punch_in_time,
      });
    }

    if (todayAttendance?.punch_out_time) {
      recentActivities.push({
        id: 'punch-out-act',
        type: 'punch_out',
        title: 'Shift Ended',
        description: `Logged ${todayAttendance.total_hours ? Number(todayAttendance.total_hours).toFixed(1) + ' hrs' : 'shift work'}`,
        time: todayAttendance.punch_out_time,
      });
    }

    for (const ct of completedTasksToday.slice(0, 3)) {
      recentActivities.push({
        id: `task-${ct.id}`,
        type: 'task_completed',
        title: 'Task Completed',
        description: ct.title,
        time: ct.completed_at ? ct.completed_at.slice(11, 16) : 'Today',
      });
    }

    if (todayWorkLog?.summary) {
      recentActivities.push({
        id: 'work-log-act',
        type: 'work_log',
        title: 'Daily Log Submitted',
        description:
          todayWorkLog.summary.slice(0, 60) + (todayWorkLog.summary.length > 60 ? '...' : ''),
        time: 'Today',
      });
    }

    const payload = {
      employee: {
        id: verified.user.id,
        full_name: verified.profile.full_name,
        name: verified.profile.full_name,
        email: verified.profile.email,
        role: verified.profile.role,
        department: verified.profile.department || 'Operations',
        designation:
          'designation' in verified.profile && typeof verified.profile.designation === 'string'
            ? verified.profile.designation
            : 'Staff Member',
      },
      today: {
        date: today,
        punch_status: punchStatus,
        punch_in_time: todayAttendance?.punch_in_time || null,
        punch_out_time: todayAttendance?.punch_out_time || null,
        total_hours: todayAttendance?.total_hours || null,
        is_late: todayAttendance?.is_late || false,
        is_geofence_verified: todayAttendance?.is_geofence_verified || false,
        geofence_distance_meters: todayAttendance?.geofence_distance_meters || null,
        summary: todayWorkLog?.summary || null,
      },
      metrics: {
        weekly_hours: Number(weekHours.toFixed(1)),
        hours_logged_this_week: Number(weekHours.toFixed(1)),
        pending_tasks: pendingTasks.length,
        pending_tasks_count: pendingTasks.length,
        completed_tasks_today: completedTasksToday.length,
        assigned_leads: pendingLeads.length,
        pending_leads_count: pendingLeads.length,
        upcoming_site_visits: activeSiteVisits.length,
        active_site_visits_count: activeSiteVisits.length,
        days_present_this_week: daysPresentThisWeek,
        on_time_streak: onTimeStreak,
      },
      leaves: leaveSummary,
      urgent_tasks: allTasks
        .filter((t) => t.status === 'pending' || t.status === 'in_progress')
        .sort((a, b) => {
          const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        })
        .slice(0, 6),
      upcoming_site_visits: activeSiteVisits.slice(0, 5),
      recent_leads: pendingLeads.slice(0, 6),
      recent_activities: recentActivities,
      geofence_locations: geofenceLocations || [],
    };

    return NextResponse.json({
      ...payload,
      dashboard: payload, // Support both root access and .dashboard access
    });
  } catch (err) {
    return handleApiError(err);
  }
}
