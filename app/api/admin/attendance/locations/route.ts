import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { data: locations, error } = await supabaseAdmin
      .from('geofence_locations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw AppError.internal('Failed to fetch locations');
    }

    return NextResponse.json({ locations: locations || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

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

    const { name, latitude, longitude, radius_meters, is_active } = body;

    if (!name || latitude === undefined || longitude === undefined) {
      throw AppError.badRequest('Name, latitude, and longitude are required');
    }

    const { data: location, error } = await supabaseAdmin
      .from('geofence_locations')
      .insert({
        name,
        latitude,
        longitude,
        radius_meters: radius_meters || 200,
        is_active: is_active ?? true,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw AppError.internal('Failed to create geofence location');
    }

    await supabaseAdmin.from('activity_logs').insert({
      user_id: admin.id,
      action_type: 'location_created',
      description: `Geofence location "${name}" added`,
    });

    return NextResponse.json({ success: true, location }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
