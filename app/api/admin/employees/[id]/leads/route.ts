import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { leadActivityStore } from '@/src/lib/leads/leadActivityStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized('Admin authorization required');
    }

    const { id: employeeId } = await params;
    if (!employeeId) {
      throw AppError.badRequest('Employee ID is required');
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const temperature = searchParams.get('temperature');
    const q = searchParams.get('q')?.toLowerCase();

    let query = supabaseAdmin
      .from('chat_leads')
      .select('*')
      .or(`assigned_to.eq.${employeeId},lead_created_by.eq.${employeeId}`)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('lifecycle_status', status);
    }
    if (temperature && temperature !== 'all') {
      query = query.eq('temperature', temperature);
    }

    const { data: rawLeads, error } = await query;

    if (error) {
      console.error('Error fetching employee leads for admin:', error);
      throw AppError.internal('Failed to fetch employee leads');
    }

    let leads = rawLeads || [];
    if (q) {
      leads = leads.filter(
        (l: any) =>
          l.name?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.project_interest?.toLowerCase().includes(q)
      );
    }

    // Attach latest activity and activity count to each lead
    const enrichedLeads = await Promise.all(
      leads.map(async (lead: any) => {
        const activities = await leadActivityStore.getLeadActivities(lead.id);
        return {
          ...lead,
          activities_count: activities.length,
          latest_activity: activities[0] || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      employee_id: employeeId,
      total: enrichedLeads.length,
      leads: enrichedLeads,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
