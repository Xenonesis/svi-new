import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const { id } = await params;
    const data = await payrollStore.getMonthlyPayrollById(id);

    if (!data) {
      throw AppError.notFound('Payroll run not found');
    }

    return NextResponse.json({
      success: true,
      payroll: data.payroll,
      items: data.items,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
