import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { formatTicketId, extractTicketFromMetadata } from '@/src/lib/allotment/ticketUtils';
interface ManageAllotmentPayload {
  id?: string;
  profile_id?: string;
  property_id: string;
  unit_number: string;
  plot_preference?: string;
  area?: string | number;
  total_cost?: string | number;
  booking_date?: string;
  advisor_name?: string;
  ticket_id?: string;
}

interface PaymentStatusPayload {
  paymentId?: string;
  receiptId?: string;
  receiptNo?: string;
  status: 'paid' | 'pending';
  reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // Fetch all allotments with linked user profiles and properties
    const [allotsRes, regsRes] = await Promise.all([
      supabaseAdmin
        .from('allotments')
        .select(
          `
          id,
          unit_no,
          status,
          allotted_date,
          notes,
          metadata,
          profiles:user_id (id, full_name, email, phone),
          properties:property_id (id, name, slug)
        `
        )
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('registrations').select(`
          submission_id,
          name,
          last_name,
          so_wo_do,
          aadhar_number,
          pan_number,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          project,
          property_size,
          plot_preference,
          advisor_name
        `),
    ]);

    if (allotsRes.error) throw allotsRes.error;

    const regMap: Record<string, Record<string, unknown>> = {};
    for (const r of (regsRes.data || []) as Array<Record<string, unknown>>) {
      const subId = typeof r.submission_id === 'string' ? r.submission_id : '';
      if (subId) {
        regMap[formatTicketId(subId)] = r;
      }
    }

    const activeAllotments = (allotsRes.data || [])
      .filter((a) => {
        const nText = String(a.notes || '').toLowerCase();
        const sText = String(a.status || '').toLowerCase();
        const meta = (a.metadata as Record<string, unknown>) || {};
        const ms = String(meta.status || '').toLowerCase();
        const mr = String(meta.refund_status || '').toLowerCase();
        const rem = String(meta.remarks || '').toLowerCase();

        const isCancelled =
          nText.includes('refund') ||
          sText.includes('refund') ||
          sText.includes('cancelled') ||
          ms.includes('refund') ||
          mr.includes('refund') ||
          rem.includes('refund');

        return !isCancelled;
      })
      .map((a) => {
        const meta = (a.metadata as Record<string, unknown>) || {};
        const rawTicket = extractTicketFromMetadata(meta);
        const ticketId = rawTicket || `PL${a.unit_no || ''}`.trim();
        const cleanTicket = formatTicketId(ticketId);

        const reg = cleanTicket ? regMap[cleanTicket] : undefined;

        const profileObj = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
        const propertyObj = Array.isArray(a.properties) ? a.properties[0] : a.properties;

        const clientName =
          profileObj?.full_name ||
          (reg ? `${String(reg.name || '')} ${String(reg.last_name || '')}`.trim() : '') ||
          (typeof meta.client_name === 'string' ? meta.client_name : '') ||
          (typeof meta.clientName === 'string' ? meta.clientName : '') ||
          'Client';

        const phone =
          profileObj?.phone ||
          (typeof reg?.phone === 'string' ? reg.phone : '') ||
          (typeof meta.client_phone === 'string' ? meta.client_phone : '');

        const email =
          profileObj?.email ||
          (typeof reg?.email === 'string' ? reg.email : '') ||
          (typeof meta.client_email === 'string' ? meta.client_email : '');
        const address =
          (typeof reg?.address === 'string' ? reg.address : '') ||
          (typeof meta.client_address === 'string' ? meta.client_address : '') ||
          (typeof meta.address === 'string' ? meta.address : '');

        const aadharNumber =
          (typeof reg?.aadhar_number === 'string' ? reg.aadhar_number : '') ||
          (typeof meta.aadhar_number === 'string' ? meta.aadhar_number : '') ||
          (typeof meta.aadharNumber === 'string' ? meta.aadharNumber : '');

        const fatherName =
          (typeof reg?.so_wo_do === 'string' ? reg.so_wo_do : '') ||
          (typeof meta.fatherName === 'string' ? meta.fatherName : '') ||
          (typeof meta.father_name === 'string' ? meta.father_name : '');

        const panNumber =
          (typeof reg?.pan_number === 'string' ? reg.pan_number : '') ||
          (typeof meta.pan_number === 'string' ? meta.pan_number : '');

        const projectName =
          propertyObj?.name ||
          (typeof meta.project === 'string' ? meta.project : '') ||
          (typeof meta.projectName === 'string' ? meta.projectName : '') ||
          (typeof reg?.project === 'string' ? reg.project : '') ||
          '';

        const area = meta.area ? String(meta.area) : '';
        const totalCost = Number(meta.total_cost) || 0;
        const bsp =
          meta.rate_per_sq_yd || meta.bsp
            ? String(meta.rate_per_sq_yd || meta.bsp)
            : area && totalCost > 0
              ? String(Math.round(totalCost / Number(area)))
              : '';

        const advisorName =
          (typeof meta.advisor_name === 'string' ? meta.advisor_name : '') ||
          (typeof meta.advisorName === 'string' ? meta.advisorName : '') ||
          (typeof reg?.advisor_name === 'string' ? reg.advisor_name : '') ||
          '';

        return {
          id: a.id,
          ticketId: cleanTicket,
          unitNumber: a.unit_no || 'Unassigned',
          clientName,
          phone,
          email,
          address,
          city: typeof reg?.city === 'string' ? reg.city : '',
          state: typeof reg?.state === 'string' ? reg.state : '',
          pincode: typeof reg?.pincode === 'string' ? reg.pincode : '',
          aadharNumber,
          fatherName,
          panNumber,
          projectName,
          area,
          bsp,
          totalCost,
          advisorName,
          allottedDate: a.allotted_date || '',
          plotPreference:
            (typeof meta.plot_preference === 'string' ? meta.plot_preference : '') ||
            (typeof reg?.plot_preference === 'string' ? reg.plot_preference : '') ||
            '',
        };
      });

    return NextResponse.json({ success: true, allotments: activeAllotments });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = (await request.json().catch(() => null)) as ManageAllotmentPayload | null;
    if (!body) throw AppError.badRequest('Invalid request payload');

    const {
      id,
      profile_id,
      property_id,
      unit_number,
      plot_preference,
      area,
      total_cost,
      booking_date,
      advisor_name,
      ticket_id,
    } = body;

    if (!property_id) throw AppError.badRequest('Property is required');

    let existingMeta: Record<string, unknown> = {};
    let existingStatus = 'Allotted';

    if (id) {
      const { data: allot, error: fetchErr } = await supabaseAdmin
        .from('allotments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!allot) throw AppError.notFound('Allotment not found');

      existingStatus = allot.status || 'Allotted';
      existingMeta = (allot.metadata as Record<string, unknown>) || {};

      const notesText = String(allot.notes || '').toLowerCase();
      const statusText = String(allot.status || '').toLowerCase();
      const metaStatus = String(existingMeta.status || '').toLowerCase();
      const metaRefundStatus = String(existingMeta.refund_status || '').toLowerCase();
      const metaRemarks = String(existingMeta.remarks || '').toLowerCase();

      const isRefundDone =
        notesText.includes('refund') ||
        statusText.includes('refund') ||
        statusText.includes('cancelled') ||
        metaStatus.includes('refund') ||
        metaRefundStatus.includes('refund') ||
        metaRemarks.includes('refund');

      if (isRefundDone) {
        throw AppError.badRequest('Refunded allotments are archived and cannot be modified');
      }
    }

    const ticketVal = formatTicketId(ticket_id) || null;
    const cleanUnitNo = unit_number?.trim() || 'Unassigned';

    // Duplicate Allotment Guard: ensure ticket is not already allotted to another active allotment
    if (ticketVal) {
      const { data: existingAllots, error: checkErr } = await supabaseAdmin
        .from('allotments')
        .select('id, unit_no, status, notes, metadata');

      if (!checkErr && existingAllots) {
        const duplicate = existingAllots.find((a) => {
          if (id && a.id === id) return false;
          const assignedTicket = extractTicketFromMetadata(a.metadata as Record<string, unknown>);
          if (assignedTicket !== ticketVal) return false;

          const nText = String(a.notes || '').toLowerCase();
          const sText = String(a.status || '').toLowerCase();
          const isCancelled =
            nText.includes('refund') || sText.includes('refund') || sText.includes('cancelled');
          return !isCancelled;
        });

        if (duplicate) {
          throw AppError.badRequest(
            `Ticket ID "${ticketVal}" is already allotted to Unit "${duplicate.unit_no || 'Assigned'}" (ID: ${duplicate.id.slice(0, 8)}).`
          );
        }
      }
    }

    const updatedMeta: Record<string, unknown> = {
      ...existingMeta,
      unit_no: cleanUnitNo,
      unitNumber: cleanUnitNo,
      plot_no: cleanUnitNo,
      area: area ? Number(area) || area : null,
      total_cost: total_cost ? Number(total_cost) || null : null,
      advisor_name: advisor_name?.trim() || null,
      plot_preference: plot_preference || existingMeta.plot_preference || null,
      updated_at: new Date().toISOString(),
    };

    if (ticketVal) {
      updatedMeta.ticket_id = ticketVal;
      updatedMeta.ticketId = ticketVal;
    } else {
      delete updatedMeta.ticket_id;
      delete updatedMeta.ticketId;
      delete updatedMeta.refId;
      delete updatedMeta.ref_id;
    }
    const payload = {
      user_id: profile_id || null,
      property_id: property_id,
      unit_no: cleanUnitNo,
      status: existingStatus,
      allotted_date: booking_date || new Date().toISOString().split('T')[0],
      metadata: updatedMeta,
    };

    let resultAllotment: unknown;
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('allotments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      resultAllotment = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('allotments')
        .insert({
          ...payload,
          notes: ticketVal
            ? `Approved client allotment from Ticket ID ${ticketVal}`
            : 'Manual Portal Allotment',
        })
        .select()
        .single();

      if (error) throw error;
      resultAllotment = data;
    }
    if (ticketVal) {
      const regUpdate: Record<string, unknown> = {};
      if (plot_preference) regUpdate.plot_preference = plot_preference;
      if (advisor_name && advisor_name.trim()) regUpdate.advisor_name = advisor_name.trim();

      if (Object.keys(regUpdate).length > 0) {
        await supabaseAdmin.from('registrations').update(regUpdate).eq('submission_id', ticketVal);
      }
    }
    return NextResponse.json({ success: true, allotment: resultAllotment });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = (await request.json().catch(() => null)) as PaymentStatusPayload | null;
    if (!body || (!body.paymentId && !body.receiptId && !body.receiptNo) || !body.status) {
      throw AppError.badRequest('paymentId, receiptId, or receiptNo, and status are required');
    }

    const { paymentId, receiptId, receiptNo, status, reason } = body;
    const paidDate = status === 'paid' ? new Date().toISOString().split('T')[0] : null;

    let targetScheduleId = paymentId;
    let targetReceiptNo = receiptNo;

    if (receiptId) {
      const { data: recDoc } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('id', receiptId)
        .maybeSingle();

      if (recDoc) {
        const docFormData = (recDoc.form_data as Record<string, unknown>) || {};
        targetReceiptNo = targetReceiptNo || (docFormData.receiptNo as string);
        const newFormData = {
          ...docFormData,
          paymentStatus: status,
          isPaid: status === 'paid',
        };
        const docMeta = (recDoc.metadata as Record<string, unknown>) || {};
        const newMeta = {
          ...docMeta,
          payment_status: status === 'paid' ? 'cleared' : 'pending_clearance',
          revert_reason: status === 'pending' ? reason || 'Reverted to pending' : undefined,
        };
        await supabaseAdmin
          .from('documents')
          .update({
            status: status === 'paid' ? 'completed' : 'draft',
            form_data: newFormData,
            metadata: newMeta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', receiptId);
      }
    }

    if (!targetScheduleId && targetReceiptNo) {
      const { data: matchedSched } = await supabaseAdmin
        .from('payment_schedules')
        .select('id')
        .ilike('title', `%#${targetReceiptNo}%`)
        .maybeSingle();

      if (matchedSched) {
        targetScheduleId = matchedSched.id;
      }
    }

    let updatedPayment = null;
    if (targetScheduleId) {
      const updateFields: Record<string, unknown> = {
        status,
        paid_date: paidDate,
        updated_at: new Date().toISOString(),
      };
      if (status === 'pending' && reason) {
        updateFields.notes = reason;
      }
      const { data, error } = await supabaseAdmin
        .from('payment_schedules')
        .update(updateFields)
        .eq('id', targetScheduleId)
        .select()
        .single();

      if (error) throw error;
      updatedPayment = data;
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw AppError.badRequest('Allotment ID is required');

    const { data: target, error: fetchErr } = await supabaseAdmin
      .from('allotments')
      .select('id, notes, status, metadata')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!target) throw AppError.notFound('Allotment not found');

    const meta = (target.metadata as Record<string, unknown>) || {};
    const notesText = String(target.notes || '').toLowerCase();
    const statusText = String(target.status || '').toLowerCase();
    const metaStatus = String(meta.status || '').toLowerCase();
    const metaRefundStatus = String(meta.refund_status || '').toLowerCase();
    const metaRemarks = String(meta.remarks || '').toLowerCase();

    const isRefundDone =
      notesText.includes('refund') ||
      statusText.includes('refund') ||
      statusText.includes('cancelled') ||
      metaStatus.includes('refund') ||
      metaRefundStatus.includes('refund') ||
      metaRemarks.includes('refund');

    if (isRefundDone) {
      throw AppError.badRequest('Refunded allotments are archived and cannot be deleted.');
    }

    const { error: delError } = await supabaseAdmin.from('allotments').delete().eq('id', id);

    if (delError) throw delError;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
