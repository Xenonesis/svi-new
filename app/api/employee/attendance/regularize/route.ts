import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view regularization requests');
    }

    const { data: regularizations, error } = await supabaseAdmin
      .from('attendance_regularizations')
      .select('*')
      .eq('user_id', verified.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching regularizations:', error);
      throw AppError.internal('Failed to fetch regularization requests');
    }

    return NextResponse.json({ regularizations: regularizations || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to submit regularization');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      throw AppError.badRequest('Invalid request body');
    }

    const { date, punch_type, suggested_time, reason } = body;

    if (!date || !punch_type || !suggested_time || !reason) {
      throw AppError.badRequest(
        'Missing required fields: date, punch_type, suggested_time, reason'
      );
    }

    const validTypes = ['punch_in', 'punch_out', 'full_day'];
    if (!validTypes.includes(punch_type)) {
      throw AppError.badRequest(`Invalid punch_type. Must be one of: ${validTypes.join(', ')}`);
    }

    const { data: record, error } = await supabaseAdmin
      .from('attendance_regularizations')
      .insert({
        user_id: verified.user.id,
        date,
        punch_type,
        suggested_time,
        reason: reason.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting regularization:', error);
      throw AppError.internal('Failed to submit regularization request');
    }

    return NextResponse.json({
      success: true,
      message: 'Regularization request submitted successfully',
      regularization: record,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
