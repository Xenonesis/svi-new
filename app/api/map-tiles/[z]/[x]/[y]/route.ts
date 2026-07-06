import { NextRequest, NextResponse } from 'next/server';

// OSM tile server max zoom is 19.
// Requests beyond that return 400 Bad Request.
const MAX_ZOOM = 19;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const zoom = parseInt(z, 10);

  if (isNaN(zoom) || zoom > MAX_ZOOM) {
    // Return an empty 1x1 transparent PNG instead of propagating the 400
    const EMPTY_PNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return new NextResponse(EMPTY_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Validate tile coordinates are numeric
  if (!/^\d+$/.test(x) || !/^\d+$/.test(y)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

  try {
    const response = await fetch(tileUrl, {
      headers: {
        // OSM requires a User-Agent identifying your application
        'User-Agent': 'SVI-Infra-Solutions-Website/1.0 (https://sviinfrasolutions.com)',
        Referer: 'https://sviinfrasolutions.com',
      },
      next: { revalidate: 86400 }, // Cache tile for 24 hours
    });

    if (!response.ok) {
      return new NextResponse('Tile not found', { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch tile', { status: 502 });
  }
}
