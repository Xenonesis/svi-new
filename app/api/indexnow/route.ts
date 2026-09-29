import { NextResponse } from 'next/server';
import { triggerIndexNow, INDEXNOW_KEY } from '@/src/lib/indexnow';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls = Array.isArray(body.urls) && body.urls.length > 0 ? body.urls : undefined;

    const result = await triggerIndexNow(urls);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'IndexNow submission failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(INDEXNOW_KEY, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
