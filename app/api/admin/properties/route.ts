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

    const mappedProperties = (properties || []).map((p) => {
      let legalHi = (p as any).legal_location_hi || '';
      let legalEn = (p as any).legal_location_en || '';
      if (!legalHi && !legalEn && p.location) {
        try {
          const parsed = JSON.parse(p.location);
          legalHi = parsed.legalHi || parsed.legal_location_hi || '';
          legalEn = parsed.legalEn || parsed.legal_location_en || '';
        } catch {
          legalHi = p.location;
          legalEn = p.location;
        }
      }
      return {
        ...p,
        legal_location_hi: legalHi,
        legal_location_en: legalEn,
      };
    });

    return NextResponse.json({ properties: mappedProperties });
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

    const { id, name, slug, active, legal_location_hi, legal_location_en } = body;
    if (!name || !slug) throw AppError.badRequest('Name and slug are required');

    const adminName = await userRepository.getAdminName(admin.id);

    let locationPayload: string | undefined = undefined;
    if (legal_location_hi !== undefined || legal_location_en !== undefined) {
      locationPayload = JSON.stringify({
        legalHi: legal_location_hi?.trim() || '',
        legalEn: legal_location_en?.trim() || '',
      });
    }

    let result: any;
    let actionType = 'property_created';

    const updatePayload: any = {
      name,
      slug,
      updated_at: new Date().toISOString(),
      active: active !== undefined ? active : true,
    };
    if (locationPayload !== undefined) {
      updatePayload.location = locationPayload;
    }

    if (id) {
      actionType = 'property_updated';
      const { data, error } = await propertyRepository.update(id, updatePayload);
      if (error) throw error;
      result = data;
    } else {
      const createPayload: any = {
        name,
        slug,
        active: active !== undefined ? active : true,
      };
      if (locationPayload !== undefined) {
        createPayload.location = locationPayload;
      }
      const { data, error } = await propertyRepository.create(createPayload);
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
