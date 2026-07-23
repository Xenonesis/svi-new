import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function POST(req: NextRequest) {
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
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[overpass-proxy] ${url} failed: ${err.message}, trying next…`);
    }
  }

  return NextResponse.json({ error: 'All Overpass endpoints failed' }, { status: 502 });
}
