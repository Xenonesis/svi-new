import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export interface PaymentDueItem {
  id: string;
  customer_name: string;
  plot_number: string;
  amount_due: number;
  due_date: string;
  is_overdue: boolean;
  document_type: 'bba' | 'quotation';
  project_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

// GET /api/admin/dues - Real-time upcoming and overdue payment dues from BBAs and Quotations
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const duesDocsRes = await supabaseAdmin
      .from('documents')
      .select('id, document_type, form_data, created_at')
      .in('document_type', ['bba', 'quotation'])
      .order('created_at', { ascending: false })
      .limit(30);

    if (duesDocsRes.error) {
      throw AppError.internal('Failed to fetch dues documents');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMs = new Date().getTime();
    const duesDocs = duesDocsRes.data || [];
    const paymentDues: PaymentDueItem[] = [];

    duesDocs.forEach((d) => {
      const f = (d.form_data as Record<string, unknown>) || {};
      if (d.document_type === 'bba') {
        const amt = parseFloat(
          String(f.within15DaysAmount || f.onBookingAmount || '50000').replace(/,/g, '')
        );
        const bookingDate = String(f.bookingDate || todayStr);
        const isOverdue = new Date(bookingDate).getTime() < todayMs;
        paymentDues.push({
          id: String(d.id),
          customer_name: String(f.clientName || 'Client'),
          plot_number: String(f.unitNumber || 'Plot'),
          amount_due: !isNaN(amt) && amt > 0 ? amt : 50000,
          due_date: bookingDate,
          is_overdue: isOverdue,
          document_type: 'bba',
          project_name: String(f.projectName || ''),
          contact_phone: String(f.mobileNumber || ''),
          contact_email: String(f.email || ''),
        });
      } else if (d.document_type === 'quotation') {
        const calc = (f.calculation as Record<string, unknown>) || {};
        const amt = typeof calc.grandTotal === 'number' ? calc.grandTotal : 150000;
        const validUntil = String(f.validUntil || todayStr);
        const isOverdue = new Date(validUntil).getTime() < todayMs;
        paymentDues.push({
          id: String(d.id),
          customer_name: String(f.customerName || 'Prospect'),
          plot_number: String(f.plotNo || 'Plot'),
          amount_due: amt,
          due_date: validUntil,
          is_overdue: isOverdue,
          document_type: 'quotation',
          project_name: String(f.projectName || ''),
          contact_phone: String(f.customerPhone || ''),
          contact_email: String(f.customerEmail || ''),
        });
      }
    });

    const overdueCount = paymentDues.filter((d) => d.is_overdue).length;

    return NextResponse.json({
      paymentDues,
      count: paymentDues.length,
      overdueCount,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
