import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { syncReceiptToPaymentSchedule } from '@/src/lib/receipt/syncReceiptToSchedule';

describe('syncReceiptToPaymentSchedule', () => {
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips if receipt number or amount is invalid', async () => {
    mockSupabase = {} as unknown as SupabaseClient;
    const res1 = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '',
      amount: 1000,
    });
    expect(res1.synced).toBe(false);
    expect(res1.action).toBe('skipped');

    const res2 = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2112',
      amount: 0,
    });
    expect(res2.synced).toBe(false);
    expect(res2.action).toBe('skipped');
  });

  it('inserts new schedule if allotment matches by ticket_id', async () => {
    const mockAllotment = {
      id: 'allot-123',
      user_id: 'user-456',
      unit_no: 'A-41',
      metadata: { ticket_id: 'SVI2236' },
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'allotments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [mockAllotment],
              error: null,
            }),
          };
        }
        if (table === 'payment_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({
                  data: [], // not existing
                  error: null,
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'sched-new-1' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const res = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2130',
      amount: 49000,
      date: '2026-10-19',
      refId: 'SVI2236',
    });

    expect(res.synced).toBe(true);
    expect(res.action).toBe('inserted');
    expect(res.scheduleId).toBe('sched-new-1');
    expect(res.allotmentId).toBe('allot-123');
  });

  it('updates existing schedule if receipt already exists', async () => {
    const mockAllotment = {
      id: 'allot-123',
      user_id: 'user-456',
      unit_no: 'A-41',
      metadata: { ticket_id: 'SVI2236' },
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'allotments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [mockAllotment],
              error: null,
            }),
          };
        }
        if (table === 'payment_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({
                  data: [{ id: 'sched-existing', title: 'Payment Receipt #2130', amount: 45000 }],
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'sched-existing' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const res = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2130',
      amount: 49000,
      date: '2026-10-19',
      refId: 'SVI2236',
    });

    expect(res.synced).toBe(true);
    expect(res.action).toBe('updated');
    expect(res.scheduleId).toBe('sched-existing');
  });

  it('deletes existing schedule if isTrashed is true', async () => {
    const mockAllotment = {
      id: 'allot-123',
      user_id: 'user-456',
      unit_no: 'A-41',
      metadata: { ticket_id: 'SVI2236' },
    };

    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'allotments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [mockAllotment],
              error: null,
            }),
          };
        }
        if (table === 'payment_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({
                  data: [{ id: 'sched-to-delete', title: 'Payment Receipt #2130' }],
                  error: null,
                }),
              }),
            }),
            delete: deleteMock,
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const res = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2130',
      amount: 49000,
      refId: 'SVI2236',
      isTrashed: true,
    });

    expect(res.synced).toBe(true);
    expect(res.action).toBe('deleted');
    expect(deleteMock).toHaveBeenCalled();
  });
  it('matches exact ticket_id instead of false-positive unit suffix match', async () => {
    const allotUnit5 = {
      id: 'allot-plot-5',
      user_id: 'user-rani',
      unit_no: '5',
      metadata: { ticket_id: 'PL2078', client_name: 'Rani Bhatnagar' },
    };
    const allotUnit15 = {
      id: 'allot-plot-15',
      user_id: 'user-krishna',
      unit_no: '15',
      metadata: { ticket_id: 'SVI2255', client_name: 'Krishna' },
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'allotments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [allotUnit5, allotUnit15],
              error: null,
            }),
          };
        }
        if (table === 'payment_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'sched-krishna-2145' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const res = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2145',
      amount: 500000,
      date: '2026-10-30',
      refId: 'SVI2255',
      plotNo: '15',
    });

    expect(res.synced).toBe(true);
    expect(res.action).toBe('inserted');
    expect(res.allotmentId).toBe('allot-plot-15');
  });

  it('falls back to plotNo and name matching safely', async () => {
    const allotUnit3 = {
      id: 'allot-plot-3',
      user_id: 'user-anil',
      unit_no: '3',
      metadata: { ticket_id: 'SVI2257', client_name: 'Anil Kumar' },
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'allotments') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [allotUnit3],
              error: null,
            }),
          };
        }
        if (table === 'payment_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'sched-anil-2141' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const res = await syncReceiptToPaymentSchedule(mockSupabase, {
      receiptNo: '2141',
      amount: 500,
      date: '2026-10-27',
      refId: 'SVI2257',
      name: 'Anil Kumar',
    });

    expect(res.synced).toBe(true);
    expect(res.action).toBe('inserted');
    expect(res.allotmentId).toBe('allot-plot-3');
  });
});
