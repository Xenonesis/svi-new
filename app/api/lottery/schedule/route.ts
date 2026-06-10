import { NextRequest, NextResponse } from 'next/server';
import { lotteryRepository } from '@/src/lib/repositories';

/**
 * GET /api/lottery/schedule
 * Public endpoint — returns the active lottery's scheduled draw info (for countdown)
 */
export async function GET(_request: NextRequest) {
  try {
    const { data: activeLottery, error: lError } = await lotteryRepository.getActive();
    if (lError) throw lError;
    if (!activeLottery) return NextResponse.json({ scheduled: null });

    const { data: scheduledDraw, error: sError } = await lotteryRepository.getPublicSchedule(
      activeLottery.id
    );
    if (sError) throw sError;

    return NextResponse.json({
      scheduled: scheduledDraw
        ? {
            id: scheduledDraw.id,
            scheduled_at: scheduledDraw.scheduled_at,
            status: scheduledDraw.status,
            lottery_title: activeLottery.title,
          }
        : null,
    });
  } catch (err: any) {
    console.error('[Public schedule API] Error:', err);
    return NextResponse.json({ scheduled: null });
  }
}
