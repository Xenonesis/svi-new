import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadInteractionsStore, LeadInteractionType } from '@/src/lib/leads/leadInteractionsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    phone: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { phone } = await context.params;
    if (!phone) {
      throw AppError.badRequest('Phone parameter is required');
    }

    const interactions = await leadInteractionsStore.getInteractions(phone);

    return NextResponse.json({
      success: true,
      phone,
      interactions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { phone } = await context.params;
    if (!phone) {
      throw AppError.badRequest('Phone parameter is required');
    }

    const body = await request.json().catch(() => null);
    if (!body?.type || !body?.content) {
      throw AppError.badRequest('Interaction type and content are required');
    }

    const validTypes: LeadInteractionType[] = [
      'note',
      'call_logged',
      'follow_up_scheduled',
      'whatsapp_sent',
      'visit_booked',
      'stage_changed',
      'reassigned',
    ];

    if (!validTypes.includes(body.type)) {
      throw AppError.badRequest(`Invalid interaction type: ${body.type}`);
    }

    const interaction = await leadInteractionsStore.recordInteraction({
      lead_phone: phone,
      advisor_id: body.advisor_id || admin.id,
      advisor_name: body.advisor_name || 'Admin',
      type: body.type,
      content: String(body.content).trim(),
      metadata: body.metadata || {},
    });

    return NextResponse.json({
      success: true,
      interaction,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
