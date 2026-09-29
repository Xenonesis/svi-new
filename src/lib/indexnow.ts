import { SITE_URL } from '@/src/lib/seo';

export const INDEXNOW_KEY = 'e57c6b9074d24177b9605809115f2e8f';

export const DEFAULT_INDEXNOW_URLS: string[] = [
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
  `${SITE_URL}/blog/complete-guide-buying-plots-in-jaipur-2026`,
  `${SITE_URL}/hi/plots-in-jaipur`,
  `${SITE_URL}/hi/plots-for-sale-near-khatu-shyam-ji`,
  `${SITE_URL}/hi/plots-for-sale-in-phulera`,
  `${SITE_URL}/hi/plots-near-renwal-railway-station`,
  `${SITE_URL}/hi/plots-in-jaipur-under-20-lakhs`,
  `${SITE_URL}/hi/blog/complete-guide-buying-plots-in-jaipur-2026`,
];

export interface IndexNowResponse {
  success: boolean;
  status: number;
  submittedUrls: number;
  error?: string;
}

/**
 * Triggers IndexNow API to notify Bing, Yandex, and other search engines of URL updates.
 */
export async function triggerIndexNow(urls?: string[]): Promise<IndexNowResponse> {
  const targetUrls = Array.isArray(urls) && urls.length > 0 ? urls : DEFAULT_INDEXNOW_URLS;
  const host = new URL(SITE_URL).host;

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: targetUrls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: response.ok,
      status: response.status,
      submittedUrls: targetUrls.length,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      submittedUrls: targetUrls.length,
      error: error instanceof Error ? error.message : 'Unknown IndexNow submission error',
    };
  }
}
