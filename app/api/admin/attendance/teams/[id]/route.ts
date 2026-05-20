import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

// PATCH /api/admin/attendance/teams/[id] — update team
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: { name?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updateData: Record<string, string> = {};
  if (body.name?.trim()) updateData.name = body.name.trim();
  if (body.description !== undefined) updateData.description = body.description?.trim() || '';

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  return NextResponse.json({ team });
}

// DELETE /api/admin/attendance/teams/[id] — delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Fetch team name for logging before delete
  const { data: team } = await supabaseAdmin.from('teams').select('name').eq('id', id).single();

  const { error } = await supabaseAdmin.from('teams').delete().eq('id', id);

  if (!error && team) {
    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'team_deleted',
      description: `Team "${team.name}" was deleted`,
    });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
