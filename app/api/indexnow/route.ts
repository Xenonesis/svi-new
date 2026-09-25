import { NextResponse } from 'next/server';
import { SITE_URL } from '@/src/lib/seo';

/**
 * IndexNow Protocol Key
 * Allows real-time programmatic crawl notification to Bing, Yandex, Seznam, and participating search engines.
 */
const INDEXNOW_KEY = 'e57c6b9074d24177b9605809115f2e8f';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls: string[] =
      Array.isArray(body.urls) && body.urls.length > 0
        ? body.urls
        : [
            `${SITE_URL}/plots-in-jaipur`,
            `${SITE_URL}/plots-for-sale-near-khatu-shyam-ji`,
            `${SITE_URL}/plots-for-sale-in-phulera`,
            `${SITE_URL}/plots-near-renwal-railway-station`,
            `${SITE_URL}/plots-in-jaipur-under-20-lakhs`,
            `${SITE_URL}/blog/buy-residential-plots-near-khatu-shyam-ji-temple-guide`,
            `${SITE_URL}/blog/plots-for-sale-in-phulera-smart-city-dmic-rates`,
            `${SITE_URL}/blog/shivani-vatika-11th-official-price-list-master-plan-2026`,
            `${SITE_URL}/blog/govt-approved-vs-90a-registry-plots-khatu-shyam-ji-checklist`,
            `${SITE_URL}/blog/plots-near-renwal-railway-station-riico-industrial-guide`,
            `${SITE_URL}/blog/jaipur-khatu-shyam-4-lane-highway-expansion-timeline-impact`,
            `${SITE_URL}/blog/how-to-buy-residential-plot-rajasthan-nri-outstation-devotees`,
            `${SITE_URL}/blog/top-5-high-appreciation-real-estate-corridors-jaipur-2026`,
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
