import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

/**
 * GET /api/admin/lottery/participants?lotteryId=…&search=…&winnersOnly=…
 *
 * Admin-only participant read that includes PII (email, phone).
 *
 * The `lottery_participants` table grants `authenticated` only the
 * non-sensitive columns (migration 20261020170000), so a logged-in admin can no
 * longer read contact details directly from the browser client. This route
 * reads them with the service-role client behind a verifyAdmin gate, and the
 * admin console calls it instead.
 */

const MAX_LIMIT = 1000;

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const lotteryId = searchParams.get('lotteryId');
    if (!lotteryId) throw AppError.badRequest('lotteryId is required');

    const search = searchParams.get('search')?.trim() || null;
    const winnersOnly = searchParams.get('winnersOnly') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '200', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(MAX_LIMIT, Math.max(1, limitParam)) : 200;

    const { data, error } = await supabaseAdmin.rpc('get_lottery_participants_admin', {
      p_lottery_id: lotteryId,
      p_search: search,
      p_limit: limit,
    });

    if (error) {
      // The RPC is introduced by migration 20261020170000. Until that migration
      // has been applied to the target database, fall back to a direct
      // service-role read — service_role bypasses RLS and column grants, so this
      // path is unaffected by the tightening.
      if (error.code === 'PGRST202' || error.code === '42883') {
        const fallback = await supabaseAdmin
          .from('lottery_participants')
          .select(
            'id, lottery_id, name, ticket_number, phone, email, is_winner, prize_rank, created_at'
          )
          .eq('lottery_id', lotteryId)
          .order('is_winner', { ascending: false })
          .order('name')
          .limit(limit);

        if (fallback.error) throw AppError.internal(fallback.error.message);

        let rows = fallback.data || [];
        if (search) {
          const needle = search.toLowerCase();
          rows = rows.filter(
            (r: { name: string; ticket_number: string }) =>
              r.name.toLowerCase().includes(needle) ||
              r.ticket_number.toLowerCase().includes(needle)
          );
        }

        return NextResponse.json({ participants: rows });
      }

      throw AppError.internal(error.message);
    }

    const participants = (data || []).filter(
      (p: { is_winner: boolean }) => !winnersOnly || p.is_winner
    );

    return NextResponse.json({ participants });
  } catch (error) {
    return handleApiError(error);
  }
}
