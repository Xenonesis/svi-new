import { describe, it, expect } from 'vitest';
import { compressResponse, MIN_COMPRESS_SIZE } from '@/src/lib/api/compression';
import { NextResponse } from 'next/server';

describe('API Compression', () => {
  it('does not compress responses smaller than MIN_COMPRESS_SIZE', async () => {
    const smallData = { ok: true, data: 'small' };
    const res = NextResponse.json(smallData);
    const compressed = await compressResponse(res, new Headers({ 'accept-encoding': 'gzip, br' }));

    expect(compressed.headers.get('content-encoding')).toBeNull();
    const resultData = await compressed.json();
    expect(resultData).toEqual(smallData);
  });

  it('compresses JSON responses >= MIN_COMPRESS_SIZE with gzip', async () => {
    // Generate large JSON payload
    const largeData = {
      items: Array.from({ length: 1000 }).map((_, i) => ({ id: i, name: `User ${i}` })),
    };
    const originalRes = NextResponse.json(largeData);
    const originalBuffer = await originalRes.clone().arrayBuffer();
    expect(originalBuffer.byteLength).toBeGreaterThanOrEqual(MIN_COMPRESS_SIZE);

    const headers = new Headers({ 'accept-encoding': 'gzip' });
    const compressed = await compressResponse(originalRes, headers);

    expect(compressed.headers.get('content-encoding')).toBe('gzip');
    expect(compressed.headers.get('vary')).toContain('Accept-Encoding');

    const compressedBuffer = await compressed.arrayBuffer();
    expect(compressedBuffer.byteLength).toBeLessThan(originalBuffer.byteLength);

    // Verify >50% compression reduction
    expect(compressedBuffer.byteLength).toBeLessThan(originalBuffer.byteLength * 0.5);

    // Decompress via Node zlib to verify
    const zlib = await import('node:zlib');
    const decompressed = zlib.gunzipSync(new Uint8Array(compressedBuffer));
    expect(JSON.parse(decompressed.toString())).toEqual(largeData);
  });

  it('compresses with br if supported', async () => {
    const largeData = {
      items: Array.from({ length: 1000 }).map((_, i) => ({ id: i, name: `User ${i}` })),
    };
    const originalRes = NextResponse.json(largeData);

    const headers = new Headers({ 'accept-encoding': 'gzip, deflate, br' });
    const compressed = await compressResponse(originalRes, headers);

    // If running in Node, it should prefer br
    const encoding = compressed.headers.get('content-encoding');
    expect(encoding).toBe('br');

    const compressedBuffer = await compressed.arrayBuffer();
    const zlib = await import('node:zlib');
    const decompressed = zlib.brotliDecompressSync(new Uint8Array(compressedBuffer));
    expect(JSON.parse(decompressed.toString())).toEqual(largeData);
  });

  it('does not compress if content-encoding is already set (double compression prevention)', async () => {
    const largeData = { items: Array.from({ length: 1000 }).map((_, i) => ({ id: i })) };
    const res = NextResponse.json(largeData);
    res.headers.set('content-encoding', 'gzip');

    const compressed = await compressResponse(res, new Headers({ 'accept-encoding': 'br' }));

    // It should immediately return original since it's already encoded
    expect(compressed.headers.get('content-encoding')).toBe('gzip');
  });

  it('does not compress non-compressible types like images', async () => {
    const buffer = new Uint8Array(2000).fill(0); // >= 1KB
    const res = new Response(buffer, { headers: { 'content-type': 'image/jpeg' } });

    const compressed = await compressResponse(res, new Headers({ 'accept-encoding': 'gzip' }));

    expect(compressed.headers.get('content-encoding')).toBeNull();
  });
});
