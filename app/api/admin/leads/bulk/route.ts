import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadInteractionsStore } from '@/src/lib/leads/leadInteractionsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BulkLeadRequestBody {
  phone_numbers?: string[];
  action: 'reassign' | 'stage' | 'revert';
  advisor_id?: string | null;
  advisor_name?: string | null;
  stage?: string;
  notification_id?: string;
  previous_assignments?: Array<{
    phone: string;
    advisor_id: string | null;
    advisor_name?: string | null;
  }>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body: BulkLeadRequestBody = await request.json().catch(() => null);
    if (!body || !body.action) {
      throw AppError.badRequest('Action is required');
    }

    // -------------------------------------------------------------
    // ACTION: REVERT (Restore previous assignments from notification or payload)
    // -------------------------------------------------------------
    if (body.action === 'revert') {
      let prevAssignments = body.previous_assignments;
      const notifId = body.notification_id || null;

      if (!prevAssignments && notifId) {
        const { data: notif, error: notifErr } = await supabaseAdmin
          .from('notifications')
          .select('*')
          .eq('id', notifId)
          .single();

        if (notifErr || !notif) {
          throw AppError.notFound('Notification not found for revert');
        }

        if (notif.metadata?.reverted === true) {
          return NextResponse.json({
            success: false,
            message: 'This assignment has already been reverted',
            already_reverted: true,
          });
        }

        prevAssignments = notif.metadata?.previous_assignments as Array<{
          phone: string;
          advisor_id: string | null;
          advisor_name?: string | null;
        }>;
      }

      if (!Array.isArray(prevAssignments) || prevAssignments.length === 0) {
        throw AppError.badRequest('No previous assignments found to revert');
      }

      // Group by previous advisor to run clean batch updates
      const advisorGroups = new Map<
        string,
        { advisor_id: string | null; advisor_name: string | null; phones: string[] }
      >();

      for (const item of prevAssignments) {
        const cleanPhone = item.phone.replace(/\D/g, '').slice(-10);
        if (!cleanPhone) continue;
        const key = item.advisor_id || 'unassigned';
        if (!advisorGroups.has(key)) {
          advisorGroups.set(key, {
            advisor_id: item.advisor_id || null,
            advisor_name: item.advisor_name || null,
            phones: [],
          });
        }
        advisorGroups.get(key)!.phones.push(cleanPhone);
      }

      for (const group of Array.from(advisorGroups.values())) {
        if (group.phones.length === 0) continue;

        // 1. Restore chat_leads
        await supabaseAdmin
          .from('chat_leads')
          .update({
            assigned_to: group.advisor_id,
            updated_at: new Date().toISOString(),
          })
          .in('phone', group.phones);

        // 2. Restore ivr_call_records
        await supabaseAdmin
          .from('ivr_call_records')
          .update({
            assigned_agent_id: group.advisor_id,
            agent_name: group.advisor_name,
          })
          .in('customer_phone', group.phones);

        // 3. Log interaction
        await Promise.allSettled(
          group.phones.map((phone) =>
            leadInteractionsStore.recordInteraction({
              lead_phone: phone,
              advisor_id: group.advisor_id,
              advisor_name: group.advisor_name || 'Unassigned',
              type: 'reassigned',
              content: `Bulk assignment reverted back to ${group.advisor_name || 'Unassigned'}`,
            })
          )
        );
      }

      // Update notification record if present
      if (notifId) {
        await supabaseAdmin
          .from('notifications')
          .update({
            message: `Bulk assignment of ${prevAssignments.length} leads was successfully reverted.`,
            metadata: {
              action_type: 'bulk_reassign',
              reverted: true,
              reverted_at: new Date().toISOString(),
              restored_count: prevAssignments.length,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', notifId);
      }

      return NextResponse.json({
        success: true,
        action: 'revert',
        restored_count: prevAssignments.length,
      });
    }

    // For reassign and stage, phone_numbers array is required
    if (!Array.isArray(body.phone_numbers) || body.phone_numbers.length === 0) {
      throw AppError.badRequest('Array of phone_numbers is required');
    }

    const cleanPhones = Array.from(
      new Set(body.phone_numbers.map((p) => p.replace(/\D/g, '').slice(-10)).filter(Boolean))
    );

    if (cleanPhones.length === 0) {
      throw AppError.badRequest('No valid phone numbers found in payload');
    }

    // -------------------------------------------------------------
    // ACTION: REASSIGN (Assign to advisor + capture previous assignments + create revert notification)
    // -------------------------------------------------------------
    if (body.action === 'reassign') {
      const advisorId = body.advisor_id || null;
      const advisorName = body.advisor_name || 'Staff Advisor';

      // 0. Capture previous assignments snapshot for safe reverting
      const { data: existingRecords } = await supabaseAdmin
        .from('ivr_call_records')
        .select('customer_phone, assigned_agent_id, agent_name')
        .in('customer_phone', cleanPhones);

      const phoneToExisting = new Map<
        string,
        { advisor_id: string | null; advisor_name: string | null }
      >();
      if (existingRecords) {
        for (const rec of existingRecords) {
          if (!phoneToExisting.has(rec.customer_phone)) {
            phoneToExisting.set(rec.customer_phone, {
              advisor_id: rec.assigned_agent_id || null,
              advisor_name: rec.agent_name || null,
            });
          }
        }
      }

      const previousAssignments = cleanPhones.map((phone) => {
        const existing = phoneToExisting.get(phone);
        return {
          phone,
          advisor_id: existing?.advisor_id ?? null,
          advisor_name: existing?.advisor_name ?? null,
        };
      });

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

      // 4. Create in-app Notification with Revert capability
      let notificationId: string | null = null;
      try {
        const { data: notifData } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: admin.id,
            type: 'info',
            title: `Bulk Assigned ${cleanPhones.length} Leads`,
            message: `Assigned ${cleanPhones.length} leads to ${advisorName}. Click Revert Assignment if this was done by mistake.`,
            action_url: '/admin/leads?tab=ivr',
            metadata: {
              action_type: 'bulk_reassign',
              advisor_id: advisorId,
              advisor_name: advisorName,
              phone_count: cleanPhones.length,
              previous_assignments: previousAssignments,
              reverted: false,
              created_at: new Date().toISOString(),
            },
          })
          .select('id')
          .single();

        notificationId = notifData?.id ?? null;
      } catch (notifErr) {
        console.warn('Failed to create revert notification:', notifErr);
      }

      return NextResponse.json({
        success: true,
        action: 'reassign',
        affected_count: cleanPhones.length,
        advisor_name: advisorName,
        notification_id: notificationId,
        previous_assignments: previousAssignments,
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
