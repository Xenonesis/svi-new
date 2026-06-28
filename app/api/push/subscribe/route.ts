import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys, auth, p256dh } = await request.json();

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Missing endpoint or keys' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
      {
        endpoint,
        keys,
        auth: auth || null,
        p256dh: p256dh || null,
        user_agent: request.headers.get('user-agent') || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.error('Failed to save push subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
