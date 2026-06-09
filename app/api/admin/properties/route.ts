import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/properties
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw AppError.internal('Failed to fetch properties');
    return NextResponse.json({ properties: properties || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/properties
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

    const { id, name, slug, active } = body;
    if (!name || !slug) throw AppError.badRequest('Name and slug are required');

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';

    let result: any;
    let actionType = 'property_created';

    if (id) {
      actionType = 'property_updated';
      const { data, error } = await supabaseAdmin
        .from('properties')
        .update({
          name,
          slug,
          active: active !== undefined ? active : true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert({ name, slug, active: active !== undefined ? active : true })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: actionType,
        description: `${adminName} ${actionType === 'property_created' ? 'created' : 'updated'} property: ${name}.`,
        metadata: { event: actionType, propertyName: name, propertyId: result.id },
      });
    } catch (logErr) {
      console.error('Failed to log property activity:', logErr);
    }

    try {
      if (id) await NotificationHelper.propertyUpdated(name, adminName);
      else await NotificationHelper.propertyCreated(name, adminName);
    } catch (notifErr) {
      console.error('Failed to create property notification:', notifErr);
    }

    return NextResponse.json({ success: true, property: result });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/properties
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw AppError.badRequest('Property ID is required');

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', admin.id)
      .single();
    const adminName = profile?.full_name || admin.email || 'Admin';

    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('name')
      .eq('id', id)
      .single();
    const propertyName = property?.name || 'Unknown Property';

    const { error } = await supabaseAdmin.from('properties').delete().eq('id', id);
    if (error) throw error;

    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'property_deleted',
        description: `${adminName} deleted property: ${propertyName}.`,
        metadata: { event: 'property_deleted', propertyName, propertyId: id },
      });
    } catch (logErr) {
      console.error('Failed to log property deletion activity:', logErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
