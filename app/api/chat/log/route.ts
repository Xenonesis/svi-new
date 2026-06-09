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

  const { error } = await supabaseAdmin.from('chat_logs').upsert(
    {
      session_id: sessionId,
      messages: JSON.stringify(messages),
      user_agent: userAgent,
      updated_at: new Date().toISOString(),
    },
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
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('chat_logs')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Chat log fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({
    logs: data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}
