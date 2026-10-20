import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import crypto from 'crypto';
import { winnerEmailHtml, nonWinnerEmailHtml } from '@/src/lib/email-templates';
import { lotteryDrawSchema } from '@/src/lib/api/schemas';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import {
  dispatchLotteryEmails,
  type LotteryEmailDispatchResult,
  type LotteryEmailRecipient,
} from '@/src/lib/lottery/dispatchEmails';
import { writeActivityLog } from '@/src/lib/repositories/activityLogWriter';

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      throw AppError.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw AppError.badRequest('Invalid JSON body');
    }

    const parsed = lotteryDrawSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.validationError(
        parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }))
      );
    }

    const { lotteryId, winnerId, winnerIds } = parsed.data;

    // Normalize to array: support single winnerId or multiple winnerIds
    const selectedWinnerIds: string[] = winnerIds
      ? Array.isArray(winnerIds)
        ? winnerIds
        : [winnerIds]
      : winnerId
        ? [winnerId]
        : [];

    // 1. Fetch active lottery
    const { data: lottery, error: lotteryError } = await supabaseAdmin
      .from('lotteries')
      .select('*')
      .eq('id', lotteryId)
      .single();

    if (lotteryError || !lottery) {
      return NextResponse.json({ error: 'Lottery not found' }, { status: 404 });
    }

    if (lottery.status !== 'active') {
      return NextResponse.json({ error: 'This lottery is not active' }, { status: 400 });
    }

    // 2. Fetch candidates for this lottery
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('lottery_participants')
      .select('id, name, ticket_number, phone, email')
      .eq('lottery_id', lotteryId);

    if (candidatesError) {
      throw candidatesError;
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: 'No participants found for this lottery' },
        { status: 400 }
      );
    }

    // 3. Select winners (predetermined/customisable only)
    let winners: typeof candidates;
    if (selectedWinnerIds.length > 0) {
      winners = candidates.filter((c) => selectedWinnerIds.includes(c.id));
      if (winners.length === 0) {
        return NextResponse.json(
          { error: 'None of the selected winner IDs match participants in this lottery' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'No predetermined winner selected. A winner must be chosen.' },
        { status: 400 }
      );
    }

    // 4. Update all winners to is_winner = true
    const winnerIdList = winners.map((w) => w.id);
    const { error: winnerError } = await supabaseAdmin
      .from('lottery_participants')
      .update({ is_winner: true, prize_rank: 1 })
      .in('id', winnerIdList);

    if (winnerError) throw winnerError;

    // 5. Update lottery status to 'completed'
    const { error: lotteryUpdateError } = await supabaseAdmin
      .from('lotteries')
      .update({ status: 'completed' })
      .eq('id', lotteryId);

    if (lotteryUpdateError) throw lotteryUpdateError;

    // 6. Log activity
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', admin.id)
        .single();
      const adminName = profile?.full_name || admin.email || 'Admin';

      const winnerSummary = winners.map((w) => `${w.name} (${w.ticket_number})`).join(', ');
      await writeActivityLog({
        user_id: admin.id,
        action_type: 'lottery_drawn',
        description: `${adminName} executed lottery drawing for "${lottery.title}". Winner${winners.length > 1 ? 's' : ''}: ${winnerSummary}.`,
        metadata: {
          event: 'lottery_drawn',
          lotteryId,
          winnerNames: winners.map((w) => w.name),
          ticketNumbers: winners.map((w) => w.ticket_number),
        },
      });
    } catch (logErr) {
      console.error('Failed to log lottery draw activity:', logErr);
    }

    // 7. Send automated email notifications using Resend
    const apiKey = process.env.RESEND_API_KEY;
    const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';
    const now = new Date();
    const winnerNames = winners.map((w) => w.name).join(', ');

    const winnerRecipients: LotteryEmailRecipient[] = winners
      .filter((w): w is typeof w & { email: string } => Boolean(w.email))
      .map((w) => ({
        email: w.email,
        name: w.name,
        ticketNumber: w.ticket_number,
        subject: `Congratulations! You won the ${lottery.title}!`,
        html: winnerEmailHtml({
          participantName: w.name,
          lotteryTitle: lottery.title,
          ticketNumber: w.ticket_number,
          drawnAt: now,
        }),
      }));

    const runnerUpRecipients: LotteryEmailRecipient[] = candidates
      .filter(
        (c): c is typeof c & { email: string } => !winnerIdList.includes(c.id) && Boolean(c.email)
      )
      .map((p) => ({
        email: p.email,
        name: p.name,
        ticketNumber: p.ticket_number,
        subject: `Draw Results — ${lottery.title}`,
        html: nonWinnerEmailHtml({
          participantName: p.name,
          lotteryTitle: lottery.title,
          ticketNumber: p.ticket_number,
          winnerName: winnerNames,
          drawnAt: now,
        }),
      }));

    let emailDispatch: LotteryEmailDispatchResult = {
      sent: 0,
      failed: 0,
      skipped: 0,
      rejected: [],
      retryable: [],
    };

    if (apiKey) {
      emailDispatch = await dispatchLotteryEmails(
        apiKey,
        FROM_ADDRESS,
        [...winnerRecipients, ...runnerUpRecipients],
        lotteryId
      );

      for (const rejection of emailDispatch.rejected) {
        console.error(
          `Manual draw: email permanently rejected for ${rejection.email}: ${rejection.reason}`
        );
      }
      for (const failure of emailDispatch.retryable) {
        console.error(
          `Manual draw: email failed (retryable) for ${failure.email}: ${failure.reason}`
        );
      }
    } else {
      console.warn(
        'Manual draw: RESEND_API_KEY environment variable is missing. Skipping email notifications.'
      );
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailDispatch.sent > 0,
      emailDispatch: {
        sent: emailDispatch.sent,
        failed: emailDispatch.failed,
        skipped: emailDispatch.skipped,
        rejectedCount: emailDispatch.rejected.length,
        retryableCount: emailDispatch.retryable.length,
      },
      winners: winners.map((w) => ({
        id: w.id,
        name: w.name,
        ticket_number: w.ticket_number,
        phone: w.phone,
        email: w.email,
      })),
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
