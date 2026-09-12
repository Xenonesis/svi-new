import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadActivityStore } from '@/src/lib/leads/leadActivityStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const offset = (page - 1) * limit;

    const source = searchParams.get('source');
    const temperature = searchParams.get('temperature');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const q = searchParams.get('q')?.trim();

    // Base query for leads
    let query = supabaseAdmin
      .from('chat_leads')
      .select('*, profiles:assigned_to(id, full_name, email, phone)', { count: 'exact' });

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (temperature && temperature !== 'all') {
      query = query.eq('temperature', temperature);
    }
    if (status && status !== 'all') {
      query = query.eq('lifecycle_status', status);
    }
    if (assignedTo === 'unassigned') {
      query = query.is('assigned_to', null);
    } else if (assignedTo && assignedTo !== 'all') {
      query = query.eq('assigned_to', assignedTo);
    }
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%,project_interest.ilike.%${q}%`
      );
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    let { data, error, count } = await query;

    // Fallback if joined relation syntax fails
    if (error && error.message?.includes('profiles')) {
      const fallbackQuery = supabaseAdmin
        .from('chat_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const fallbackRes = await fallbackQuery;
      data = fallbackRes.data;
      error = fallbackRes.error;
      count = fallbackRes.count;

      // Populate assigned profiles manually
      if (data && data.length > 0) {
        const assignedIds = Array.from(new Set(data.map((l) => l.assigned_to).filter(Boolean)));
        if (assignedIds.length > 0) {
          const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, email, phone')
            .in('id', assignedIds);

          const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
          data = data.map((l) => ({
            ...l,
            profiles: l.assigned_to ? profileMap.get(l.assigned_to) || null : null,
          }));
        }
      }
    }

    if (error) {
      console.error('Error fetching admin chat leads:', error.message);
      throw AppError.internal('Failed to fetch leads');
    }

    const leads = data || [];
    const leadIds = leads.map((l: any) => l.id).filter(Boolean);

    // Batch fetch activities for all 25 leads in 1 single query (eliminates N+1 DB round-trips)
    const activitiesByLead: Record<string, { count: number; latest: any }> = {};
    if (leadIds.length > 0) {
      try {
        const { data: allActs } = await supabaseAdmin
          .from('lead_activities')
          .select('id, lead_id, title, notes, created_at')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false });

        if (allActs && allActs.length > 0) {
          for (const act of allActs) {
            if (!activitiesByLead[act.lead_id]) {
              activitiesByLead[act.lead_id] = { count: 0, latest: act };
            }
            activitiesByLead[act.lead_id].count += 1;
          }
        }
      } catch (err) {
        console.warn('Batch lead activities fetch warning:', err);
      }
    }

    const enrichedLeads = leads.map((lead: any) => {
      const actInfo = activitiesByLead[lead.id];
      return {
        ...lead,
        activities_count: actInfo?.count || 0,
        latest_activity: actInfo?.latest || null,
      };
    });

    // Global summary counts
    const [totalRes, unassignedRes, hotRes, chatbotRes, siteVisitRes] = await Promise.all([
      supabaseAdmin.from('chat_leads').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('chat_leads')
        .select('id', { count: 'exact', head: true })
        .is('assigned_to', null),
      supabaseAdmin
        .from('chat_leads')
        .select('id', { count: 'exact', head: true })
        .eq('temperature', 'hot'),
      supabaseAdmin
        .from('chat_leads')
        .select('id', { count: 'exact', head: true })
        .eq('source', 'chatbot'),
      supabaseAdmin
        .from('chat_leads')
        .select('id', { count: 'exact', head: true })
        .eq('source', 'site_visit'),
    ]);

    return NextResponse.json({
      success: true,
      leads: enrichedLeads,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
      counts: {
        total: totalRes.count || 0,
        unassigned: unassignedRes.count || 0,
        hot: hotRes.count || 0,
        chatbot: chatbotRes.count || 0,
        site_visits: siteVisitRes.count || 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Lead ID is required');
    }

    const leadId = String(body.id);
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Get current lead state for activity logging comparison
    const { data: currentLead } = await supabaseAdmin
      .from('chat_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!currentLead) {
      throw AppError.notFound('Lead not found');
    }

    if (body.lifecycle_status !== undefined) updates.lifecycle_status = body.lifecycle_status;
    if (body.temperature !== undefined) updates.temperature = body.temperature;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.follow_up_at !== undefined) updates.follow_up_at = body.follow_up_at;
    if (body.project_interest !== undefined) updates.project_interest = body.project_interest;
    if (body.qualification_status !== undefined)
      updates.qualification_status = body.qualification_status;

    let assigneeChanged = false;
    let newEmployeeName = '';
    if (body.assigned_to !== undefined) {
      updates.assigned_to = body.assigned_to || null;
      if (body.assigned_to && body.assigned_to !== currentLead.assigned_to) {
        assigneeChanged = true;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', body.assigned_to)
          .single();
        newEmployeeName = profile?.full_name || 'Staff Member';
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('chat_leads')
      .update(updates)
      .eq('id', leadId)
      .select('*, profiles:assigned_to(id, full_name, email, phone)')
      .single();

    if (error) {
      console.error('Failed to update lead:', error);
      throw AppError.internal(error.message || 'Failed to update lead');
    }

    // Activity tracking
    if (assigneeChanged && newEmployeeName) {
      await leadActivityStore.recordActivity({
        lead_id: leadId,
        employee_id: updates.assigned_to,
        employee_name: newEmployeeName,
        activity_type: 'lead_reassigned',
        title: `Lead assigned to ${newEmployeeName}`,
        notes: body.reason || 'Assigned by Admin via Workforce Console',
      });
    }

    if (body.lifecycle_status && body.lifecycle_status !== currentLead.lifecycle_status) {
      await leadActivityStore.recordActivity({
        lead_id: leadId,
        employee_id: admin.id,
        employee_name: 'Admin',
        activity_type: 'status_change',
        title: `Status changed to ${body.lifecycle_status}`,
        notes: `Previous status: ${currentLead.lifecycle_status || 'none'}`,
      });
    }

    if (body.temperature && body.temperature !== currentLead.temperature) {
      await leadActivityStore.recordActivity({
        lead_id: leadId,
        employee_id: admin.id,
        employee_name: 'Admin',
        activity_type: 'temperature_change',
        title: `Temperature changed to ${body.temperature}`,
      });
    }

    if (body.notes && body.notes !== currentLead.notes) {
      await leadActivityStore.recordActivity({
        lead_id: leadId,
        employee_id: admin.id,
        employee_name: 'Admin',
        activity_type: 'note_added',
        title: 'Note updated by Admin',
        notes: body.notes,
      });
    }

    return NextResponse.json({
      success: true,
      lead: updated,
      message: 'Lead updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw AppError.badRequest('Lead ID is required');
    }

    const { error } = await supabaseAdmin.from('chat_leads').delete().eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      throw AppError.internal(error.message || 'Failed to delete lead');
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
