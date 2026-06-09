import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/notifications
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const url = new URL(request.url);
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '50') || 50);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const userId = url.searchParams.get('userId');

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) query = query.eq('is_read', false);

    let countQuery = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
      countQuery = countQuery.or(`user_id.eq.${userId},user_id.is.null`);
    }

    const [{ data: notifications, error }, { count: unreadCount }] = await Promise.all([
      query,
      countQuery,
    ]);

    if (error) throw AppError.internal('Failed to fetch notifications');

    return NextResponse.json({ notifications: notifications || [], unreadCount: unreadCount || 0 });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/notifications — create a notification
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { type, title, message, user_id, metadata, priority = 'normal' } = body;

    if (!type || !title || !message) {
      throw AppError.badRequest('type, title, and message are required');
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        type,
        title,
        message,
        user_id: user_id || null,
        metadata: metadata || {},
        priority,
      })
      .select()
      .single();

    if (error) throw AppError.internal('Failed to create notification');

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
