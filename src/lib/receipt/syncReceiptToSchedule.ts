import type { SupabaseClient } from '@supabase/supabase-js';

export interface SyncReceiptParams {
  receiptNo: string | number;
  amount: string | number;
  date?: string | null;
  refId?: string | null;
  userId?: string | null;
  plotNo?: string | null;
  isTrashed?: boolean;
}

export interface SyncReceiptResult {
  synced: boolean;
  action: 'inserted' | 'updated' | 'deleted' | 'skipped';
  allotmentId?: string;
  scheduleId?: string;
  error?: string;
}

/**
 * Normalizes ticket/ref identifiers for flexible matching.
 * e.g. "SVI-2236" -> "svi2236", "Plot 41" -> "41"
 */
function cleanRef(val?: string | null): string {
  if (!val) return '';
  return String(val)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Automatically synchronizes a payment receipt from the documents table
 * into the allotment portal's payment_schedules ledger table.
 */
export async function syncReceiptToPaymentSchedule(
  supabase: SupabaseClient,
  params: SyncReceiptParams
): Promise<SyncReceiptResult> {
  const { receiptNo, amount, date, refId, userId, plotNo, isTrashed } = params;

  const cleanReceiptNo = String(receiptNo || '').trim();
  const numAmount =
    typeof amount === 'number'
      ? amount
      : parseFloat(String(amount || '0').replace(/[^0-9.-]+/g, ''));

  if (!cleanReceiptNo || isNaN(numAmount) || numAmount <= 0) {
    return { synced: false, action: 'skipped', error: 'Invalid receipt number or amount' };
  }

  const receiptTitle = `Payment Receipt #${cleanReceiptNo}`;
  const effectiveDate = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];

  try {
    // 1. Find matching allotment
    let matchingAllotment: {
      id: string;
      user_id: string;
      unit_no: string;
      metadata?: Record<string, unknown>;
    } | null = null;

    // Strategy A: Match by ticket_id in metadata
    if (refId) {
      const cleanInputRef = cleanRef(refId);
      const { data: allots } = await supabase
        .from('allotments')
        .select('id, user_id, unit_no, metadata');

      if (allots && allots.length > 0) {
        matchingAllotment =
          allots.find((a) => {
            const tId =
              cleanRef(a.metadata?.ticket_id as string) || cleanRef(a.metadata?.ticketId as string);
            if (tId && tId === cleanInputRef) return true;
            // Also check if ref matches unit_no (e.g. "A-41" or "41")
            const cleanUnit = cleanRef(a.unit_no);
            if (cleanUnit && (cleanUnit === cleanInputRef || cleanInputRef.endsWith(cleanUnit)))
              return true;
            return false;
          }) || null;
      }
    }

    // Strategy B: Match by user_id
    if (!matchingAllotment && userId) {
      const { data: allotByUser } = await supabase
        .from('allotments')
        .select('id, user_id, unit_no, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (allotByUser) {
        matchingAllotment = allotByUser;
      }
    }

    // Strategy C: Match by plotNo
    if (!matchingAllotment && plotNo) {
      const cleanPlot = cleanRef(plotNo);
      const { data: allotByPlot } = await supabase
        .from('allotments')
        .select('id, user_id, unit_no, metadata');

      if (allotByPlot) {
        matchingAllotment = allotByPlot.find((a) => cleanRef(a.unit_no) === cleanPlot) || null;
      }
    }

    if (!matchingAllotment) {
      return { synced: false, action: 'skipped', error: 'No matching allotment found for receipt' };
    }

    // 2. Check if a schedule with this receipt title already exists for this allotment
    const { data: existingSchedules } = await supabase
      .from('payment_schedules')
      .select('id, title, amount')
      .eq('allotment_id', matchingAllotment.id)
      .ilike('title', `%#${cleanReceiptNo}%`);

    const existing =
      existingSchedules && existingSchedules.length > 0 ? existingSchedules[0] : null;

    // If trashed/deleted, remove schedule or skip
    if (isTrashed) {
      if (existing) {
        await supabase.from('payment_schedules').delete().eq('id', existing.id);
        return {
          synced: true,
          action: 'deleted',
          allotmentId: matchingAllotment.id,
          scheduleId: existing.id,
        };
      }
      return { synced: true, action: 'skipped', allotmentId: matchingAllotment.id };
    }

    // 3. Upsert into payment_schedules
    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('payment_schedules')
        .update({
          title: receiptTitle,
          amount: numAmount,
          paid_date: effectiveDate,
          due_date: effectiveDate,
          status: 'paid',
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (updateErr) throw updateErr;

      return {
        synced: true,
        action: 'updated',
        allotmentId: matchingAllotment.id,
        scheduleId: updated.id,
      };
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('payment_schedules')
        .insert({
          allotment_id: matchingAllotment.id,
          user_id: matchingAllotment.user_id,
          title: receiptTitle,
          amount: numAmount,
          due_date: effectiveDate,
          paid_date: effectiveDate,
          status: 'paid',
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      return {
        synced: true,
        action: 'inserted',
        allotmentId: matchingAllotment.id,
        scheduleId: inserted.id,
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SYNC-RECEIPT-SCHEDULE] Failed for receipt #${cleanReceiptNo}:`, message);
    return { synced: false, action: 'skipped', error: message };
  }
}
