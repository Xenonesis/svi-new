import { NextRequest, NextResponse } from 'next/server';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view payroll information');
    }

    const data = await payrollStore.getEmployeePayrollOverview(verified.user.id);

    return NextResponse.json({
      success: true,
      salaryStructure: data.salaryStructure,
      payrolls: data.payrolls,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
