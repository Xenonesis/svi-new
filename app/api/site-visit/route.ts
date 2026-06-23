import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { rateLimit } from '@/src/lib/api/rateLimit';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/site-visit — list site visit leads
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50') || 50);
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('chat_leads')
      .select('*', { count: 'exact' })
      .eq('source', 'site_visit')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw AppError.internal(error.message);

    return NextResponse.json({
      leads: data,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/site-visit — create site visit lead
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { limit: 3, windowSeconds: 60 });
    if (limited) return limited;

    let body;
    try {
      body = await req.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { name, phone, email, project_interest, preferred_date } = body;

    if (!name?.trim() || !phone?.trim() || !email?.trim()) {
      throw AppError.badRequest('Name, phone, and email are required');
    }

    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^\+?91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw AppError.badRequest('Invalid phone number');
    }

    const { data, error } = await supabaseAdmin
      .from('chat_leads')
      .insert({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim(),
        project_interest: project_interest?.trim() || null,
        preferred_date: preferred_date || null,
        source: 'site_visit',
      })
      .select()
      .single();

    if (error) {
      console.error('Site visit lead save error:', error.message);
      throw AppError.internal('Failed to save booking');
    }

    NotificationHelper.chatLeadCreated(name.trim(), cleanPhone).catch((err) =>
      console.error('Failed to send site visit notification:', err)
    );

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/site-visit?id=xxx — delete a site visit lead
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw AppError.badRequest('id is required');

    const { error } = await supabaseAdmin.from('chat_leads').delete().eq('id', id);

    if (error) throw AppError.internal(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
