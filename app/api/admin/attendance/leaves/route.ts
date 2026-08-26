import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leaveStore } from '@/src/lib/attendance/leaveStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('user_id') || undefined;

    const leaves = await leaveStore.getAllLeaves({
      status,
      userId,
    });

    const pendingCount = leaves.filter((l) => l.status === 'pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'approved').length;
    const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

    return NextResponse.json({
      leaves,
      stats: {
        total: leaves.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
