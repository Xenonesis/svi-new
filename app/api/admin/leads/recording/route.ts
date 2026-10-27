import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isAllowedRecordingUrl } from '@/src/lib/leads/recordingProxy';
import {
  CALL_RECORDINGS_BUCKET,
  deriveStoragePath,
  extractPhoneFromUrl,
  syncRecordingToInHouseStorage,
} from '@/src/lib/leads/syncRecordingToStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-Origin IVR Recording Streaming Proxy & High-Speed CDN Gateway
 *
 * GET /api/admin/leads/recording?url=<encoded_upstream_url>&phone=<customer_phone>
 *
 * High-Speed Pipeline:
 * 1. Checks if file is archived in private Supabase Storage `call-recordings`.
 *    If present, issues an instant 307 Temporary Redirect to a signed CDN URL.
 *    The browser's HTML5 <audio> element streams directly from the global CDN edge
 *    with native byte-range slicing (HTTP 206) and zero Node.js server RAM buffering.
 * 2. If not yet in Supabase Storage, streams the response directly from the upstream
 *    telephony server with Range passthrough, and schedules non-blocking background
 *    archival to Supabase Storage so subsequent plays hit the CDN.
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

    const directStoragePath = request.nextUrl.searchParams.get('storage_path');
    const customerPhone =
      request.nextUrl.searchParams.get('phone') || extractPhoneFromUrl(targetUrl) || '';
    const inHousePath = directStoragePath || deriveStoragePath(customerPhone, targetUrl);
    // 1. Fast path: In-house Supabase Storage CDN signed URL (Zero RAM buffering)
    try {
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from(CALL_RECORDINGS_BUCKET)
        .createSignedUrl(inHousePath, 86400); // 24hr expiration

      if (!signedError && signedData?.signedUrl) {
        const redirectHeaders = new Headers();
        redirectHeaders.set('Location', signedData.signedUrl);
        redirectHeaders.set('Cache-Control', 'private, max-age=86400');
        redirectHeaders.set('X-Source', 'in-house-supabase-storage-cdn');

        return new Response(null, {
          status: 307,
          headers: redirectHeaders,
        });
      }
    } catch {
      // Fall back to upstream telephony proxy if storage check encounters temporary error
    }

    // 2. Fallback: Stream from upstream telephony server
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
      return NextResponse.json(
        { error: 'Failed to fetch recording from upstream telephony server' },
        { status: upstreamResponse.status || 502 }
      );
    }

    // 3. Trigger asynchronous background archival so future plays hit the CDN
    if (customerPhone) {
      syncRecordingToInHouseStorage(customerPhone, targetUrl).catch(() => {});
    }

    const responseHeaders = new Headers();
    responseHeaders.set(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'audio/x-wav'
    );
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'private, max-age=3600');
    responseHeaders.set('X-Source', 'upstream-telephony-proxy');

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
