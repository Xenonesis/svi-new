import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { NotificationHelper } from '@/src/lib/supabase/notifications';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { propertyRepository, userRepository } from '@/src/lib/repositories';

// GET /api/admin/properties
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: properties, error } = await propertyRepository.listAll();
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

    const adminName = await userRepository.getAdminName(admin.id);

    let result: any;
    let actionType = 'property_created';

    if (id) {
      actionType = 'property_updated';
      const { data, error } = await propertyRepository.update(id, {
        name,
        slug,
        updated_at: new Date().toISOString(),
        active: active !== undefined ? active : true,
      } as any);
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await propertyRepository.create({
        name,
        slug,
        active: active !== undefined ? active : true,
      });
      if (error) throw error;
      result = data;
    }

    // Log activity
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

    const adminName = await userRepository.getAdminName(admin.id);

    const { data: property } = await propertyRepository.getById(id);
    const propertyName = property?.name || 'Unknown Property';

    const { error } = await propertyRepository.delete(id);
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
