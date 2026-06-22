import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

// GET /api/admin/registrations/filters — returns distinct values for filter dropdowns
// Fast: uses database-side RPC (get_distinct_registration_filters) with parallel fallback
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    // 1. Try to run database-side RPC (ultra-fast, single query, handles distinct ordering)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      'get_distinct_registration_filters'
    );

    if (!rpcError && rpcData) {
      return NextResponse.json(rpcData);
    }

    // 2. Fallback: If migration hasn't been run yet, run parallel queries in JS
    console.warn(
      '[Performance Warning] Falling back to parallel distinct filter queries. Run migrations to enable get_distinct_registration_filters RPC.',
      rpcError?.message
    );

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
      projects: unique((projects.data || []).map((r: { project: string | null }) => r.project)),
      advisors: unique(
        (advisors.data || []).map((r: { advisor_name: string | null }) => r.advisor_name)
      ),
      propertyTypes: unique(
        (propTypes.data || []).map((r: { property_type: string | null }) => r.property_type)
      ),
      propertySizes: unique(
        (propSizes.data || []).map((r: { property_size: string | null }) => r.property_size)
      ),
      plotPreferences: unique(
        (plotPrefs.data || []).map((r: { plot_preference: string | null }) => r.plot_preference)
      ),
      paymentPlans: unique(
        (payPlans.data || []).map((r: { payment_plan: string | null }) => r.payment_plan)
      ),
      paymentModes: unique(
        (payModes.data || []).map((r: { payment_mode: string | null }) => r.payment_mode)
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
