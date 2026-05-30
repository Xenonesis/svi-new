import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

const VALID_STATUSES = ['pending', 'contacted', 'approved', 'rejected'];

// GET /api/admin/registrations — list all registrations with pagination, search, filters, sort
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Auto-cleanup of registrations older than 30 days, unless marked important ──
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error: cleanupError } = await supabaseAdmin
      .from('registrations')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .or('is_important.eq.false,is_important.is.null');

    if (cleanupError) {
      console.error('[Registration Cleanup Error]:', cleanupError.message);
    }
  } catch (cleanupErr) {
    console.error('[Registration Cleanup Exception]:', cleanupErr);
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const offset = (page - 1) * limit;

  // Filter params
  const project = searchParams.get('project') || '';
  const advisor = searchParams.get('advisor') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const propertySize = searchParams.get('propertySize') || '';
  const plotPreference = searchParams.get('plotPreference') || '';
  const paymentPlan = searchParams.get('paymentPlan') || '';
  const paymentMode = searchParams.get('paymentMode') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const status = searchParams.get('status') || '';

  // Whitelist sort columns
  const allowedSort = new Set([
    'created_at',
    'submission_id',
    'name',
    'project',
    'advisor_name',
    'property_type',
    'scheme_amount',
    'status',
  ]);
  const sortCol = allowedSort.has(sortBy) ? sortBy : 'created_at';
  const ascending = sortOrder === 'asc';

  let query = supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact' })
    .order(sortCol, { ascending })
    .range(offset, offset + limit - 1);

  // Text search
  if (search) {
    query = query.or(
      `submission_id.ilike.%${search}%,name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,aadhar_number.ilike.%${search}%,advisor_name.ilike.%${search}%,project.ilike.%${search}%`
    );
  }

  // Filters
  if (project) query = query.eq('project', project);
  if (advisor) query = query.eq('advisor_name', advisor);
  if (propertyType) query = query.eq('property_type', propertyType);
  if (propertySize) query = query.eq('property_size', propertySize);
  if (plotPreference) query = query.eq('plot_preference', plotPreference);
  if (paymentPlan) query = query.eq('payment_plan', paymentPlan);
  if (paymentMode) query = query.eq('payment_mode', paymentMode);
  if (status) query = query.eq('status', status);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    registrations: data,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  });
}

// PATCH /api/admin/registrations — update registration status or importance
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { id?: string; status?: string; is_important?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { id, status: newStatus, is_important } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updatePayload: any = {};
  if (newStatus !== undefined) {
    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }
    updatePayload.status = newStatus;
  }
  if (is_important !== undefined) {
    updatePayload.is_important = is_important;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'No update parameters provided' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, registration: data });
}

// DELETE /api/admin/registrations — delete a registration
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('registrations').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
