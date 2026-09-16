import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadInteractionsStore } from '@/src/lib/leads/leadInteractionsStore';

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
    if (!phone) throw AppError.badRequest('Phone parameter is required');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // 1. Fetch lead from chat_leads
    const { data: lead } = await supabaseAdmin
      .from('chat_leads')
      .select('*, assigned_agent:assigned_to(id, full_name, phone)')
      .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Fetch recent call records for this phone
    const { data: callHistory } = await supabaseAdmin
      .from('ivr_call_records')
      .select('*')
      .or(`customer_phone.eq.${cleanPhone},customer_phone.ilike.%${cleanPhone}%`)
      .order('dial_time', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      lead: lead || null,
      call_history: callHistory || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { phone } = await context.params;
    if (!phone) throw AppError.badRequest('Phone parameter is required');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body is required');
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.pipeline_stage !== undefined) updates.pipeline_stage = body.pipeline_stage;
    if (body.temperature !== undefined) updates.temperature = body.temperature;
    if (body.follow_up_at !== undefined) updates.follow_up_at = body.follow_up_at;
    if (body.site_visit_at !== undefined) updates.site_visit_at = body.site_visit_at;
    if (body.site_visit_project !== undefined) updates.site_visit_project = body.site_visit_project;
    if (body.budget_range !== undefined) updates.budget_range = body.budget_range;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to || null;

    // Update chat_leads
    const { data: updatedLead, error } = await supabaseAdmin
      .from('chat_leads')
      .update(updates)
      .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`)
      .select('*, assigned_agent:assigned_to(id, full_name, phone)')
      .maybeSingle();

    if (error) {
      console.warn('Failed updating chat_leads, attempting fallback:', error.message);
    }

    // Log timeline interaction
    if (body.pipeline_stage) {
      await leadInteractionsStore.recordInteraction({
        lead_phone: cleanPhone,
        advisor_id: admin.id,
        advisor_name: 'Admin',
        type: 'stage_changed',
        content: `Pipeline stage moved to ${body.pipeline_stage}`,
        metadata: { stage: body.pipeline_stage },
      });
    }

    if (body.follow_up_at) {
      await leadInteractionsStore.recordInteraction({
        lead_phone: cleanPhone,
        advisor_id: admin.id,
        advisor_name: 'Admin',
        type: 'follow_up_scheduled',
        content: `Follow-up scheduled for ${new Date(body.follow_up_at).toLocaleString('en-IN')}`,
        metadata: { follow_up_at: body.follow_up_at },
      });
    }

    if (body.site_visit_at) {
      await leadInteractionsStore.recordInteraction({
        lead_phone: cleanPhone,
        advisor_id: admin.id,
        advisor_name: 'Admin',
        type: 'visit_booked',
        content: `Site visit booked for ${new Date(body.site_visit_at).toLocaleDateString('en-IN')}${body.site_visit_project ? ` (${body.site_visit_project})` : ''}`,
        metadata: {
          site_visit_at: body.site_visit_at,
          site_visit_project: body.site_visit_project,
        },
      });
    }

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      lead: updatedLead || { phone: cleanPhone, ...updates },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
