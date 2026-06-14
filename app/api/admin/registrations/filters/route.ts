import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/registrations/filters — returns distinct values for filter dropdowns
// Fast: uses DISTINCT SQL queries, not full table scans
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // Run DISTINCT queries in parallel — each returns a small array
    const [projects, advisors, propTypes, propSizes, plotPrefs, payPlans, payModes] =
      await Promise.all([
        supabaseAdmin
          .from('registrations')
          .select('project')
          .not('project', 'is', null)
          .order('project', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('advisor_name')
          .not('advisor_name', 'is', null)
          .order('advisor_name', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('property_type')
          .not('property_type', 'is', null)
          .order('property_type', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('property_size')
          .not('property_size', 'is', null)
          .order('property_size', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('plot_preference')
          .not('plot_preference', 'is', null)
          .order('plot_preference', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('payment_plan')
          .not('payment_plan', 'is', null)
          .order('payment_plan', { ascending: true }),
        supabaseAdmin
          .from('registrations')
          .select('payment_mode')
          .not('payment_mode', 'is', null)
          .order('payment_mode', { ascending: true }),
      ]);

    // Deduplicate in JS after DB returns sorted values
    const unique = (arr: string[]) => [...new Set(arr)].filter(Boolean).sort();

    return NextResponse.json({
      projects: unique((projects.data || []).map((r: any) => r.project)),
      advisors: unique((advisors.data || []).map((r: any) => r.advisor_name)),
      propertyTypes: unique((propTypes.data || []).map((r: any) => r.property_type)),
      propertySizes: unique((propSizes.data || []).map((r: any) => r.property_size)),
      plotPreferences: unique((plotPrefs.data || []).map((r: any) => r.plot_preference)),
      paymentPlans: unique((payPlans.data || []).map((r: any) => r.payment_plan)),
      paymentModes: unique((payModes.data || []).map((r: any) => r.payment_mode)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
