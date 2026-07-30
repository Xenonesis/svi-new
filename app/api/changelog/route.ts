import { NextResponse } from 'next/server';
import { fetchChangelog } from '@/src/lib/changelog';

// Cache the same way the server helper does, but allow clients to refresh
// with `?fresh=1` (bypasses the data cache for a single request).
export const revalidate = 600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const perPage = Number(url.searchParams.get('per_page') ?? 30);

  const data = await fetchChangelog({ perPage });

  // Set explicit cache headers so browsers / CDNs can also cache the payload.
  const cacheControl =
    data.status === 'ok'
      ? 'public, max-age=300, s-maxage=600, stale-while-revalidate=120'
      : 'public, max-age=60, s-maxage=120, stale-while-revalidate=60';

  return NextResponse.json(data, {
    status: data.status === 'error' ? 502 : 200,
    headers: {
      'Cache-Control': cacheControl,
    },
  });
}
