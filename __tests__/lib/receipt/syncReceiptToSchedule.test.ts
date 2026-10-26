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
});
