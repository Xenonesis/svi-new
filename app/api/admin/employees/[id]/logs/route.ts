import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    const { data: logs, error } = await supabaseAdmin
      .from('employee_work_logs')
      .select('*')
      .eq('user_id', employeeId)
      .order('date', { ascending: false })
      .limit(60);

    if (error) {
      throw AppError.internal(error.message || 'Failed to fetch employee work logs');
    }

    const normalizedLogs = (logs || []).map((l: Record<string, unknown>) => ({
      ...l,
      summary:
        (typeof l.summary === 'string' ? l.summary : '') ||
        (typeof l.summary_text === 'string' ? l.summary_text : ''),
      summary_text:
        (typeof l.summary_text === 'string' ? l.summary_text : '') ||
        (typeof l.summary === 'string' ? l.summary : ''),
    }));

    return NextResponse.json({
      success: true,
      employee_id: employeeId,
      logs: normalizedLogs,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
