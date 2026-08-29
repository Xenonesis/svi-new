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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const structure = await payrollStore.getSalaryStructureByUserId(userId);
      return NextResponse.json({ success: true, structure });
    }

    const structures = await payrollStore.getSalaryStructures();
    return NextResponse.json({ success: true, structures });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin access required');
    }

    const body = await request.json();
    if (!body.user_id) {
      throw AppError.badRequest('user_id is required');
    }

    const saved = await payrollStore.upsertSalaryStructure(body);
    return NextResponse.json({
      success: true,
      message: 'Salary structure saved successfully',
      structure: saved,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
