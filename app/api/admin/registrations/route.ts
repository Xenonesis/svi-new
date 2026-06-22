import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

const VALID_STATUSES = ['pending', 'contacted', 'approved', 'rejected'];

// GET /api/admin/registrations — list all registrations with pagination, search, filters, sort
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

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
      .select(
        'id,submission_id,name,last_name,email,phone,so_wo_do,preferred_date,aadhar_number,pan_number,photo_url,pan_card_file_url,state,city,address,advisor_name,project,property_size,property_type,plot_preference,payment_plan,payment_mode,scheme_amount,property_interest,message,status,is_important,created_at',
        { count: 'exact' }
      )
      .order(sortCol, { ascending })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `submission_id.ilike.%${search}%,name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,aadhar_number.ilike.%${search}%,advisor_name.ilike.%${search}%,project.ilike.%${search}%`
      );
    }
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

    if (error) throw AppError.internal(error.message);

    return NextResponse.json({
      registrations: data,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/registrations — update registration status or importance
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: { id?: string; status?: string; is_important?: boolean };
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { id, status: newStatus, is_important } = body;
    if (!id) throw AppError.badRequest('id is required');

    const updatePayload: any = {};
    if (newStatus !== undefined) {
      if (!VALID_STATUSES.includes(newStatus)) {
        throw AppError.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      }
      updatePayload.status = newStatus;
    }
    if (is_important !== undefined) {
      updatePayload.is_important = is_important;
    }
    if (Object.keys(updatePayload).length === 0) {
      throw AppError.badRequest('No update parameters provided');
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw AppError.internal(error.message);

    try {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      const adminName = profileData?.full_name || admin.email || 'Admin';
      if (newStatus) {
        await NotificationHelper.registrationStatusUpdated(id, newStatus, adminName);
      }
    } catch (notifErr) {
      console.error('[Registration] Notification error:', notifErr);
    }

    return NextResponse.json({ success: true, registration: data });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/registrations — delete a registration
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw AppError.badRequest('id is required');

    const { error } = await supabaseAdmin.from('registrations').delete().eq('id', id);

    if (error) throw AppError.internal(error.message);

    try {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      await NotificationHelper.registrationDeleted(
        id,
        profileData?.full_name || admin.email || 'Admin'
      );
    } catch (notifErr) {
      console.error('[Registration] Delete notification error:', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
