import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export interface PaymentMilestoneDraft {
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  paidDate?: string | null;
}

export interface CandidateClient {
  ticketId: string;
  normalizedId: string;
  clientName: string;
  email: string;
  phone: string;
  projectName: string;
  propertyId: string | null;
  unitNo: string;
  area: string | number;
  totalCost: number;
  bookingDate: string;
  documentCount: number;
  sources: string[];
  paymentMilestones: PaymentMilestoneDraft[];
}

function normalizeTicketId(raw?: string | null): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/[-\s]/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // Fetch existing allotments, documents, registrations, and properties in parallel
    const [
      { data: allotmentsData, error: allotErr },
      { data: docsData, error: docsErr },
      { data: regsData, error: regsErr },
      { data: propsData, error: propsErr },
    ] = await Promise.all([
      supabaseAdmin.from('allotments').select('id, metadata'),
      supabaseAdmin
        .from('documents')
        .select('id, document_type, form_data, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('registrations')
        .select(
          'id, submission_id, name, phone, email, project, property_size, plot_preference, scheme_amount, created_at'
        )
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('properties').select('id, name, slug'),
    ]);

    if (allotErr) throw AppError.internal(allotErr.message);
    if (docsErr) throw AppError.internal(docsErr.message);
    if (regsErr) throw AppError.internal(regsErr.message);
    if (propsErr) throw AppError.internal(propsErr.message);

    const properties = propsData || [];

    // Helper to resolve property UUID by project name or slug
    const resolvePropertyId = (projName?: string | null): string | null => {
      if (!projName) return null;
      const clean = projName.trim().toLowerCase();
      const match = properties.find(
        (p) =>
          p.name.toLowerCase() === clean ||
          p.slug.toLowerCase() === clean ||
          clean.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(clean)
      );
      return match ? match.id : null;
    };

    // 1. Identify already approved ticket IDs in allotments table
    const approvedNormalizedIds = new Set<string>();
    (allotmentsData || []).forEach((a) => {
      const meta = (a.metadata as Record<string, unknown>) || {};
      const tId = (meta.ticket_id || meta.ticketId) as string | undefined;
      if (tId) {
        approvedNormalizedIds.add(normalizeTicketId(tId));
      }
    });

    // 2. Aggregate candidates by normalized ticket ID
    const candidatesMap = new Map<string, CandidateClient>();

    // Process registrations
    (regsData || []).forEach((r) => {
      const rawId = r.submission_id;
      const normId = normalizeTicketId(rawId);
      if (!normId) return;

      if (!candidatesMap.has(normId)) {
        candidatesMap.set(normId, {
          ticketId: rawId?.trim() || normId,
          normalizedId: normId,
          clientName: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          projectName: r.project || '',
          propertyId: resolvePropertyId(r.project),
          unitNo: r.plot_preference || '',
          area: r.property_size || '',
          totalCost: Number(r.scheme_amount) || 0,
          bookingDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
          documentCount: 0,
          sources: ['Registration Form'],
          paymentMilestones: [],
        });
      }
    });

    // Process documents (Allotment letters, receipts, BBAs)
    (docsData || []).forEach((d) => {
      const fd = (d.form_data as Record<string, any>) || {};
      const rawId = fd.ticketId || fd.refId || fd.ticket_id || fd.ref_id || fd.ticket;
      const normId = normalizeTicketId(rawId);
      if (!normId) return;

      const clientName = fd.clientName || fd.name || fd.client_name || '';
      const email = fd.clientEmail || fd.email || '';
      const phone = fd.clientPhone || fd.phone || '';
      const projectName = fd.projectName || fd.project || '';
      const unitNo = fd.unitNumber || fd.plotNumber || fd.unit_no || '';
      const area = fd.area || fd.plotSize || fd.plot_area || '';
      const totalCost = Number(fd.totalCost || fd.total_cost || fd.amount) || 0;
      const bookingDate = fd.allotmentDate || fd.bookingDate || fd.date || '';

      if (!candidatesMap.has(normId)) {
        candidatesMap.set(normId, {
          ticketId: String(rawId).trim(),
          normalizedId: normId,
          clientName,
          email,
          phone,
          projectName,
          propertyId: resolvePropertyId(projectName),
          unitNo: String(unitNo),
          area,
          totalCost,
          bookingDate: bookingDate
            ? new Date(bookingDate).toISOString().split('T')[0]
            : d.created_at
              ? new Date(d.created_at).toISOString().split('T')[0]
              : '',
          documentCount: 1,
          sources: [d.document_type || 'Document'],
          paymentMilestones: [],
        });
      } else {
        const item = candidatesMap.get(normId)!;
        item.documentCount += 1;
        if (!item.sources.includes(d.document_type || 'Document')) {
          item.sources.push(d.document_type || 'Document');
        }
        if (!item.clientName && clientName) item.clientName = clientName;
        if (!item.email && email) item.email = email;
        if (!item.phone && phone) item.phone = phone;
        if (!item.projectName && projectName) {
          item.projectName = projectName;
          item.propertyId = resolvePropertyId(projectName);
        }
        if (!item.unitNo && unitNo) item.unitNo = String(unitNo);
        if (!item.area && area) item.area = area;
        if (!item.totalCost && totalCost) item.totalCost = totalCost;
      }

      // If this document is a payment receipt, record it as a milestone
      if (d.document_type === 'payment_receipt') {
        const item = candidatesMap.get(normId)!;
        const receiptAmount = Number(fd.amount || fd.receivedAmount || fd.totalAmount) || 0;
        const receiptDate =
          fd.receiptDate ||
          fd.date ||
          (d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '');
        const milestoneTitle =
          fd.installmentName || fd.purpose || `Payment Receipt #${d.id.slice(0, 6)}`;

        if (receiptAmount > 0) {
          item.paymentMilestones.push({
            title: milestoneTitle,
            amount: receiptAmount,
            dueDate: receiptDate || new Date().toISOString().split('T')[0],
            status: 'paid',
            paidDate: receiptDate || new Date().toISOString().split('T')[0],
          });
        }
      }
    });

    // 3. Filter out candidates that are ALREADY approved
    const allCandidates = Array.from(candidatesMap.values());
    const pendingCandidates = allCandidates.filter(
      (c) => !approvedNormalizedIds.has(c.normalizedId)
    );

    return NextResponse.json({
      candidates: pendingCandidates,
      totalPending: pendingCandidates.length,
      approvedCount: approvedNormalizedIds.size,
      totalUniqueClients: allCandidates.length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
