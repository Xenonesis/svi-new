import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '20') || 20);

  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch profile names separately (activity_logs.user_id FK points to auth.users, not profiles)
  const userIds = [...new Set((data || []).map((a: any) => a.user_id).filter(Boolean))];
  const profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    if (profiles) {
      for (const p of profiles) profileMap[p.id] = p.full_name;
    }
  }

  // Transform to match ActivityTimeline component format
  const activities = (data || []).map(
    (log: {
      id: string;
      user_id: string;
      action_type: string;
      description: string;
      created_at: string;
    }) => ({
      id: log.id,
      type: getActivityType(log.action_type),
      title: getActionTitle(log.action_type),
      description: log.description,
      timestamp: formatTimestamp(log.created_at),
      user: profileMap[log.user_id] || 'Unknown',
    })
  );

  const response = NextResponse.json({ activities });
  response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  return response;
}

function getActivityType(
  actionType: string
): 'user' | 'document' | 'settings' | 'download' | 'attendance' {
  if (actionType.includes('attendance') || actionType.includes('team_')) return 'attendance';
  if (actionType.includes('user')) return 'user';
  if (actionType.includes('download')) return 'download';
  if (actionType.includes('document')) return 'document';
  return 'settings';
}

function getActionTitle(actionType: string): string {
  const titles: Record<string, string> = {
    user_created: 'New user created',
    user_deleted: 'User deleted',
    document_generated: 'Document generated',
    document_downloaded: 'Document downloaded',
    settings_updated: 'Settings updated',
    profile_updated: 'Profile updated',
    team_created: 'Team created',
    team_deleted: 'Team deleted',
    attendance_marked: 'Attendance marked',
  };
  return titles[actionType] || actionType;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
