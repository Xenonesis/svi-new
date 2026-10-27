import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export interface DataGapItem {
  id: string;
  category:
    | 'missing_plot'
    | 'missing_ticket'
    | 'missing_advisor'
    | 'missing_letter'
    | 'incomplete_registration';
  title: string;
  description: string;
  client_name: string;
  ticket_id?: string;
  phone?: string;
  plot_number?: string;
  action_url: string;
  action_label: string;
  severity: 'high' | 'medium' | 'low';
  created_at: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // 1. Fetch active allotments, profiles, and generated allotment letters
    const [allotmentsRes, profilesRes, lettersRes] = await Promise.all([
      supabaseAdmin
        .from('allotments')
        .select('id, user_id, unit_no, status, metadata, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('profiles').select('id, full_name, phone, email'),
      supabaseAdmin
        .from('documents')
        .select('id, form_data')
        .eq('document_type', 'allotment_letter'),
    ]);

    if (allotmentsRes.error) throw AppError.internal(allotmentsRes.error.message);

    const profilesMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
    const generatedLetters = lettersRes.data || [];

    const gaps: DataGapItem[] = [];

    // Helper to check if allotment letter exists
    const hasLetter = (plotNo: string, clientName: string, ticketId?: string) => {
      const cleanPlot = (plotNo || '').trim().toLowerCase();
      const cleanClient = (clientName || '').trim().toLowerCase();
      const cleanTicket = (ticketId || '').trim().toLowerCase();

      return generatedLetters.some((l) => {
        const fd = (l.form_data as Record<string, unknown>) || {};
        const lPlot = String(fd.plotNo || fd.unitNumber || '')
          .trim()
          .toLowerCase();
        const lClient = String(fd.clientName || fd.name || '')
          .trim()
          .toLowerCase();
        const lTicket = String(fd.ticketId || fd.refId || '')
          .trim()
          .toLowerCase();

        return (
          (cleanPlot && cleanPlot !== 'unassigned' && lPlot === cleanPlot) ||
          (cleanTicket && lTicket === cleanTicket) ||
          (cleanClient && cleanClient !== 'unknown' && lClient === cleanClient)
        );
      });
    };

    // 2. Scan Allotments
    for (const a of allotmentsRes.data || []) {
      const meta = (a.metadata as Record<string, unknown>) || {};
      const user = a.user_id ? profilesMap.get(a.user_id) : null;
      const clientName = String(meta.client_name || meta.clientName || user?.full_name || 'Client');
      const ticketId = String(meta.ticket_id || meta.ticketId || '').trim();
      const plotNo = String(a.unit_no || '').trim();
      const phone = String(meta.client_phone || user?.phone || '').trim();
      const advisor = String(meta.advisor_name || '').trim();

      // Check 1: Missing / Unassigned Plot Number
      if (!plotNo || plotNo.toLowerCase() === 'unassigned') {
        gaps.push({
          id: `gap_plot_${a.id}`,
          category: 'missing_plot',
          title: `Plot Not Assigned: ${clientName}`,
          description: `Allotment exists with ${ticketId || 'Pending Ticket'}, but plot number is unassigned.`,
          client_name: clientName,
          ticket_id: ticketId || undefined,
          phone: phone || undefined,
          plot_number: 'Unassigned',
          action_url: `/admin/portal-allotments`,
          action_label: 'Assign Plot No',
          severity: 'high',
          created_at: a.created_at,
        });
      }

      // Check 2: Missing Ticket ID / Ref No
      if (!ticketId) {
        gaps.push({
          id: `gap_ticket_${a.id}`,
          category: 'missing_ticket',
          title: `Missing Ticket ID: ${clientName} (Plot ${plotNo || '?'})`,
          description: `Plot ${plotNo} is allotted but Ticket / Reference ID is missing from records.`,
          client_name: clientName,
          plot_number: plotNo || undefined,
          phone: phone || undefined,
          action_url: `/admin/portal-allotments`,
          action_label: 'Update Details',
          severity: 'medium',
          created_at: a.created_at,
        });
      }

      // Check 3: Missing Dedicated Advisor
      if (!advisor) {
        gaps.push({
          id: `gap_advisor_${a.id}`,
          category: 'missing_advisor',
          title: `Advisor Unassigned: ${clientName} (Plot ${plotNo || '?'})`,
          description: `No property advisor assigned for Plot ${plotNo}.`,
          client_name: clientName,
          plot_number: plotNo || undefined,
          ticket_id: ticketId || undefined,
          action_url: `/admin/portal-allotments`,
          action_label: 'Assign Advisor',
          severity: 'low',
          created_at: a.created_at,
        });
      }

      // Check 4: Missing Official Allotment Letter
      if (
        plotNo &&
        plotNo.toLowerCase() !== 'unassigned' &&
        !hasLetter(plotNo, clientName, ticketId)
      ) {
        gaps.push({
          id: `gap_letter_${a.id}`,
          category: 'missing_letter',
          title: `Allotment Letter Missing: ${clientName} (Plot ${plotNo})`,
          description: `Official single-page A4 allotment letter is not yet generated in documents.`,
          client_name: clientName,
          plot_number: plotNo,
          ticket_id: ticketId || undefined,
          phone: phone || undefined,
          action_url: `/admin/allotment-letter`,
          action_label: 'Generate Letter',
          severity: 'high',
          created_at: a.created_at,
        });
      }
    }

    // Sort by severity (high -> medium -> low) then newest
    const severityWeight = { high: 3, medium: 2, low: 1 };
    gaps.sort((a, b) => {
      const diff = severityWeight[b.severity] - severityWeight[a.severity];
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({
      success: true,
      totalGaps: gaps.length,
      highSeverityCount: gaps.filter((g) => g.severity === 'high').length,
      dataGaps: gaps,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
