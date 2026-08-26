import { NextRequest, NextResponse } from 'next/server';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadActivityStore } from '@/src/lib/leads/leadActivityStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view lead activities');
    }

    const { id } = await params;
    if (!id) {
      throw AppError.badRequest('Lead ID is required');
    }

    const activities = await leadActivityStore.getLeadActivities(id);

    return NextResponse.json({
      success: true,
      lead_id: id,
      activities: activities || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}
