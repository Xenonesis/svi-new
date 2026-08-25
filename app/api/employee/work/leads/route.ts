import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view leads');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin.from('chat_leads').select('*').eq('assigned_to', verified.user.id);

    if (status && status !== 'all') {
      query = query.eq('lifecycle_status', status);
    }

    const { data: leads, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw AppError.internal('Failed to fetch assigned leads');
    }

    return NextResponse.json({ leads: leads || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to update lead');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Lead ID is required');
    }

    const { id, lifecycle_status, notes, summary, temperature } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (lifecycle_status) updates.lifecycle_status = lifecycle_status;
    if (temperature) updates.temperature = temperature;
    if (summary !== undefined) updates.summary = summary;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error } = await supabaseAdmin
      .from('chat_leads')
      .update(updates)
      .eq('id', id)
      .eq('assigned_to', verified.user.id)
      .select()
      .single();

    if (error || !updated) {
      throw AppError.badRequest('Lead not found or update failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
