import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import crypto from 'crypto';
import { Resend } from 'resend';
import { winnerEmailHtml, nonWinnerEmailHtml } from '@/src/lib/email-templates';

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { lotteryId, winnerId, winnerIds } = body;
  if (!lotteryId) {
    return NextResponse.json({ error: 'lotteryId is required' }, { status: 400 });
  }

  // Normalize to array: support single winnerId or multiple winnerIds
  const selectedWinnerIds: string[] = winnerIds
    ? Array.isArray(winnerIds)
      ? winnerIds
      : [winnerIds]
    : winnerId
      ? [winnerId]
      : [];

  try {
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

    // 3. Select winners (either predetermined or cryptographically secure random)
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
      const randomIndex = crypto.randomInt(0, candidates.length);
      winners = [candidates[randomIndex]];
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
      await supabaseAdmin.from('activity_logs').insert({
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
    let emailsSentCount = 0;

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const FROM_ADDRESS = 'SVI Infra <noreply@sviiinfrasolutions.com>';
        const now = new Date();

        // 1. Send Winner Emails (all winners)
        for (const w of winners) {
          if (w.email) {
            try {
              await resend.emails.send({
                from: FROM_ADDRESS,
                to: [w.email],
                subject: `🏆 Congratulations! You won the ${lottery.title}!`,
                html: winnerEmailHtml({
                  participantName: w.name,
                  lotteryTitle: lottery.title,
                  ticketNumber: w.ticket_number,
                  drawnAt: now,
                }),
              });
              console.log(`Manual draw: Winner email successfully sent to ${w.email}`);
              emailsSentCount++;
            } catch (winnerEmailErr: any) {
              console.error(
                `Manual draw: Winner email failed for ${w.email}:`,
                winnerEmailErr.message
              );
            }
          }
        }

        // 2. Send Runner-Up (Better Luck Next Time) Emails in batches
        const runnerUps = (candidates || []).filter(
          (c: any) => !winnerIdList.includes(c.id) && c.email
        );

        if (runnerUps.length > 0) {
          console.log(
            `Manual draw: Dispatching results emails to ${runnerUps.length} runner-up participants...`
          );
          const BATCH_SIZE = 10;
          for (let i = 0; i < runnerUps.length; i += BATCH_SIZE) {
            const batch = runnerUps.slice(i, i + BATCH_SIZE);
            await Promise.allSettled(
              batch.map(async (p: any) => {
                try {
                  await resend.emails.send({
                    from: FROM_ADDRESS,
                    to: [p.email],
                    subject: `Draw Results — ${lottery.title}`,
                    html: nonWinnerEmailHtml({
                      participantName: p.name,
                      lotteryTitle: lottery.title,
                      ticketNumber: p.ticket_number,
                      winnerName: winners.map((w) => w.name).join(', '),
                      drawnAt: now,
                    }),
                  });
                  emailsSentCount++;
                } catch (emailErr: any) {
                  console.error(
                    `Manual draw: Runner-up email failed for ${p.email}:`,
                    emailErr.message
                  );
                }
              })
            );

            // Introduce a short delay between batches if there are more emails left to send
            if (i + BATCH_SIZE < runnerUps.length) {
              await new Promise((res) => setTimeout(res, 500));
            }
          }
        }
        console.log(`Manual draw: Finished sending ${emailsSentCount} email notifications.`);
      } catch (emailBlockErr) {
        console.error('Manual draw: Unexpected error in email notification block:', emailBlockErr);
      }
    } else {
      console.warn(
        'Manual draw: RESEND_API_KEY environment variable is missing. Skipping email notifications.'
      );
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSentCount > 0,
      winners: winners.map((w) => ({
        id: w.id,
        name: w.name,
        ticket_number: w.ticket_number,
        phone: w.phone,
        email: w.email,
      })),
    });
  } catch (err: any) {
    console.error('Lottery draw server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
