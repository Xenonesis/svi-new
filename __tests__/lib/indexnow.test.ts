import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerIndexNow, INDEXNOW_KEY, DEFAULT_INDEXNOW_URLS } from '@/src/lib/indexnow';
import { SITE_URL } from '@/src/lib/seo';

describe('triggerIndexNow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits default URLs when none are provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await triggerIndexNow();

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.submittedUrls).toBe(DEFAULT_INDEXNOW_URLS.length);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint).toBe('https://api.indexnow.org/indexnow');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(body.key).toBe(INDEXNOW_KEY);
    expect(body.urlList).toEqual(DEFAULT_INDEXNOW_URLS);
    expect(body.host).toBe(new URL(SITE_URL).host);
  });

  it('submits specific custom URLs when passed', async () => {
    const customUrls = [`${SITE_URL}/plots-in-jaipur`, `${SITE_URL}/plots-for-sale-in-phulera`];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await triggerIndexNow(customUrls);

    expect(result.success).toBe(true);
    expect(result.status).toBe(202);
    expect(result.submittedUrls).toBe(2);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.urlList).toEqual(customUrls);
  });

  it('handles network failure gracefully', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network timeout'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await triggerIndexNow();

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toBe('Network timeout');
  });
});
