import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// GET /api/admin/attendance/teams/[id]/members — list team members
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { data: members, error } = await supabaseAdmin
    .from('team_members')
    .select(
      `
      id,
      team_id,
      user_id,
      added_at,
      profiles!inner(full_name, email)
    `
    )
    .eq('team_id', id)
    .order('added_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (members || []).map((m: Record<string, unknown>) => {
    const profile = m.profiles as { full_name: string; email: string } | null;
    return {
      id: m.id,
      team_id: m.team_id,
      user_id: m.user_id,
      added_at: m.added_at,
      full_name: profile?.full_name || '',
      email: profile?.email || '',
    };
  });

  return NextResponse.json({ members: formatted });
}

// POST /api/admin/attendance/teams/[id]/members — add member to team
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: { user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  // Verify user exists in profiles
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', body.user_id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: member, error } = await supabaseAdmin
    .from('team_members')
    .insert({
      team_id: id,
      user_id: body.user_id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'User is already in this team' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member }, { status: 201 });
}
