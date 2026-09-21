import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/src/lib/api/rateLimit';

export const runtime = 'nodejs';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const MAX_QUERY_LENGTH = 2048;

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { limit: 15, windowSeconds: 60 });
  if (limited) return limited;

  let body: { data?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const query = body?.data;
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Query exceeds maximum allowed length' }, { status: 400 });
  }

  // Basic sanity check: Overpass QL queries must target valid OSM primitives or output format
  if (
    !query.includes('[out:json]') &&
    !query.includes('around:') &&
    !query.includes('node') &&
    !query.includes('way') &&
    !query.includes('nwr')
  ) {
    return NextResponse.json({ error: 'Invalid Overpass query format' }, { status: 400 });
  }
  for (const url of OVERPASS_URLS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SVIInfraSolutions/1.0 (info@sviinfrasolutions.com; proxy-service)',
        },
        body: new URLSearchParams({ data: query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[overpass-proxy] ${url} returned ${response.status}, trying next…`);
        continue;
      }

      const data = await response.json();

      return NextResponse.json(data, {
        status: 200,
        headers: {
          // Cache for 10 minutes — nearby places don't change that fast
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=60',
        },
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`[overpass-proxy] ${url} failed: ${message}, trying next…`);
    }
  }
  return NextResponse.json(
    { elements: [], fallback: true, warning: 'All Overpass endpoints failed' },
    { status: 200 }
  );
}
