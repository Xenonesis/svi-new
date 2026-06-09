import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { rateLimit } from '@/src/lib/api/rateLimit';

// ─── POST: Save a chat log ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, messages, userAgent } = body;

  if (!sessionId || !messages) {
    return NextResponse.json({ error: 'sessionId and messages are required' }, { status: 400 });
  }

  // Compute message stats (only if columns exist in table)
  let msgCount: number | null = null;
  let userCount: number | null = null;
  try {
    const parsed = typeof messages === 'string' ? JSON.parse(messages) : messages;
    if (Array.isArray(parsed)) {
      msgCount = parsed.length;
      userCount = parsed.filter((m: any) => m.role === 'user').length;
    }
  } catch {
    // fallback
  }

  // Build payload — omit message_count columns if they don't exist in table yet
  const payload: {
    session_id: string;
    messages: string;
    user_agent: string;
    updated_at: string;
    message_count?: number;
    user_message_count?: number;
  } = {
    session_id: sessionId,
    messages: typeof messages === 'string' ? messages : JSON.stringify(messages),
    user_agent: userAgent,
    updated_at: new Date().toISOString(),
  };
  if (msgCount !== null) payload.message_count = msgCount;
  if (userCount !== null) payload.user_message_count = userCount;

  const { error } = await supabaseAdmin.from('chat_logs').upsert(payload,
    { onConflict: 'session_id' }
  );

  if (error) {
    console.error('Chat log save error:', error.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── GET: List chat logs (admin only) ───────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  // Sort params
  const sortBy = searchParams.get('sort_by') || 'updated_at';
  const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false;

  // Allowed sort columns
  const allowedSorts = ['created_at', 'updated_at', 'message_count', 'user_message_count'];
  const actualSortBy = allowedSorts.includes(sortBy) ? sortBy : 'updated_at';

  // Date range filter
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  // Message count filter
  const minMessages = searchParams.get('min_messages');
  const maxMessages = searchParams.get('max_messages');

  // Search text
  const searchText = searchParams.get('search')?.trim();

  // Build query
  let query = supabaseAdmin.from('chat_logs').select('*', { count: 'exact' });

  // Apply filters
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    // Add 1 day to include the end date fully
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }
  if (minMessages) {
    query = query.gte('message_count', parseInt(minMessages));
  }
  if (maxMessages) {
    query = query.lte('message_count', parseInt(maxMessages));
  }

  // Apply sorting & pagination
  const { data, error, count } = await query
    .order(actualSortBy, { ascending: sortOrder })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Chat log fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({
    logs: data || [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}

// ─── DELETE: Delete chat log(s) ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const all = searchParams.get('all');

  if (all === 'true') {
    // Clear all logs
    const { error } = await supabaseAdmin
      .from('chat_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'All logs cleared' });
  }

  if (!id) {
    return NextResponse.json({ error: 'id or ?all=true required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('chat_logs').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
