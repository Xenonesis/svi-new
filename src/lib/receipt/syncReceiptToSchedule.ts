import type { SupabaseClient } from '@supabase/supabase-js';

export interface SyncReceiptParams {
  receiptNo: string | number;
  amount: string | number;
  date?: string | null;
  refId?: string | null;
  userId?: string | null;
  plotNo?: string | null;
  name?: string | null;
  isTrashed?: boolean;
  status?: 'paid' | 'pending';
}

export interface SyncReceiptResult {
  synced: boolean;
  action: 'inserted' | 'updated' | 'deleted' | 'skipped';
  allotmentId?: string;
  scheduleId?: string;
  error?: string;
}

function cleanRef(val?: string | null): string {
  if (!val) return '';
  return String(val)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isUnitMatch(unitNo?: string | null, target?: string | null): boolean {
  const u = cleanRef(unitNo);
  const t = cleanRef(target);
  if (!u || !t) return false;
  if (u === t) return true;
  if (t === `plot${u}` || t === `unit${u}`) return true;
  if (u === `plot${t}` || u === `unit${t}`) return true;
  return false;
}

export async function syncReceiptToPaymentSchedule(
  supabase: SupabaseClient,
  params: SyncReceiptParams
): Promise<SyncReceiptResult> {
  const { receiptNo, amount, date, refId, plotNo, name, isTrashed } = params;

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
    let matchingAllotment: {
      id: string;
      user_id: string;
      unit_no: string;
      metadata?: Record<string, unknown>;
    } | null = null;

    const { data: allots } = await supabase
      .from('allotments')
      .select('id, user_id, unit_no, metadata');

    const cleanInputRef = cleanRef(refId);

    if (cleanInputRef && allots && allots.length > 0) {
      matchingAllotment =
        allots.find((a) => {
          const tId =
            cleanRef(a.metadata?.ticket_id as string) || cleanRef(a.metadata?.ticketId as string);
          return Boolean(tId && tId === cleanInputRef);
        }) || null;
    }

    if (!matchingAllotment && (plotNo || refId) && allots && allots.length > 0) {
      const targetPlot = cleanRef(plotNo) || cleanRef(refId);
      matchingAllotment = allots.find((a) => isUnitMatch(a.unit_no, targetPlot)) || null;
    }

    if (!matchingAllotment && name && allots && allots.length > 0) {
      const cleanTargetName = cleanRef(name);
      if (cleanTargetName) {
        matchingAllotment =
          allots.find((a) => {
            const clientName = cleanRef(a.metadata?.client_name as string);
            return Boolean(
              clientName &&
              (clientName === cleanTargetName ||
                cleanTargetName.includes(clientName) ||
                clientName.includes(cleanTargetName))
            );
          }) || null;
      }
    }

    if (!matchingAllotment) {
      return { synced: false, action: 'skipped', error: 'No matching allotment found for receipt' };
    }

    const { data: existingSchedules } = await supabase
      .from('payment_schedules')
      .select('id, title, amount')
      .eq('allotment_id', matchingAllotment.id)
      .ilike('title', `%#${cleanReceiptNo}%`);

    const existing =
      existingSchedules && existingSchedules.length > 0 ? existingSchedules[0] : null;

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

    const effectiveStatus = params.status || 'paid';
    const schedulePaidDate = effectiveStatus === 'paid' ? effectiveDate : null;

    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('payment_schedules')
        .update({
          title: receiptTitle,
          amount: numAmount,
          paid_date: schedulePaidDate,
          due_date: effectiveDate,
          status: effectiveStatus,
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
          paid_date: schedulePaidDate,
          status: effectiveStatus,
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
