import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import type { CandidateClient } from '../candidates/route';

interface ApprovePayload {
  candidates?: CandidateClient[];
  candidate?: CandidateClient;
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    let body: ApprovePayload;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const candidatesToApprove: CandidateClient[] = [];
    if (Array.isArray(body.candidates) && body.candidates.length > 0) {
      candidatesToApprove.push(...body.candidates);
    } else if (body.candidate) {
      candidatesToApprove.push(body.candidate);
    } else {
      throw AppError.badRequest('No candidate provided for approval');
    }

    // Fetch fallback property if needed
    const { data: propsData } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .eq('active', true)
      .limit(1);
    const defaultPropertyId = propsData?.[0]?.id || null;

    const results = [];

    for (const c of candidatesToApprove) {
      const cleanTicketId = c.ticketId.trim();
      const clientName = c.clientName?.trim() || `Client ${cleanTicketId}`;
      let email = c.email?.trim().toLowerCase();
      const phone = c.phone?.trim() || null;

      // 1. Check if profile already exists by email or phone
      let profileId: string | null = null;

      if (email) {
        const { data: existingProf } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (existingProf) profileId = existingProf.id;
      }

      if (!profileId && phone) {
        const { data: existingProfPhone } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('phone', phone)
          .maybeSingle();
        if (existingProfPhone) profileId = existingProfPhone.id;
      }

      // If no profile found, create client auth user & profile
      if (!profileId) {
        const safeSlug = cleanTicketId.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!email) {
          email = `client.${safeSlug || 'tkt'}@sviinfra.com`;
        }
        const tempPassword = `SviClient@${cleanTicketId.replace(/[^a-zA-Z0-9]/g, '') || '2026'}`;

        // Attempt to create auth user
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: clientName,
            phone: phone || undefined,
            ticket_id: cleanTicketId,
          },
        });

        if (authErr) {
          // If already registered in auth, look up user
          if (authErr.message.includes('already been registered') || authErr.status === 422) {
            const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = usersList?.users.find((u) => u.email === email);
            if (existingUser) {
              profileId = existingUser.id;
            }
          }
          if (!profileId) {
            console.error(`Failed to create auth user for ${cleanTicketId}:`, authErr);
            continue;
          }
        } else if (authData.user) {
          profileId = authData.user.id;
        }

        // Upsert profile in public.profiles table
        if (profileId) {
          await supabaseAdmin.from('profiles').upsert(
            {
              id: profileId,
              full_name: clientName,
              email,
              phone,
              role: 'client',
              is_active: true,
              notes: `Approved client for Ticket/Ref: ${cleanTicketId}`,
            },
            { onConflict: 'id' }
          );
        }
      }

      if (!profileId) {
        console.error(`Could not resolve profileId for ticket ${cleanTicketId}`);
        continue;
      }

      // 2. Resolve property
      const propertyId = c.propertyId || defaultPropertyId;
      if (!propertyId) {
        console.error(`No property available to attach allotment for ${cleanTicketId}`);
        continue;
      }

      // 3. Insert into public.allotments
      const allottedDate = c.bookingDate
        ? new Date(c.bookingDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const { data: newAllotment, error: allotInsertErr } = await supabaseAdmin
        .from('allotments')
        .insert({
          user_id: profileId,
          property_id: propertyId,
          unit_no: c.unitNo?.trim() || 'Unassigned',
          status: 'Allotted',
          allotted_date: allottedDate,
          notes: `Approved client allotment from Ticket ID ${cleanTicketId}`,
          metadata: {
            ticket_id: cleanTicketId,
            area: c.area || null,
            total_cost: c.totalCost || null,
            approved_by: admin.email,
            approved_at: new Date().toISOString(),
            source: c.sources?.join(', ') || 'Approval Queue',
          },
        })
        .select()
        .single();

      if (allotInsertErr) {
        console.error(`Failed to insert allotment for ticket ${cleanTicketId}:`, allotInsertErr);
        continue;
      }

      // 4. If candidate has payment milestones, insert into public.payment_schedules
      if (newAllotment && Array.isArray(c.paymentMilestones) && c.paymentMilestones.length > 0) {
        const scheduleInserts = c.paymentMilestones.map((m) => ({
          allotment_id: newAllotment.id,
          user_id: profileId,
          title: m.title || 'Payment Milestone',
          amount: m.amount,
          due_date: m.dueDate || allottedDate,
          status: m.status || 'paid',
          paid_date: m.paidDate || (m.status === 'paid' ? allottedDate : null),
        }));

        const { error: scheduleErr } = await supabaseAdmin
          .from('payment_schedules')
          .insert(scheduleInserts);

        if (scheduleErr) {
          console.error(`Error saving payment schedules for ${cleanTicketId}:`, scheduleErr);
        }
      }

      results.push({
        ticketId: cleanTicketId,
        allotmentId: newAllotment?.id,
        clientName,
      });
    }

    return NextResponse.json({
      success: true,
      approvedCount: results.length,
      approved: results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
