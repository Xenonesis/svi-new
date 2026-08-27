import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const body = await request.json();
    if (!body.month_year || !/^\d{4}-\d{2}$/.test(body.month_year)) {
      throw AppError.badRequest('Valid month_year in YYYY-MM format is required (e.g. 2026-08)');
    }

    const result = await payrollStore.calculateMonthlyPayroll(
      {
        month_year: body.month_year,
        total_month_days: body.total_month_days ? Number(body.total_month_days) : undefined,
        working_days: body.working_days ? Number(body.working_days) : undefined,
      },
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Payroll calculated successfully for ${body.month_year}`,
      payroll: result.payroll,
      items: result.items,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
