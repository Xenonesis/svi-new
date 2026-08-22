import { NextRequest, NextResponse } from 'next/server';
import { drainPendingWhatsAppWork } from '@/src/lib/whatsapp/processor';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stats = await drainPendingWhatsAppWork(10, 'whatsapp-cron');
  return NextResponse.json(stats);
}

export const POST = GET;
