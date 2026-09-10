import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to view site visits');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('whatsapp_site_visit_requests')
      .select(
        '*, contact:whatsapp_contacts(name:display_name, phone:phone_e164), conversation:whatsapp_conversations(project_id)'
      )
      .eq('assigned_to', verified.user.id);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: visits, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching site visits:', error);
      throw AppError.internal('Failed to fetch site visits');
    }

    const normalizedVisits = (visits || []).map((v: Record<string, unknown>) => {
      let preferred_date: string | null = null;
      if (typeof v.requested_date === 'string' && v.requested_date) {
        const timeStr =
          typeof v.requested_time === 'string' && v.requested_time ? v.requested_time : '10:00:00';
        preferred_date = `${v.requested_date}T${timeStr}`;
      } else if (typeof v.preferred_date === 'string') {
        preferred_date = v.preferred_date;
      } else if (typeof v.confirmed_date === 'string') {
        preferred_date = v.confirmed_date;
      }

      return {
        ...v,
        preferred_date,
      };
    });

    return NextResponse.json({ visits: normalizedVisits, site_visits: normalizedVisits });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to update site visit');
    }

    const body = await request.json().catch(() => null);
    if (!body?.id) {
      throw AppError.badRequest('Site visit ID is required');
    }

    const { id, status, notes, confirmed_date } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      const validStatuses = ['requested', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      updates.status = status;
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      }
    }

    if (confirmed_date) updates.confirmed_date = confirmed_date;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error } = await supabaseAdmin
      .from('whatsapp_site_visit_requests')
      .update(updates)
      .eq('id', id)
      .eq('assigned_to', verified.user.id)
      .select()
      .single();

    if (error || !updated) {
      throw AppError.badRequest('Site visit not found or update failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Site visit updated successfully',
      visit: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await verifyEmployee(request);
    if (!verified) {
      throw AppError.unauthorized('Please log in to schedule site visit');
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      throw AppError.badRequest('Invalid request body');
    }

    let contactId = typeof body.contact_id === 'string' ? body.contact_id : undefined;
    const leadId = typeof body.lead_id === 'string' ? body.lead_id : undefined;
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const clientName =
      typeof body.client_name === 'string'
        ? body.client_name.trim()
        : typeof body.name === 'string'
          ? body.name.trim()
          : 'Prospective Client';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
    const projectId = typeof body.project_id === 'string' ? body.project_id : null;

    let requestedDate: string | null = null;
    let requestedTime: string | null = '11:00:00';

    if (typeof body.requested_date === 'string' && body.requested_date) {
      requestedDate = body.requested_date;
    } else if (typeof body.preferred_date === 'string' && body.preferred_date) {
      if (body.preferred_date.includes('T')) {
        const [d, t] = body.preferred_date.split('T');
        requestedDate = d;
        requestedTime = t ? t.slice(0, 8) : '11:00:00';
      } else {
        requestedDate = body.preferred_date;
      }
    }

    if (typeof body.requested_time === 'string' && body.requested_time) {
      requestedTime = body.requested_time;
    }

    // If no contact_id provided but phone is present, upsert whatsapp_contacts
    if (!contactId && rawPhone) {
      const digits = rawPhone.replace(/\D/g, '');
      const phoneE164 =
        digits.startsWith('91') && digits.length === 12
          ? `+${digits}`
          : digits.length === 10
            ? `+91${digits}`
            : `+${digits}`;

      const { data: existingContact } = await supabaseAdmin
        .from('whatsapp_contacts')
        .select('id')
        .eq('phone_e164', phoneE164)
        .maybeSingle();

      if (existingContact?.id) {
        contactId = existingContact.id;
      } else {
        const { data: newContact, error: contactError } = await supabaseAdmin
          .from('whatsapp_contacts')
          .insert({
            phone_e164: phoneE164,
            display_name: clientName,
          })
          .select('id')
          .single();

        if (!contactError && newContact?.id) {
          contactId = newContact.id;
        }
      }
    }

    // If we have contactId, ensure conversation exists
    let conversationId: string | null = null;
    if (contactId) {
      const { data: conv } = await supabaseAdmin
        .from('whatsapp_conversations')
        .select('id')
        .eq('contact_id', contactId)
        .maybeSingle();

      if (conv?.id) {
        conversationId = conv.id;
      } else {
        const { data: newConv } = await supabaseAdmin
          .from('whatsapp_conversations')
          .insert({
            contact_id: contactId,
            lead_id: leadId || null,
            project_id: projectId || null,
            assigned_to: verified.user.id,
            mode: 'human',
            status: 'open',
          })
          .select('id')
          .single();
        conversationId = newConv?.id || null;
      }
    }

    // If conversation is available, insert into whatsapp_site_visit_requests
    if (conversationId && contactId) {
      const { data: createdVisit, error: visitErr } = await supabaseAdmin
        .from('whatsapp_site_visit_requests')
        .insert({
          conversation_id: conversationId,
          contact_id: contactId,
          lead_id: leadId || null,
          project_id: projectId || null,
          requested_date: requestedDate,
          requested_time: requestedTime,
          notes,
          status: 'confirmed',
          assigned_to: verified.user.id,
        })
        .select(
          '*, contact:whatsapp_contacts(name:display_name, phone:phone_e164), conversation:whatsapp_conversations(project_id)'
        )
        .single();

      if (!visitErr && createdVisit) {
        return NextResponse.json({
          success: true,
          message: 'Site visit scheduled successfully',
          visit: {
            ...createdVisit,
            preferred_date: requestedDate ? `${requestedDate}T${requestedTime}` : null,
          },
        });
      }
    }

    // Fallback: update lead lifecycle_status in chat_leads if leadId given
    if (leadId) {
      await supabaseAdmin
        .from('chat_leads')
        .update({
          lifecycle_status: 'visit_requested',
          follow_up_at: requestedDate ? `${requestedDate}T${requestedTime}.000Z` : undefined,
          notes: notes ? `Site visit scheduled: ${notes}` : 'Site visit scheduled',
        })
        .eq('id', leadId);
    }

    return NextResponse.json({
      success: true,
      message: 'Site visit recorded successfully',
      visit: {
        id: leadId || 'visit_' + Date.now(),
        status: 'confirmed',
        preferred_date: requestedDate ? `${requestedDate}T${requestedTime}` : null,
        notes,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
