import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view site visits');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('whatsapp_site_visit_requests')
      .select(
        '*, contact:whatsapp_contacts(name, phone), conversation:whatsapp_conversations(project_id)'
      )
      .eq('assigned_to', verified.user.id);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: visits, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching site visits:', error);
      throw AppError.internal('Failed to fetch site visits');
    }

    return NextResponse.json({ visits: visits || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to update site visit');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Site visit ID is required');
    }

    const { id, status, notes, confirmed_date } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      const validStatuses = ['requested', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.status = status;
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      }
    }

    if (confirmed_date) updates.confirmed_date = confirmed_date;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error } = await supabaseAdmin
      .from('whatsapp_site_visit_requests')
      .update(updates)
      .eq('id', id)
      .eq('assigned_to', verified.user.id)
      .select()
      .single();

    if (error || !updated) {
      throw AppError.badRequest('Site visit not found or update failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Site visit updated successfully',
      visit: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
