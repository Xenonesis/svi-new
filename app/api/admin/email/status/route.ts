import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const apiKey = process.env.RESEND_API_KEY;
    return NextResponse.json({
      configured: !!apiKey,
      keyPreview: apiKey ? `${apiKey.slice(0, 8)}...` : null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
