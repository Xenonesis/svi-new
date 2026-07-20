import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    const { error } = await supabaseAdmin.from('geofence_locations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      throw AppError.internal('Failed to delete location');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const { is_active } = body;

    const { data: updated, error } = await supabaseAdmin
      .from('geofence_locations')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      throw AppError.internal('Failed to update location');
    }

    return NextResponse.json({ success: true, location: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
