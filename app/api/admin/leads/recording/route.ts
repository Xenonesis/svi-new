import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { isAllowedRecordingUrl } from '@/src/lib/leads/recordingProxy';
import { CALL_RECORDINGS_BUCKET, deriveStoragePath } from '@/src/lib/leads/syncRecordingToStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-Origin IVR Recording Streaming Proxy
 *
 * GET /api/admin/leads/recording?url=<encoded_upstream_url>&phone=<customer_phone>
 *
 * In-House Priority:
 * 1. Checks if file already exists in private Supabase Storage `call-recordings`.
 *    If present, downloads from in-house bucket directly (zero dependency on third-party).
 * 2. If not yet in Supabase Storage, fetches from third-party telephony server,
 *    and triggers asynchronous archival so next listen is 100% in-house.
 * 3. Range Passthrough: Forwards HTTP Range headers from browser <audio> requests for timeline scrubbing.
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

    const customerPhone = request.nextUrl.searchParams.get('phone') || '';
    const inHousePath = deriveStoragePath(customerPhone, targetUrl);

    // 1. Check in-house Supabase Storage first
    const pathParts = inHousePath.split('/');
    const folder = pathParts.slice(0, -1).join('/');
    const targetFile = pathParts[pathParts.length - 1];

    let inHouseBlob: Blob | null = null;
    try {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from(CALL_RECORDINGS_BUCKET)
        .list(folder, { search: targetFile, limit: 1 });

      if (existingFiles && existingFiles.some((f) => f.name === targetFile)) {
        const { data: downloadedBlob } = await supabaseAdmin.storage
          .from(CALL_RECORDINGS_BUCKET)
          .download(inHousePath);
        if (downloadedBlob) {
          inHouseBlob = downloadedBlob;
        }
      }
    } catch {
      // Fallback to upstream if storage check encounters temporary error
    }

    // 1A. Serve from In-House Storage if available
    if (inHouseBlob) {
      const buffer = Buffer.from(await inHouseBlob.arrayBuffer());
      const totalSize = buffer.length;
      const clientRange = request.headers.get('range');

      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', inHouseBlob.type || 'audio/x-wav');
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Cache-Control', 'private, max-age=86400');
      responseHeaders.set('X-Source', 'in-house-supabase-storage');

      if (clientRange) {
        // e.g. "bytes=0-1024" or "bytes=1024-"
        const match = clientRange.match(/bytes=(\d+)-(\d*)/);
        if (match) {
          const start = parseInt(match[1], 10);
          const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
          const chunkStart = Math.min(start, totalSize - 1);
          const chunkEnd = Math.min(end, totalSize - 1);
          const chunkSize = chunkEnd - chunkStart + 1;

          responseHeaders.set('Content-Range', `bytes ${chunkStart}-${chunkEnd}/${totalSize}`);
          responseHeaders.set('Content-Length', String(chunkSize));

          const slicedBuffer = buffer.subarray(chunkStart, chunkEnd + 1);
          return new Response(slicedBuffer, {
            status: 206,
            headers: responseHeaders,
          });
        }
      }

      responseHeaders.set('Content-Length', String(totalSize));
      return new Response(buffer, {
        status: 200,
        headers: responseHeaders,
      });
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
      if (upstreamResponse.status === 404) {
        throw AppError.notFound('Call recording file not found on telephony server');
      }
      throw AppError.internal(
        `Telephony audio server returned status ${upstreamResponse.status}`
      );
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
