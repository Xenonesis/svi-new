/**
 * Shared helpers for creating and managing email campaigns
 * linked to lottery draws (Command Center: Lottery ↔ EmailCenter).
 */

interface LotteryInfo {
  id: string;
  title: string;
  description?: string | null;
}

// ── Email HTML template ────────────────────────────────────────────────────

export function buildLotteryCampaignBody(title: string, description?: string | null): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
  <h2 style="color:#1a2744;border-bottom:2px solid #c9a84c;padding-bottom:10px;">${title}</h2>
  <p>Dear Participant,</p>
  <p>You have been registered for our exclusive lucky draw <strong>${title}</strong>.</p>
  <p>${description?.trim() || 'Stay tuned for the live draw. Best of luck!'}</p>
  <p style="margin-top:30px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:10px;">SVI Infra Solutions</p>
</div>`;
}

// ── Campaign title / subject convention ────────────────────────────────────

export function lotteryCampaignTitle(lotteryTitle: string): string {
  return `Lottery — ${lotteryTitle}`;
}

export function lotteryCampaignSubject(lotteryTitle: string): string {
  return `You're In! ${lotteryTitle} — SVI Infra`;
}

// ── Full API payload for POST /api/admin/campaigns ─────────────────────────

export function buildLotteryCampaignPayload(lottery: LotteryInfo) {
  return {
    title: lotteryCampaignTitle(lottery.title),
    subject: lotteryCampaignSubject(lottery.title),
    body_html: buildLotteryCampaignBody(lottery.title, lottery.description),
    recipient_group: 'lottery_participants',
    lottery_id: lottery.id,
  };
}

// ── Create linked campaign via API ─────────────────────────────────────────

export async function createLotteryCampaign(
  lottery: LotteryInfo,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildLotteryCampaignPayload(lottery)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Sync campaign title when lottery is edited ─────────────────────────────

export async function syncLinkedCampaignTitle(
  supabase: any,
  lotteryId: string,
  newTitle: string,
): Promise<void> {
  try {
    const { data: linkedCampaigns } = await supabase
      .from('email_campaigns')
      .select('id')
      .eq('lottery_id', lotteryId);

    if (!linkedCampaigns || linkedCampaigns.length === 0) return;

    await Promise.all(
      linkedCampaigns.map((c: { id: string }) =>
        supabase
          .from('email_campaigns')
          .update({
            title: lotteryCampaignTitle(newTitle),
            subject: lotteryCampaignSubject(newTitle),
          })
          .eq('id', c.id),
      ),
    );
  } catch (err) {
    console.error('Failed to sync campaign title:', err);
  }
}

// ── Delete all linked campaigns for a lottery ──────────────────────────────

export async function deleteLinkedCampaigns(
  supabase: any,
  lotteryId: string,
): Promise<void> {
  try {
    await supabase.from('email_campaigns').delete().eq('lottery_id', lotteryId);
  } catch (err) {
    console.error('Failed to delete linked campaigns:', err);
  }
}
