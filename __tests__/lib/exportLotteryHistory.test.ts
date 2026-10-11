import { describe, it, expect } from 'vitest';
import { flattenLotteriesForExport } from '@/src/lib/lottery/exportLotteryHistory';
import type { Lottery } from '@/src/components/admin/lottery/types';

describe('exportLotteryHistory', () => {
  it('correctly flattens multi-winner campaigns', () => {
    const mockLotteries: Lottery[] = [
      {
        id: 'camp-1-uuid',
        title: 'Premium Residential Plot Giveaway',
        description: 'Test description',
        status: 'active',
        created_at: '2026-08-01T10:00:00Z',
        winner: {
          id: 'w-1',
          name: 'Mr surinder pal singh',
          ticket_number: 'SVI2227',
        },
        winners: [
          {
            id: 'w-1',
            name: 'Mr surinder pal singh',
            ticket_number: 'SVI2227',
          },
          {
            id: 'w-2',
            name: 'Madhu Bala',
            ticket_number: 'SVI2236',
          },
        ],
      },
      {
        id: 'camp-2-uuid',
        title: 'Pending Draw Campaign',
        description: null,
        status: 'active',
        created_at: '2026-09-01T10:00:00Z',
        winner: null,
        winners: [],
      },
    ];

    const rows = flattenLotteriesForExport(mockLotteries);

    expect(rows).toHaveLength(3);
    // Row 1: First winner of camp 1
    expect(rows[0].campaignName).toBe('Premium Residential Plot Giveaway');
    expect(rows[0].winnerName).toBe('Mr surinder pal singh');
    expect(rows[0].ticketNumber).toBe('SVI2227');

    // Row 2: Second winner of camp 1
    expect(rows[1].campaignName).toBe('Premium Residential Plot Giveaway');
    expect(rows[1].winnerName).toBe('Madhu Bala');
    expect(rows[1].ticketNumber).toBe('SVI2236');

    // Row 3: Pending draw camp 2
    expect(rows[2].campaignName).toBe('Pending Draw Campaign');
    expect(rows[2].winnerName).toBe('Pending Draw');
    expect(rows[2].ticketNumber).toBe('—');
  });
});
