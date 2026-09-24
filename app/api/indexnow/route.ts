import { NextResponse } from 'next/server';
import { SITE_URL } from '@/src/lib/seo';

/**
 * IndexNow Protocol Key
 * Allows real-time programmatic crawl notification to Bing, Yandex, Seznam, and participating search engines.
 */
export const INDEXNOW_KEY = 'e57c6b9074d24177b9605809115f2e8f';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls: string[] =
      Array.isArray(body.urls) && body.urls.length > 0
        ? body.urls
        : [
            `${SITE_URL}/plots-in-jaipur`,
            `${SITE_URL}/plots-near-renwal-railway-station`,
            `${SITE_URL}/plots-in-jaipur-under-20-lakhs`,
            `${SITE_URL}/blog/jaipur-to-khatu-shyam-highway-land-rates-roi-2026`,
            `${SITE_URL}/blog/jda-approved-vs-90a-registry-plots-rajasthan-guide`,
          ];

    const host = new URL(SITE_URL).host;

    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      submittedUrls: urls.length,
    });
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
