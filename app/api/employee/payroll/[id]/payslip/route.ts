import { NextRequest, NextResponse } from 'next/server';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view payslip');
    }

    const { id } = await params;
    const result = await payrollStore.getEmployeePayslipDetail(verified.user.id, id);

    if (!result.allowed || !result.item) {
      return NextResponse.json(
        {
          success: false,
          locked: true,
          message: result.message || 'Payslip download is strictly locked until allowed by Admin.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      locked: false,
      item: result.item,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
