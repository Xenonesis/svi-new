import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { broadcastPushNotification } from '@/src/lib/pwa/sendPush';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.body === 'string' ? body.body.trim() : '';
    const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : '/';
    const endpoint =
      typeof body.endpoint === 'string' && body.endpoint.trim() ? body.endpoint.trim() : undefined;

    if (!title) {
      throw AppError.badRequest('Notification title is required');
    }
    if (!message) {
      throw AppError.badRequest('Notification message body is required');
    }

    const result = await broadcastPushNotification(
      {
        title,
        body: message,
        url,
        tag: 'svi-admin-broadcast',
      },
      endpoint
    );

    return NextResponse.json({
      success: true,
      message:
        result.total === 0
          ? 'No active subscribers found.'
          : `Notification sent to ${result.sent} of ${result.total} subscribers.`,
      result,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
