import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { normalizeRefId } from '@/src/lib/receipt/receiptLedger';

// POST /api/admin/portal-allotments/deal-value
// Persists agreed deal value (total amount) and rate per sq. yard directly to the database
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json().catch(() => null);
    if (!body || !body.refId) {
      throw AppError.badRequest('refId is required');
    }

    const { refId, dealValue, area, ratePerSqYd } = body;
    const numericDealValue = typeof dealValue === 'number' ? dealValue : parseFloat(dealValue) || 0;
    const numericArea = area ? parseFloat(String(area)) || null : null;
    const numericRate = ratePerSqYd ? parseFloat(String(ratePerSqYd)) || null : null;
    const norm = normalizeRefId(refId);

    // 1. Find and update matching allotment(s) in `allotments` table
    const { data: allAllotments, error: allotError } = await supabaseAdmin
      .from('allotments')
      .select('id, metadata, unit_no');

    if (allotError) {
      console.error('Error fetching allotments for deal value update:', allotError);
    }

    let updatedAllotmentsCount = 0;
    if (allAllotments && allAllotments.length > 0) {
      const matchingAllotments = allAllotments.filter((a) => {
        const meta = (a.metadata as Record<string, unknown>) || {};
        const tId = meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id;
        return normalizeRefId(String(tId)) === norm;
      });

      for (const allot of matchingAllotments) {
        const existingMeta = (allot.metadata as Record<string, unknown>) || {};
        const updatedMeta = {
          ...existingMeta,
          total_cost: numericDealValue,
          ...(numericArea !== null ? { area: String(numericArea) } : {}),
          ...(numericRate !== null ? { rate_per_sq_yd: numericRate } : {}),
        };

        const { error: updateErr } = await supabaseAdmin
          .from('allotments')
          .update({
            metadata: updatedMeta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', allot.id);

        if (!updateErr) {
          updatedAllotmentsCount++;
        } else {
          console.error(`Failed to update allotment ${allot.id}:`, updateErr);
        }
      }
    }

    // 2. Update portal_settings (receipt_deal_values) so all receipt calculators reflect it globally
    const { data: existingSetting } = await supabaseAdmin
      .from('portal_settings')
      .select('value')
      .eq('key', 'receipt_deal_values')
      .maybeSingle();

    const currentMap = (existingSetting?.value as Record<string, unknown>) || {};
    const updatedMap = {
      ...currentMap,
      [refId]: numericDealValue,
      [norm]: numericDealValue,
    };

    const { error: settingError } = await supabaseAdmin.from('portal_settings').upsert({
      key: 'receipt_deal_values',
      value: updatedMap,
      updated_at: new Date().toISOString(),
    });

    if (settingError) {
      console.warn('Failed to upsert portal_settings receipt_deal_values:', settingError);
    }

    // 3. Log activity in activity_logs (non-blocking)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'deal_value_updated',
        description: `Updated deal value for ${refId} to ₹${numericDealValue.toLocaleString('en-IN')}${numericRate ? ` (₹${numericRate}/sq.yd.)` : ''}`,
        metadata: {
          refId,
          norm,
          dealValue: numericDealValue,
          area: numericArea,
          ratePerSqYd: numericRate,
          updatedAllotmentsCount,
        },
      });
    } catch (logErr) {
      console.warn('Failed to log deal value activity:', logErr);
    }

    return NextResponse.json({
      success: true,
      refId,
      normalizedRefId: norm,
      dealValue: numericDealValue,
      area: numericArea,
      ratePerSqYd: numericRate,
      updatedAllotmentsCount,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
