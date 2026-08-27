import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const { itemId } = await params;
    const body = await request.json();

    const updated = await payrollStore.updatePayrollItem(itemId, body);

    if (!updated) {
      throw AppError.notFound('Payroll item not found');
    }

    return NextResponse.json({
      success: true,
      message: 'Payroll item updated successfully',
      item: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
