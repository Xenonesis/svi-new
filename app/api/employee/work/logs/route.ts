import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view work logs');
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let query = supabaseAdmin
      .from('employee_work_logs')
      .select('*')
      .eq('user_id', verified.user.id);

    if (date) {
      query = query.eq('date', date);
    }

    const { data: logs, error } = await query.order('date', { ascending: false }).limit(30);

    if (error) {
      console.error('Error fetching work logs:', error);
      throw AppError.internal('Failed to fetch work logs');
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to submit work log');
    }

    const body = await request.json().catch(() => null);
    if (!body?.summary) {
      throw AppError.badRequest('Work summary is required');
    }

    const {
      summary,
      tasks_completed = [],
      client_interactions_count = 0,
      site_visits_conducted_count = 0,
      attendance_record_id,
      date = new Date().toISOString().split('T')[0],
    } = body;

    const { data: workLog, error } = await supabaseAdmin
      .from('employee_work_logs')
      .insert({
        user_id: verified.user.id,
        attendance_record_id: attendance_record_id || null,
        date,
        summary: summary.trim(),
        tasks_completed,
        client_interactions_count: Number(client_interactions_count) || 0,
        site_visits_conducted_count: Number(site_visits_conducted_count) || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting work log:', error);
      throw AppError.internal('Failed to submit work log');
    }

    return NextResponse.json({
      success: true,
      message: 'Work log submitted successfully',
      log: workLog,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
