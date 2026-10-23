import { describe, it, expect } from 'vitest';
import { computeEmailHealthMetrics } from '../sections/EmailHealthHUD';

describe('computeEmailHealthMetrics', () => {
  it('calculates 100% delivery and correct open/click rates', () => {
    const mockEmails = [
      {
        id: '1',
        status: 'delivered',
        first_opened_at: '2026-10-20',
        first_clicked_at: '2026-10-20',
      },
      { id: '2', status: 'delivered', first_opened_at: '2026-10-21', first_clicked_at: null },
      { id: '3', status: 'delivered', first_opened_at: null, first_clicked_at: null },
      { id: '4', status: 'bounced', first_opened_at: null, first_clicked_at: null },
    ];

    const metrics = computeEmailHealthMetrics(mockEmails);
    expect(metrics.total).toBe(4);
    expect(metrics.deliveredCount).toBe(3);
    expect(metrics.deliveredRate).toBe('75.0%');
    expect(metrics.openedCount).toBe(2);
    expect(metrics.openedRate).toBe('66.7%');
    expect(metrics.clickedCount).toBe(1);
    expect(metrics.clickedRate).toBe('50.0%');
    expect(metrics.bouncedCount).toBe(1);
  });

  it('handles empty email list safely without NaN', () => {
    const metrics = computeEmailHealthMetrics([]);
    expect(metrics.total).toBe(0);
    expect(metrics.deliveredRate).toBe('0.0%');
    expect(metrics.openedRate).toBe('0.0%');
  });
});
