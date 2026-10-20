import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { AppError } from '@/src/lib/api/errors';
import crypto from 'crypto';
import { reminderEmailHtml, winnerEmailHtml, nonWinnerEmailHtml } from '@/src/lib/email-templates';
import {
  dispatchLotteryEmails,
  type LotteryEmailRecipient,
} from '@/src/lib/lottery/dispatchEmails';
import { writeActivityLog } from '@/src/lib/repositories/activityLogWriter';

const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';

// ─── Main Cron Handler ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Protect the cron endpoint
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    throw AppError.unauthorized();
  }

  const now = new Date();
  const results: string[] = [];

  try {
    // Fetch all pending/reminder_sent scheduled draws
    const { data: pendingDraws, error: fetchError } = await supabaseAdmin
      .from('scheduled_draws')
      .select('*')
      .in('status', ['pending', 'reminder_sent']);

    if (fetchError) throw fetchError;
    if (!pendingDraws || pendingDraws.length === 0) {
      return NextResponse.json({ ok: true, message: 'No pending scheduled draws.', results });
    }

    for (const draw of pendingDraws) {
      const scheduledAt = new Date(draw.scheduled_at);
      const preNotifyAt = new Date(scheduledAt.getTime() - draw.pre_notify_minutes * 60 * 1000);

      // ── 1. EXECUTE THE DRAW ──────────────────────────────────────────────
      if (scheduledAt <= now && draw.status !== 'executed') {
        results.push(`[${draw.id}] Executing draw for lottery ${draw.lottery_id}...`);

        try {
          // Fetch lottery
          const { data: lottery, error: lError } = await supabaseAdmin
            .from('lotteries')
            .select('*')
            .eq('id', draw.lottery_id)
            .single();

          if (lError || !lottery) {
            results.push(`  → Lottery not found, skipping.`);
            continue;
          }

          if (lottery.status !== 'active') {
            results.push(`  → Lottery is not active (${lottery.status}), marking executed.`);
            await supabaseAdmin
              .from('scheduled_draws')
              .update({ status: 'executed', executed_at: now.toISOString() })
              .eq('id', draw.id);
            continue;
          }

          // Fetch all participants
          const { data: participants, error: pError } = await supabaseAdmin
            .from('lottery_participants')
            .select('id, name, phone, email, ticket_number, is_winner')
            .eq('lottery_id', draw.lottery_id);

          if (pError || !participants || participants.length === 0) {
            results.push(`  → No participants found, skipping.`);
            continue;
          }

          // Pick winner
          const randomIndex = crypto.randomInt(0, participants.length);
          const winner = participants[randomIndex];

          // Mark winner
          await supabaseAdmin
            .from('lottery_participants')
            .update({ is_winner: true, prize_rank: 1 })
            .eq('id', winner.id);

          // Mark lottery completed
          await supabaseAdmin
            .from('lotteries')
            .update({ status: 'completed' })
            .eq('id', draw.lottery_id);

          // Mark scheduled draw executed
          await supabaseAdmin
            .from('scheduled_draws')
            .update({ status: 'executed', executed_at: now.toISOString() })
            .eq('id', draw.id);

          results.push(`  → Winner: ${winner.name} (${winner.ticket_number})`);

          // Send winner + non-winner emails through the shared dispatcher
          const emailRecipients: LotteryEmailRecipient[] = [
            ...(winner.email
              ? [
                  {
                    email: winner.email,
                    name: winner.name,
                    ticketNumber: winner.ticket_number,
                    subject: `Congratulations! You won the ${lottery.title}!`,
                    html: winnerEmailHtml({
                      participantName: winner.name,
                      lotteryTitle: lottery.title,
                      ticketNumber: winner.ticket_number,
                      drawnAt: now,
                    }),
                  },
                ]
              : []),
            ...participants
              .filter(
                (p): p is typeof p & { email: string } => p.id !== winner.id && Boolean(p.email)
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
                  winnerName: winner.name,
                  drawnAt: now,
                }),
              })),
          ];

          const apiKey = process.env.RESEND_API_KEY;
          if (apiKey) {
            const dispatch = await dispatchLotteryEmails(
              apiKey,
              FROM_ADDRESS,
              emailRecipients,
              `cron-${draw.id}`
            );
            results.push(
              `  → ${dispatch.sent} emails sent, ${dispatch.failed} failed (${dispatch.rejected.length} rejected, ${dispatch.retryable.length} retryable).`
            );
            for (const rejection of dispatch.rejected) {
              console.error(
                `Scheduled draw: email rejected for ${rejection.email}: ${rejection.reason}`
              );
            }
            for (const failure of dispatch.retryable) {
              console.error(`Scheduled draw: email failed for ${failure.email}: ${failure.reason}`);
            }
          } else {
            results.push('  → RESEND_API_KEY missing; skipped email notifications.');
          }

          // Log activity
          try {
            await writeActivityLog({
              user_id: null,
              action_type: 'lottery_drawn',
              description: `Scheduled draw executed for "${lottery.title}". Winner: ${winner.name} (${winner.ticket_number}).`,
              metadata: {
                event: 'scheduled_draw_executed',
                lotteryId: draw.lottery_id,
                scheduleId: draw.id,
                winnerName: winner.name,
                ticketNumber: winner.ticket_number,
              },
            });
          } catch (logErr) {
            console.error('Failed to log draw activity:', logErr);
          }
        } catch (drawErr: any) {
          results.push(`  → Draw execution error: ${drawErr.message}`);
          console.error('Scheduled draw execution error:', drawErr);
        }
      }

      // ── 2. SEND PRE-DRAW REMINDER ────────────────────────────────────────
      else if (draw.status === 'pending' && preNotifyAt <= now && scheduledAt > now) {
        results.push(`[${draw.id}] Sending reminder for lottery ${draw.lottery_id}...`);

        try {
          const { data: lottery } = await supabaseAdmin
            .from('lotteries')
            .select('title')
            .eq('id', draw.lottery_id)
            .single();

          if (!lottery) {
            results.push(`  → Lottery not found, skipping reminder.`);
            continue;
          }

          const { data: participants } = await supabaseAdmin
            .from('lottery_participants')
            .select('name, email, ticket_number')
            .eq('lottery_id', draw.lottery_id)
            .not('email', 'is', null);

          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey) {
            results.push('  → RESEND_API_KEY missing; skipped reminder emails.');
          } else if (participants && participants.length > 0) {
            const reminderRecipients: LotteryEmailRecipient[] = participants
              .filter((p): p is typeof p & { email: string } => Boolean(p.email))
              .map((p) => ({
                email: p.email,
                name: p.name,
                ticketNumber: p.ticket_number,
                subject: `Reminder: ${lottery.title} draw is happening soon!`,
                html: reminderEmailHtml({
                  participantName: p.name,
                  lotteryTitle: lottery.title,
                  scheduledAt,
                  ticketNumber: p.ticket_number,
                  includeCountdown: draw.include_countdown_in_email,
                }),
              }));

            const dispatch = await dispatchLotteryEmails(
              apiKey,
              FROM_ADDRESS,
              reminderRecipients,
              `reminder-${draw.id}`
            );
            results.push(`  → ${dispatch.sent} reminder emails sent, ${dispatch.failed} failed.`);
            for (const rejection of dispatch.rejected) {
              console.error(`Reminder email rejected for ${rejection.email}: ${rejection.reason}`);
            }
            for (const failure of dispatch.retryable) {
              console.error(`Reminder email failed for ${failure.email}: ${failure.reason}`);
            }
          }

          // Mark as reminder_sent
          await supabaseAdmin
            .from('scheduled_draws')
            .update({ status: 'reminder_sent', reminder_sent_at: now.toISOString() })
            .eq('id', draw.id);
        } catch (reminderErr: any) {
          results.push(`  → Reminder error: ${reminderErr.message}`);
          console.error('Reminder send error:', reminderErr);
        }
      }
    }

    return NextResponse.json({ ok: true, checked: pendingDraws.length, results });
  } catch (err: any) {
    console.error('[Cron] Lottery cron error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
