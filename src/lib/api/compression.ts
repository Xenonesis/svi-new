import { NextResponse } from 'next/server';

const COMPRESSIBLE_TYPES = [
  'application/json',
  'application/javascript',
  'application/xml',
  'text/html',
  'text/plain',
  'text/css',
  'text/javascript',
  'text/xml',
  'image/svg+xml',
];

export const MIN_COMPRESS_SIZE = 1024; // 1 KB

/**
 * Compresses an API response if it meets criteria:
 * - Content-Type is text/json
 * - Response size is >= MIN_COMPRESS_SIZE
 * - Client Accept-Encoding supports br or gzip
 * - Not already compressed
 */
export async function compressResponse(
  response: Response | NextResponse,
  requestHeaders?: Headers | Record<string, string> | null
): Promise<Response> {
  // 1. Check Double Compression
  const currentEncoding = response.headers.get('content-encoding');
  if (currentEncoding && currentEncoding !== 'identity') {
    return response;
  }

  // 2. Check Content-Type
  const contentType = response.headers.get('content-type') || '';
  const isCompressible = COMPRESSIBLE_TYPES.some((type) => contentType.includes(type));
  if (!isCompressible) {
    return response;
  }

  // 3. Client negotiation check
  let acceptEncoding = '';
  if (requestHeaders instanceof Headers) {
    acceptEncoding = requestHeaders.get('accept-encoding') || '';
  } else if (requestHeaders) {
    // lowercase lookup for objects
    const lowerHeaders = Object.fromEntries(
      Object.entries(requestHeaders).map(([k, v]) => [k.toLowerCase(), v])
    );
    acceptEncoding = String(lowerHeaders['accept-encoding'] || '');
  }

  const supportsBrotli = acceptEncoding.includes('br');
  const supportsGzip = acceptEncoding.includes('gzip');

  if (!supportsBrotli && !supportsGzip) {
    return response;
  }

  // We'll buffer the response to accurately check size (for JSON/Text APIs this is fine and standard)
  const buffer = await response.arrayBuffer();

  // 4. Threshold check
  if (buffer.byteLength < MIN_COMPRESS_SIZE) {
    // Reconstruct response with uncompressed buffer since we consumed the body
    const uncompressedResponse = new Response(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
    return uncompressedResponse;
  }

  // 5. Compress
  let compressedBody: ReadableStream | Uint8Array;
  let finalEncoding: string;

  try {
    // Try Brotli first if in Node environment, as it yields better compression.
    // CompressionStream('gzip') is standard Web API and works in Edge/Node.
    const isNode = typeof process !== 'undefined' && process.versions?.node;

    if (supportsBrotli && isNode) {
      // Node.js specific Brotli using zlib
      const zlib = await import('node:zlib');
      compressedBody = zlib.brotliCompressSync(new Uint8Array(buffer));
      finalEncoding = 'br';
    } else {
      // Use gzip
      const stream = new Response(buffer).body;
      if (!stream) throw new Error('Failed to create stream from buffer');
      compressedBody = stream.pipeThrough(new CompressionStream('gzip'));
      finalEncoding = 'gzip';
    }
  } catch {
    // Fallback to uncompressed if compression fails
    return new Response(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }

  // 6. Return new response with compressed body and headers
  const newHeaders = new Headers(response.headers);
  newHeaders.set('content-encoding', finalEncoding);

  // When using ReadableStream, we don't know the final content-length synchronously.
  // We remove it so the server chunks the response properly, or if we have Uint8Array, we set it.
  if (compressedBody instanceof Uint8Array) {
    newHeaders.set('content-length', compressedBody.byteLength.toString());
  } else {
    newHeaders.delete('content-length');
  }

  // Add Vary header
  const vary = newHeaders.get('vary') || '';
  if (!vary.includes('Accept-Encoding')) {
    newHeaders.set('vary', vary ? `${vary}, Accept-Encoding` : 'Accept-Encoding');
  }

  return new Response(compressedBody as BodyInit, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
