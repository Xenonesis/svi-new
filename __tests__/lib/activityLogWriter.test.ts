import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertCalls: unknown[] = [];
let insertResults: Array<{ error: { code: string; message: string } | null }> = [];

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: () => ({
      insert: (payload: unknown) => {
        insertCalls.push(payload);
        const next = insertResults.shift() ?? { error: null };
        return Promise.resolve(next);
      },
    }),
  },
}));

import { writeActivityLog } from '@/src/lib/repositories/activityLogWriter';

describe('writeActivityLog', () => {
  beforeEach(() => {
    insertCalls.length = 0;
    insertResults = [];
  });

  it('stores the intended action type when the database accepts it', async () => {
    insertResults = [{ error: null }];

    const result = await writeActivityLog({
      user_id: 'admin-1',
      action_type: 'lottery_drawn',
      description: 'Draw executed',
      metadata: { lotteryId: 'abc' },
    });

    expect(result).toEqual({
      logged: true,
      actionType: 'lottery_drawn',
      usedFallback: false,
      error: null,
    });
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0]).toMatchObject({
      action_type: 'lottery_drawn',
      description: 'Draw executed',
    });
  });

  it('falls back to an allowed action type when the CHECK constraint rejects the type', async () => {
    insertResults = [
      { error: { code: '23514', message: 'violates check constraint' } },
      { error: null },
    ];

    const result = await writeActivityLog({
      user_id: 'admin-1',
      action_type: 'lottery_drawn',
      description: 'Draw executed',
      metadata: { lotteryId: 'abc' },
    });

    expect(result.logged).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(result.actionType).toBe('settings_updated');
    expect(insertCalls).toHaveLength(2);

    const fallbackPayload = insertCalls[1] as {
      action_type: string;
      metadata: Record<string, unknown>;
    };
    expect(fallbackPayload.action_type).toBe('settings_updated');
    expect(fallbackPayload.metadata).toMatchObject({
      lotteryId: 'abc',
      intended_action_type: 'lottery_drawn',
      action_type_fallback: true,
    });
  });

  it('reports failure without throwing when both inserts fail', async () => {
    insertResults = [
      { error: { code: '23514', message: 'violates check constraint' } },
      { error: { code: '42501', message: 'permission denied' } },
    ];

    const result = await writeActivityLog({
      user_id: 'admin-1',
      action_type: 'lottery_drawn',
      description: 'Draw executed',
    });

    expect(result.logged).toBe(false);
    expect(result.error).toBe('permission denied');
  });

  it('does not retry when the failure is not a constraint violation', async () => {
    insertResults = [{ error: { code: '42501', message: 'permission denied' } }];

    const result = await writeActivityLog({
      user_id: 'admin-1',
      action_type: 'lottery_drawn',
      description: 'Draw executed',
    });

    expect(result.logged).toBe(false);
    expect(result.usedFallback).toBe(false);
    expect(insertCalls).toHaveLength(1);
  });
});
