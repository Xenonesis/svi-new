import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { getNextQuotationNumberFromDb } from '@/src/lib/quotation/quotationNumber';

// GET /api/admin/quotation/next-number — get next auto-generated unique quotation number from DB
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    const quotationNo = await getNextQuotationNumberFromDb(supabaseAdmin, date);

    return NextResponse.json({ quotationNo });
  } catch (err) {
    return handleApiError(err);
  }
}
