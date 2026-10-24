import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useLotteryVisibility,
  _resetLotteryVisibilityCacheForTesting,
} from '@/src/lib/hooks/useLotteryVisibility';

const { mockMaybeSingle } = vi.hoisted(() => ({
  mockMaybeSingle: vi.fn(),
}));

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  },
}));

describe('useLotteryVisibility', () => {
  beforeEach(() => {
    _resetLotteryVisibilityCacheForTesting();
    vi.clearAllMocks();
  });

  it('deduplicates simultaneous calls into a single query', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { value: 'true' },
      error: null,
    });

    const { result: r1 } = renderHook(() => useLotteryVisibility());
    const { result: r2 } = renderHook(() => useLotteryVisibility());

    await waitFor(() => expect(r1.current.loading).toBe(false));
    expect(r1.current.visible).toBe(true);
    expect(r2.current.visible).toBe(true);
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
  });

  it('reuses module-level cached result on subsequent renders without new queries', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { value: true },
      error: null,
    });

    const { result: firstRun } = renderHook(() => useLotteryVisibility());
    await waitFor(() => expect(firstRun.current.loading).toBe(false));
    expect(firstRun.current.visible).toBe(true);
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);

    // Later render
    const { result: secondRun } = renderHook(() => useLotteryVisibility());
    expect(secondRun.current.loading).toBe(false);
    expect(secondRun.current.visible).toBe(true);
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
  });

  it('handles error response by defaulting to visible: false', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    const { result } = renderHook(() => useLotteryVisibility());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visible).toBe(false);
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1);
  });
});
