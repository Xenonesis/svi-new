import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadInteractionsStore } from '@/src/lib/leads/leadInteractionsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BulkLeadRequestBody {
  phone_numbers: string[];
  action: 'reassign' | 'stage';
  advisor_id?: string;
  advisor_name?: string;
  stage?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body: BulkLeadRequestBody = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.phone_numbers) || body.phone_numbers.length === 0) {
      throw AppError.badRequest('Array of phone_numbers is required');
    }

    const cleanPhones = Array.from(
      new Set(body.phone_numbers.map((p) => p.replace(/\D/g, '').slice(-10)).filter(Boolean))
    );

    if (cleanPhones.length === 0) {
      throw AppError.badRequest('No valid phone numbers found in payload');
    }

    if (body.action === 'reassign') {
      const advisorId = body.advisor_id || null;
      const advisorName = body.advisor_name || 'Staff Advisor';

      // 1. Update chat_leads
      const { error: chatLeadError } = await supabaseAdmin
        .from('chat_leads')
        .update({
          assigned_to: advisorId,
          updated_at: new Date().toISOString(),
        })
        .in('phone', cleanPhones);

      if (chatLeadError) {
        console.warn('Bulk reassign chat_leads error:', chatLeadError.message);
      }

      // 2. Update ivr_call_records
      const { error: ivrError } = await supabaseAdmin
        .from('ivr_call_records')
        .update({
          assigned_agent_id: advisorId,
          agent_name: advisorName,
        })
        .in('customer_phone', cleanPhones);

      if (ivrError) {
        console.warn('Bulk reassign ivr_call_records error:', ivrError.message);
      }

      // 3. Log interaction timeline for each
      await Promise.allSettled(
        cleanPhones.map((phone) =>
          leadInteractionsStore.recordInteraction({
            lead_phone: phone,
            advisor_id: advisorId,
            advisor_name: advisorName,
            type: 'reassigned',
            content: `Reassigned to ${advisorName}`,
          })
        )
      );

      return NextResponse.json({
        success: true,
        action: 'reassign',
        affected_count: cleanPhones.length,
        advisor_name: advisorName,
      });
    }

    if (body.action === 'stage') {
      const stage = body.stage;
      if (!stage) throw AppError.badRequest('stage is required for stage update action');

      // 1. Update chat_leads
      const { error: chatLeadError } = await supabaseAdmin
        .from('chat_leads')
        .update({
          pipeline_stage: stage,
          updated_at: new Date().toISOString(),
        })
        .in('phone', cleanPhones);

      if (chatLeadError) {
        console.warn('Bulk stage chat_leads error:', chatLeadError.message);
      }

      // 2. Update ivr_call_records
      await supabaseAdmin
        .from('ivr_call_records')
        .update({
          pipeline_stage: stage,
        })
        .in('customer_phone', cleanPhones);

      // 3. Log interaction timeline
      await Promise.allSettled(
        cleanPhones.map((phone) =>
          leadInteractionsStore.recordInteraction({
            lead_phone: phone,
            advisor_id: admin.id,
            advisor_name: 'Admin',
            type: 'stage_changed',
            content: `Bulk updated pipeline stage to ${stage}`,
            metadata: { stage },
          })
        )
      );

      return NextResponse.json({
        success: true,
        action: 'stage',
        affected_count: cleanPhones.length,
        stage,
      });
    }

    throw AppError.badRequest(`Unknown bulk action: ${body.action}`);
  } catch (error) {
    return handleApiError(error);
  }
}
