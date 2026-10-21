import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isAllowedRecordingUrl } from '@/src/lib/leads/recordingProxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-Origin IVR Recording Streaming Proxy
 *
 * GET /api/admin/leads/recording?url=<encoded_upstream_url>
 *
 * Requirements:
 * 1. Admin Authentication: Verifies caller has active admin profile (Bearer or cookie).
 * 2. SSRF Protection: Validates hostname against strict allowlist (49.50.77.194) and path prefix (/recordings/).
 * 3. Range Passthrough: Forwards HTTP Range headers from browser <audio> requests so scrub/seek works.
 * 4. Mixed-Content Elimination: Serves call recordings over same-origin HTTPS, preventing browser blocks.
 */
export async function GET(request: NextRequest): Promise<NextResponse | Response> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized('Admin access required to listen to call recordings');

    const targetUrl = request.nextUrl.searchParams.get('url');
    if (!targetUrl) {
      throw AppError.badRequest('Missing url query parameter');
    }

    if (!isAllowedRecordingUrl(targetUrl)) {
      throw AppError.forbidden('Recording URL is not from an authorized telephony host');
    }

    // Forward Range header from client so HTMLMediaElement seeking/scrubbing works smoothly
    const clientRange = request.headers.get('range');
    const upstreamHeaders: Record<string, string> = {};
    if (clientRange) {
      upstreamHeaders['Range'] = clientRange;
    }

    const upstreamResponse = await fetch(targetUrl, {
      headers: upstreamHeaders,
      cache: 'no-store',
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      if (upstreamResponse.status === 404) {
        throw AppError.notFound('Call recording file not found on telephony server');
      }
      throw AppError.internal(
        `Telephony audio server returned status ${upstreamResponse.status}`
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamResponse.headers.get('content-type') || 'audio/x-wav');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'private, max-age=3600');

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
