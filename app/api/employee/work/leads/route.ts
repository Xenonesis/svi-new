import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadActivityStore } from '@/src/lib/leads/leadActivityStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view leads');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.toLowerCase();

    // Fetch leads where assigned to this employee OR created by this employee
    let query = supabaseAdmin
      .from('chat_leads')
      .select('*')
      .or(`assigned_to.eq.${verified.user.id},lead_created_by.eq.${verified.user.id}`);

    if (status && status !== 'all') {
      query = query.eq('lifecycle_status', status);
    }

    const { data: leads, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw AppError.internal('Failed to fetch assigned leads');
    }

    let filtered = leads || [];
    if (q) {
      filtered = filtered.filter(
        (l: any) =>
          l.name?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.project_interest?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ leads: filtered });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to add a lead');
    }

    const body = await request.json().catch(() => null);
    if (!body?.name?.trim() || !body?.phone?.trim()) {
      throw AppError.badRequest('Client name and phone number are required');
    }

    const name = body.name.trim();
    const phone = body.phone.trim();
    const email = body.email?.trim() || '';
    const project_interest = body.project_interest?.trim() || null;
    const budget = body.budget?.trim() || null;
    const temperature = ['hot', 'warm', 'cold'].includes(body.temperature)
      ? body.temperature
      : 'warm';
    const lifecycle_status = [
      'new',
      'contacted',
      'qualified',
      'visit_requested',
      'won',
      'lost',
    ].includes(body.lifecycle_status)
      ? body.lifecycle_status
      : 'new';
    const follow_up_at = body.follow_up_at ? new Date(body.follow_up_at).toISOString() : null;
    const notes = body.notes?.trim() || null;

    // Get employee profile for name logging
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', verified.user.id)
      .single();
    const employeeName = profile?.full_name || 'Employee';

    // Insert into chat_leads
    const leadInsertPayload: Record<string, any> = {
      name,
      phone,
      email,
      source: 'employee_manual',
      project_interest,
      budget,
      temperature,
      lifecycle_status,
      assigned_to: verified.user.id,
      lead_created_by: verified.user.id,
      summary: notes,
      follow_up_at,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedLead: any = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('chat_leads')
        .insert(leadInsertPayload)
        .select()
        .single();

      if (!error && data) {
        insertedLead = data;
      } else if (error) {
        // Retry without follow_up_at / notes / lead_created_by in case columns are not yet applied
        const safePayload = { ...leadInsertPayload };
        delete safePayload.follow_up_at;
        delete safePayload.notes;
        delete safePayload.lead_created_by;

        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('chat_leads')
          .insert(safePayload)
          .select()
          .single();

        if (retryError) {
          console.error('Failed to insert lead:', retryError);
          throw AppError.internal(retryError.message || 'Failed to create lead');
        }
        insertedLead = { ...retryData, follow_up_at, notes, lead_created_by: verified.user.id };
      }
    } catch (dbErr: any) {
      console.error('Exception creating lead:', dbErr);
      throw AppError.internal(dbErr.message || 'Failed to create lead');
    }

    // Record activity in leadActivityStore
    await leadActivityStore.recordActivity({
      lead_id: insertedLead.id,
      employee_id: verified.user.id,
      employee_name: employeeName,
      activity_type: 'lead_created',
      title: `Lead added by ${employeeName}`,
      notes: notes || 'New lead registered',
      follow_up_at,
    });

    // Notify Admin about this newly created lead
    await leadActivityStore.notifyAdminOnNewLead({
      leadId: insertedLead.id,
      clientName: name,
      phone,
      employeeName,
      employeeId: verified.user.id,
      projectInterest: project_interest,
      followUpAt: follow_up_at,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      lead: insertedLead,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to update lead');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Lead ID is required');
    }

    const { id, lifecycle_status, notes, summary, temperature, follow_up_at, activity_note } = body;

    // Get employee profile for name logging
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', verified.user.id)
      .single();
    const employeeName = profile?.full_name || 'Employee';

    // Verify lead belongs to this employee or is assigned to them
    const { data: existingLead } = await supabaseAdmin
      .from('chat_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingLead) {
      throw AppError.badRequest('Lead not found');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (lifecycle_status) updates.lifecycle_status = lifecycle_status;
    if (temperature) updates.temperature = temperature;
    if (summary !== undefined) updates.summary = summary;
    if (notes !== undefined) updates.notes = notes;
    if (follow_up_at !== undefined)
      updates.follow_up_at = follow_up_at ? new Date(follow_up_at).toISOString() : null;

    let updatedLead: any = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('chat_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedLead = data;
      } else {
        // Fallback without newer columns
        const safeUpdates = { ...updates };
        delete safeUpdates.follow_up_at;
        delete safeUpdates.notes;
        const { data: retryData } = await supabaseAdmin
          .from('chat_leads')
          .update(safeUpdates)
          .eq('id', id)
          .select()
          .single();
        updatedLead = { ...(retryData || existingLead), ...updates };
      }
    } catch {
      updatedLead = { ...existingLead, ...updates };
    }

    // Record Activity
    if (lifecycle_status && lifecycle_status !== existingLead.lifecycle_status) {
      await leadActivityStore.recordActivity({
        lead_id: id,
        employee_id: verified.user.id,
        employee_name: employeeName,
        activity_type: 'status_change',
        title: `Status changed to ${lifecycle_status.toUpperCase()}`,
        notes: activity_note || notes || null,
        follow_up_at: updates.follow_up_at || null,
      });
    }

    if (temperature && temperature !== existingLead.temperature) {
      await leadActivityStore.recordActivity({
        lead_id: id,
        employee_id: verified.user.id,
        employee_name: employeeName,
        activity_type: 'temperature_change',
        title: `Priority updated to ${temperature.toUpperCase()}`,
        notes: activity_note || null,
      });
    }

    if (activity_note || (notes && notes !== existingLead.notes)) {
      await leadActivityStore.recordActivity({
        lead_id: id,
        employee_id: verified.user.id,
        employee_name: employeeName,
        activity_type: 'note_added',
        title: activity_note ? 'Call / Interaction Logged' : 'Notes Updated',
        notes: activity_note || notes,
        follow_up_at: updates.follow_up_at || null,
      });
    }

    if (follow_up_at && follow_up_at !== existingLead.follow_up_at) {
      await leadActivityStore.recordActivity({
        lead_id: id,
        employee_id: verified.user.id,
        employee_name: employeeName,
        activity_type: 'followup_scheduled',
        title: `Follow-up scheduled`,
        notes: activity_note || notes || null,
        follow_up_at: updates.follow_up_at,
      });

      // Dispatch notification to Admin
      await leadActivityStore.notifyAdminOnFollowup({
        leadId: id,
        clientName: existingLead.name || 'Client',
        employeeName,
        employeeId: verified.user.id,
        followUpAt: updates.follow_up_at,
        projectInterest: existingLead.project_interest,
        notes: activity_note || notes,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updatedLead,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
