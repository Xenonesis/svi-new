import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const payrolls = await payrollStore.getMonthlyPayrolls();
    return NextResponse.json({ success: true, payrolls });
  } catch (err) {
    return handleApiError(err);
  }
}
