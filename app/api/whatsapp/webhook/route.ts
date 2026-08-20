import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppProvider } from '@/src/lib/whatsapp/provider';
import { persistWebhookEvents } from '@/src/lib/whatsapp/persistence';
import { verifyMetaWebhookSignature } from '@/src/lib/whatsapp/signature';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return NextResponse.json({ error: 'Webhook verification failed' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const signature = request.headers.get('x-hub-signature-256');

  if (process.env.NODE_ENV === 'production' && !appSecret) {
    return NextResponse.json(
      { error: 'Webhook signature verification is not configured' },
      { status: 503 }
    );
  }
  if (appSecret && !verifyMetaWebhookSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed webhook payload' }, { status: 400 });
  }

  try {
    const events = getWhatsAppProvider().parseWebhook(payload);
    await persistWebhookEvents(events);
    return NextResponse.json({ received: true });
  } catch (error) {
    // Never log message bodies, tokens, phone numbers, or raw webhook payloads.
    console.error('WhatsApp webhook persistence failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Webhook persistence failed' }, { status: 500 });
  }
}
