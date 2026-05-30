import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import crypto from 'crypto';

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

  const { lotteryId } = body;
  if (!lotteryId) {
    return NextResponse.json({ error: 'lotteryId is required' }, { status: 400 });
  }

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

    // 3. Select winner cryptographically securely using native crypto.randomInt
    const randomIndex = crypto.randomInt(0, candidates.length);
    const winner = candidates[randomIndex];

    // 4. Update participant to is_winner = true
    const { error: winnerError } = await supabaseAdmin
      .from('lottery_participants')
      .update({ is_winner: true, prize_rank: 1 })
      .eq('id', winner.id);

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

      await supabaseAdmin.from('activity_logs').insert({
        user_id: admin.id,
        action_type: 'lottery_drawn',
        description: `${adminName} executed lottery drawing for "${lottery.title}". Winner: ${winner.name} (${winner.ticket_number}).`,
        metadata: {
          event: 'lottery_drawn',
          lotteryId,
          winnerName: winner.name,
          ticketNumber: winner.ticket_number,
        },
      });
    } catch (logErr) {
      console.error('Failed to log lottery draw activity:', logErr);
    }

    return NextResponse.json({
      success: true,
      winner: {
        id: winner.id,
        name: winner.name,
        ticket_number: winner.ticket_number,
        phone: winner.phone,
        email: winner.email,
      },
    });
  } catch (err: any) {
    console.error('Lottery draw server error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
