import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const { id } = await params;
    const body = await request.json();

    if (body.allow === undefined) {
      throw AppError.badRequest('allow boolean flag is required');
    }

    const result = await payrollStore.togglePayslipDownload(id, {
      allowAll: body.allowAll,
      itemId: body.itemId,
      allow: Boolean(body.allow),
    });

    const statusMsg = body.allow
      ? 'enabled (Employees can download)'
      : 'locked (Employees cannot download)';
    return NextResponse.json({
      message: `Payslip download permission has been ${statusMsg}`,
      ...result,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
