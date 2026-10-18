import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { payrollStore } from '@/src/lib/payroll/payrollStore';
import { getEmployeeOfferLetterMap } from '@/src/lib/payroll/offerLetterSync';
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
      const [structure, offerMap] = await Promise.all([
        payrollStore.getSalaryStructureByUserId(userId),
        getEmployeeOfferLetterMap().catch(() => new Map()),
      ]);
      const matchedOffer = offerMap.get(userId) || null;
      return NextResponse.json({ success: true, structure, matchedOffer });
    }

    const [structures, offerMap] = await Promise.all([
      payrollStore.getSalaryStructures(),
      getEmployeeOfferLetterMap().catch(() => new Map()),
    ]);
    const offerMapObj = Object.fromEntries(offerMap);
    return NextResponse.json({ success: true, structures, offerMap: offerMapObj });
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
