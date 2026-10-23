import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { verifyEmployee } from '@/src/lib/supabase/verifyEmployee';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export interface ERPDocumentItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  documentType: 'allotment' | 'receipt' | 'offer_letter' | 'registration';
  recipientName?: string;
  recipientEmail?: string;
  refNo?: string;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    const employee = !admin ? await verifyEmployee(request) : null;
    const user = admin || employee?.user;
    if (!user) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const docType = searchParams.get('type') || 'all';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    const documents: ERPDocumentItem[] = [];

    // 1. Allotments
    if (docType === 'all' || docType === 'allotment') {
      const { data: allotments } = await supabaseAdmin
        .from('allotments')
        .select('id, unit_no, client_name, client_email, client_phone, created_at, allotted_date')
        .order('created_at', { ascending: false })
        .limit(40);

      if (allotments) {
        for (const item of allotments) {
          documents.push({
            id: item.id,
            title: `Allotment Dossier — Unit ${item.unit_no || 'N/A'}`,
            subtitle: `${item.client_name || 'Client'} (${item.client_email || 'No email'})`,
            date: item.allotted_date || item.created_at || '',
            documentType: 'allotment',
            recipientName: item.client_name || '',
            recipientEmail: item.client_email || '',
            refNo: item.unit_no || '',
          });
        }
      }
    }

    // 2. Payment Receipts
    if (docType === 'all' || docType === 'receipt') {
      const { data: receipts } = await supabaseAdmin
        .from('payment_receipts')
        .select('id, receipt_no, customer_name, amount, payment_date, plot_no, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

      if (receipts) {
        for (const item of receipts) {
          documents.push({
            id: item.id,
            title: `Payment Receipt #${item.receipt_no || item.id.slice(0, 8)}`,
            subtitle: `${item.customer_name || 'Customer'} — ₹${item.amount?.toLocaleString('en-IN') || '0'} (Plot ${item.plot_no || 'N/A'})`,
            date: item.payment_date || item.created_at || '',
            documentType: 'receipt',
            recipientName: item.customer_name || '',
            refNo: item.receipt_no || '',
          });
        }
      }
    }

    // 3. Offer Letters
    if (docType === 'all' || docType === 'offer_letter') {
      const { data: offers } = await supabaseAdmin
        .from('offer_letters')
        .select('id, candidate_name, designation, personal_email, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

      if (offers) {
        for (const item of offers) {
          documents.push({
            id: item.id,
            title: `Offer Letter — ${item.candidate_name || 'Candidate'}`,
            subtitle: `${item.designation || 'Staff'} (${item.personal_email || 'No email'})`,
            date: item.created_at || '',
            documentType: 'offer_letter',
            recipientName: item.candidate_name || '',
            recipientEmail: item.personal_email || '',
            refNo: item.id.slice(0, 8),
          });
        }
      }
    }

    // 4. Registrations
    if (docType === 'all' || docType === 'registration') {
      const { data: regs } = await supabaseAdmin
        .from('registrations')
        .select('id, full_name, email, phone, submission_id, created_at, project')
        .order('created_at', { ascending: false })
        .limit(40);

      if (regs) {
        for (const item of regs) {
          documents.push({
            id: item.id,
            title: `Registration Acknowledgement — ${item.submission_id || 'Ref'}`,
            subtitle: `${item.full_name || 'Applicant'} — ${item.project || 'SVI Project'}`,
            date: item.created_at || '',
            documentType: 'registration',
            recipientName: item.full_name || '',
            recipientEmail: item.email || '',
            refNo: item.submission_id || '',
          });
        }
      }
    }

    // Filter by search query if provided
    const filtered = search
      ? documents.filter(
          (d) =>
            d.title.toLowerCase().includes(search) ||
            d.subtitle.toLowerCase().includes(search) ||
            (d.refNo && d.refNo.toLowerCase().includes(search)) ||
            (d.recipientEmail && d.recipientEmail.toLowerCase().includes(search))
        )
      : documents;

    return NextResponse.json({ documents: filtered });
  } catch (err) {
    return handleApiError(err);
  }
}
