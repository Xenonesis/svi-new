import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { regularizationStore } from '@/src/lib/attendance/regularizationStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('user_id') || undefined;

    const regularizations = await regularizationStore.getAllRegularizations({
      status,
      userId,
    });

    const pendingCount = regularizations.filter((r) => r.status === 'pending').length;
    const approvedCount = regularizations.filter((r) => r.status === 'approved').length;
    const rejectedCount = regularizations.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      regularizations,
      stats: {
        total: regularizations.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
