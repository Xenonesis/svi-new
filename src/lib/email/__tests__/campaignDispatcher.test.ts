import { describe, it, expect, vi } from 'vitest';
import { resolveRecipients } from '../campaignDispatcher';

// Mock Supabase admin
vi.mock('@/src/lib/supabase/admin', () => {
  return {
    supabaseAdmin: {
      from: vi.fn((table: string) => {
        if (table === 'lottery_participants') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            not: vi.fn().mockResolvedValue({
              data: [
                { name: 'Winner One', email: 'winner1@example.com', is_winner: true },
                { name: 'Participant Two', email: 'user2@example.com', is_winner: false },
              ],
              error: null,
            }),
          };
        }
        if (table === 'allotments') {
          return {
            select: vi.fn().mockReturnThis(),
            not: vi.fn().mockResolvedValue({
              data: [{ client_name: 'Allottee Kumar', client_email: 'allottee@example.com' }],
              error: null,
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            not: vi.fn().mockResolvedValue({
              data: [{ full_name: 'Advisor Deepa', email: 'deepa@sviinfra.in', role: 'employee' }],
              error: null,
            }),
          };
        }
        if (table === 'chat_leads') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            not: vi.fn().mockResolvedValue({
              data: [
                { full_name: 'Hot Lead Singh', email: 'lead@example.com', temperature: 'hot' },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          not: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    },
  };
});

describe('resolveRecipients', () => {
  it('resolves custom emails correctly', async () => {
    const res = await resolveRecipients({
      recipient_group: 'custom',
      custom_emails: ['test@example.com', 'admin@sviinfra.in'],
    });
    expect(res).toHaveLength(2);
    expect(res[0].email).toBe('test@example.com');
  });

  it('resolves lottery_winners correctly', async () => {
    const res = await resolveRecipients({
      recipient_group: 'lottery_winners',
    });
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].email).toBe('winner1@example.com');
  });

  it('resolves allotment_holders correctly', async () => {
    const res = await resolveRecipients({
      recipient_group: 'allotment_holders',
    });
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].email).toBe('allottee@example.com');
  });

  it('resolves workforce team members correctly', async () => {
    const res = await resolveRecipients({
      recipient_group: 'workforce',
    });
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].email).toBe('deepa@sviinfra.in');
  });
});
