import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const runtime = 'nodejs';

// ─── POST: Save a chat log ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, { limit: 10, windowSeconds: 60 });
    if (limited) return limited;

    let body;
    try {
      body = await req.json();
    } catch {
      throw AppError.badRequest('Invalid JSON');
    }

    const { sessionId, messages, userAgent } = body;

    if (!sessionId || !messages) {
      throw AppError.badRequest('sessionId and messages are required');
    }

    // Compute message stats
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

    const { error } = await supabaseAdmin.from('chat_logs').upsert(
      {
        session_id: sessionId,
        messages: typeof messages === 'string' ? messages : JSON.stringify(messages),
        user_agent: userAgent,
        message_count: msgCount,
        user_message_count: userCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    if (error) {
      console.error('Chat log save error:', error.message);
      throw AppError.internal('Failed to save chat log');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── GET: List chat logs (admin only) ───────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    const sortBy = searchParams.get('sort_by') || 'updated_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false;

    const allowedSorts = ['created_at', 'updated_at', 'message_count', 'user_message_count'];
    const actualSortBy = allowedSorts.includes(sortBy) ? sortBy : 'updated_at';

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const minMessages = searchParams.get('min_messages');
    const maxMessages = searchParams.get('max_messages');
    const searchText = searchParams.get('search')?.trim();

    let query = supabaseAdmin.from('chat_logs').select('*', { count: 'exact' });

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    if (minMessages) query = query.gte('message_count', parseInt(minMessages));
    if (maxMessages) query = query.lte('message_count', parseInt(maxMessages));

    if (searchText) {
      // Apply search if needed — depends on table structure
    }

    const { data, error, count } = await query
      .order(actualSortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Chat log fetch error:', error.message);
      throw AppError.internal('Failed to fetch chat logs');
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
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── DELETE: Delete chat log(s) ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyAdmin(req);
    if (!user) throw AppError.unauthorized();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      const { error } = await supabaseAdmin
        .from('chat_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw AppError.internal('Failed to clear logs');
      return NextResponse.json({ success: true, message: 'All logs cleared' });
    }

    if (!id) {
      throw AppError.badRequest('id or ?all=true required');
    }

    const { error } = await supabaseAdmin.from('chat_logs').delete().eq('id', id);
    if (error) throw AppError.internal('Failed to delete log');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
