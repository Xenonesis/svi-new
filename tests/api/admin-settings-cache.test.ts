import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextRequest as ConcreteNextRequest } from 'next/server';

interface SettingRecord {
  key: string;
  value: Record<string, unknown>;
}

interface SupabaseSelectResponse {
  data: SettingRecord[] | null;
  error: Error | null;
}

interface SupabaseUpsertResponse {
  data: null;
  error: Error | null;
}

interface SupabaseProfileResponse {
  data: { full_name: string } | null;
  error: Error | null;
}

interface SupabaseActivityLogResponse {
  data: null;
  error: Error | null;
}

interface SettingsResponseBody {
  settings: SettingRecord[];
}

const mockInitialSettings: SettingRecord[] = [
  { key: 'company_info', value: { company_name: 'SVI Infra Solutions Test' } },
  { key: 'lead_routing', value: { auto_assign: true } },
];

const mockSelect = vi.fn<() => Promise<SupabaseSelectResponse>>().mockResolvedValue({
  data: mockInitialSettings,
  error: null,
});

const mockUpsert = vi.fn<() => Promise<SupabaseUpsertResponse>>().mockResolvedValue({
  data: null,
  error: null,
});

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({
    id: 'admin-test-uuid',
    email: 'admin@sviinfrasolutions.com',
    role: 'admin',
  }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'portal_settings') {
        return {
          select: mockSelect,
          upsert: mockUpsert,
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: (): Promise<SupabaseProfileResponse> =>
                Promise.resolve({ data: { full_name: 'Super Admin' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'activity_logs') {
        return {
          insert: (): Promise<SupabaseActivityLogResponse> =>
            Promise.resolve({ data: null, error: null }),
        };
      }
      return {};
    }),
  },
}));

vi.mock('@/src/lib/supabase/notifications', () => ({
  NotificationHelper: {
    settingsUpdated: vi.fn().mockResolvedValue(undefined),
  },
}));

import { GET, POST } from '@/app/api/admin/settings/route';
import { clearSettingsCache as _clearSettingsCacheForTesting } from '@/src/lib/cache/adminSettingsCache';

describe('Admin Settings In-Memory Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _clearSettingsCacheForTesting();
    mockSelect.mockResolvedValue({
      data: mockInitialSettings,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    _clearSettingsCacheForTesting();
  });

  it('should return X-Cache: MISS on the first call and query Supabase', async () => {
    const request = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response = await GET(request);
    const json = (await response.json()) as SettingsResponseBody;

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(json.settings).toEqual(mockInitialSettings);
  });

  it('should return X-Cache: HIT on subsequent calls within TTL without re-querying Supabase', async () => {
    const request1 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response1 = await GET(request1);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    const request2 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response2 = await GET(request2);
    const json2 = (await response2.json()) as SettingsResponseBody;

    expect(response2.status).toBe(200);
    expect(response2.headers.get('X-Cache')).toBe('HIT');
    expect(mockSelect).toHaveBeenCalledTimes(1); // Still 1 call, Supabase not queried again
    expect(json2.settings).toEqual(mockInitialSettings);

    const request3 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response3 = await GET(request3);
    expect(response3.headers.get('X-Cache')).toBe('HIT');
    expect(mockSelect).toHaveBeenCalledTimes(1); // Still 1 call
  });

  it('should invalidate cache after a successful POST mutation', async () => {
    // 1. Prime cache with initial GET
    const initialGetRequest = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const getRes1 = await GET(initialGetRequest);
    expect(getRes1.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    // 2. Verify cache HIT
    const cachedGetRequest = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const getRes2 = await GET(cachedGetRequest);
    expect(getRes2.headers.get('X-Cache')).toBe('HIT');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    // 3. Mutate setting via POST
    const updatedSettings: SettingRecord[] = [
      { key: 'company_info', value: { company_name: 'Updated Company Ltd.' } },
      { key: 'lead_routing', value: { auto_assign: false } },
    ];
    mockSelect.mockResolvedValueOnce({
      data: updatedSettings,
      error: null,
    });

    const postRequest = new ConcreteNextRequest('http://localhost/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'lead_routing',
        value: { auto_assign: false },
      }),
    });
    const postRes = await POST(postRequest);
    expect(postRes.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledTimes(1);

    // 4. Next GET should be X-Cache: MISS and re-query Supabase
    const subsequentGetRequest = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const getRes3 = await GET(subsequentGetRequest);
    const json3 = (await getRes3.json()) as SettingsResponseBody;

    expect(getRes3.status).toBe(200);
    expect(getRes3.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(json3.settings).toEqual(updatedSettings);
  });

  it('should expire cache after TTL (60 seconds) has elapsed', async () => {
    vi.useFakeTimers();

    const request1 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response1 = await GET(request1);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    // Advance by 30 seconds (still within TTL)
    vi.advanceTimersByTime(30_000);
    const request2 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response2 = await GET(request2);
    expect(response2.headers.get('X-Cache')).toBe('HIT');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    // Advance by another 31 seconds (total 61s > 60s TTL)
    vi.advanceTimersByTime(31_000);
    const request3 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response3 = await GET(request3);
    expect(response3.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });

  it('should reset cache when _clearSettingsCacheForTesting is invoked', async () => {
    const request1 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response1 = await GET(request1);
    expect(response1.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(1);

    _clearSettingsCacheForTesting();

    const request2 = new ConcreteNextRequest('http://localhost/api/admin/settings');
    const response2 = await GET(request2);
    expect(response2.headers.get('X-Cache')).toBe('MISS');
    expect(mockSelect).toHaveBeenCalledTimes(2);
  });
});
