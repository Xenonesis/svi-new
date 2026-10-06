import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useLivePlotStatus,
  SHIVANI_VATIKA_11_PROPERTY_ID,
} from '@/src/lib/hooks/useLivePlotStatus';
import type { PlotData } from '@/src/data/shivaniVatika11Plots';

interface MockAllotmentRow {
  unit_no: string;
  status: string;
}

interface MockQueryResult {
  data: MockAllotmentRow[] | null;
  error: Error | null;
}

let mockQueryResponse: MockQueryResult = {
  data: [],
  error: null,
};

let shouldReject = false;
let pendingQueryPromise: Promise<MockQueryResult> | null = null;
let mockEqCalledWith: [string, string] | null = null;
let mockSelectCalledWith: string | null = null;
let mockFromCalledWith: string | null = null;

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      mockFromCalledWith = table;
      return {
        select: (columns: string) => {
          mockSelectCalledWith = columns;
          return {
            eq: (column: string, value: string) => {
              mockEqCalledWith = [column, value];
              if (pendingQueryPromise) {
                return pendingQueryPromise;
              }
              if (shouldReject) {
                return Promise.reject(new Error('Network disconnected'));
              }
              return Promise.resolve(mockQueryResponse);
            },
          };
        },
      };
    },
  },
}));

const mockBaseline: PlotData[] = [
  {
    plotNo: '31',
    block: 'Residential',
    sizeSqYd: 100,
    dimensions: "25' x 36'",
    facing: 'North',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 750000,
  },
  {
    plotNo: '32',
    block: 'Residential',
    sizeSqYd: 80,
    dimensions: "20' x 36'",
    facing: 'East',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 600000,
  },
  {
    plotNo: '33',
    block: 'Residential',
    sizeSqYd: 80,
    dimensions: "20' x 36'",
    facing: 'West',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 600000,
  },
  {
    plotNo: '34',
    block: 'Residential',
    sizeSqYd: 80,
    dimensions: "20' x 36'",
    facing: 'South',
    roadWidth: '30 Ft Internal',
    status: 'AVAILABLE',
    priceEstimate: 600000,
  },
  {
    plotNo: 'Shop-1',
    block: 'Commercial',
    sizeSqYd: 20,
    dimensions: "9' x 20'",
    facing: 'Highway',
    roadWidth: '160 Ft Highway',
    status: 'AVAILABLE',
    priceEstimate: 250000,
  },
];

describe('useLivePlotStatus', () => {
  beforeEach(() => {
    shouldReject = false;
    pendingQueryPromise = null;
    mockEqCalledWith = null;
    mockSelectCalledWith = null;
    mockFromCalledWith = null;
    mockQueryResponse = { data: [], error: null };
  });

  it('hydrates plot statuses and computes correct counts', async () => {
    mockQueryResponse = {
      data: [
        { unit_no: '31', status: 'Allotted' },
        { unit_no: 'Unit 32', status: 'pending' },
        { unit_no: '33+34', status: 'registered' },
      ],
      error: null,
    };

    const { result } = renderHook(() => useLivePlotStatus(mockBaseline));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFromCalledWith).toBe('allotments');
    expect(mockSelectCalledWith).toBe('unit_no, status');
    expect(mockEqCalledWith).toEqual(['property_id', SHIVANI_VATIKA_11_PROPERTY_ID]);

    const plot31 = result.current.plots.find((p) => p.plotNo === '31');
    const plot32 = result.current.plots.find((p) => p.plotNo === '32');
    const plot33 = result.current.plots.find((p) => p.plotNo === '33');
    const plot34 = result.current.plots.find((p) => p.plotNo === '34');
    const shop1 = result.current.plots.find((p) => p.plotNo === 'Shop-1');

    expect(plot31?.status).toBe('BOOKED');
    expect(plot32?.status).toBe('RESERVED');
    expect(plot33?.status).toBe('BOOKED');
    expect(plot34?.status).toBe('BOOKED');
    expect(shop1?.status).toBe('AVAILABLE');

    expect(result.current.bookedCount).toBe(3);
    expect(result.current.reservedCount).toBe(1);
    expect(result.current.availableCount).toBe(1);
  });

  it('gracefully handles query error and retains baseline plots', async () => {
    mockQueryResponse = {
      data: null,
      error: new Error('Database connection failed'),
    };

    const { result } = renderHook(() => useLivePlotStatus(mockBaseline));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plots).toEqual(mockBaseline);
    expect(result.current.bookedCount).toBe(0);
    expect(result.current.reservedCount).toBe(0);
    expect(result.current.availableCount).toBe(5);
  });

  it('gracefully handles network rejection and retains baseline plots', async () => {
    shouldReject = true;

    const { result } = renderHook(() => useLivePlotStatus(mockBaseline));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plots).toEqual(mockBaseline);
    expect(result.current.bookedCount).toBe(0);
    expect(result.current.reservedCount).toBe(0);
    expect(result.current.availableCount).toBe(5);
  });

  it('ignores non-booking statuses such as cancelled and retains baseline status', async () => {
    mockQueryResponse = {
      data: [
        { unit_no: '31', status: 'cancelled' },
        { unit_no: '32', status: 'rejected' },
      ],
      error: null,
    };

    const { result } = renderHook(() => useLivePlotStatus(mockBaseline));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const plot31 = result.current.plots.find((p) => p.plotNo === '31');
    const plot32 = result.current.plots.find((p) => p.plotNo === '32');

    expect(plot31?.status).toBe('AVAILABLE');
    expect(plot32?.status).toBe('AVAILABLE');
    expect(result.current.bookedCount).toBe(0);
    expect(result.current.reservedCount).toBe(0);
    expect(result.current.availableCount).toBe(5);
  });

  it('handles unmounting safely before query resolves', async () => {
    let resolveQuery: (val: MockQueryResult) => void = () => {};
    pendingQueryPromise = new Promise<MockQueryResult>((resolve) => {
      resolveQuery = resolve;
    });

    const { unmount } = renderHook(() => useLivePlotStatus(mockBaseline));

    unmount();

    resolveQuery({
      data: [{ unit_no: '31', status: 'allotted' }],
      error: null,
    });
  });
});
