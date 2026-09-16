import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  PortalAllotmentsStatsGrid,
  type SalesRevenueStats,
} from '@/src/components/admin/portal-allotments/PortalAllotmentsStatsGrid';

const mockStats: SalesRevenueStats = {
  totalSalesRevenue: 10000000,
  totalRevenueCollected: 6500000,
  totalBalanceDue: 3500000,
  realizationRate: 65,
  activeAccountsCount: 12,
};

describe('PortalAllotmentsStatsGrid', () => {
  it('renders all four KPI cards with correct metric data', () => {
    const onOpenLedgersModal = vi.fn();
    render(<PortalAllotmentsStatsGrid stats={mockStats} onOpenLedgersModal={onOpenLedgersModal} />);

    expect(screen.getByText('Total Sales Revenue')).toBeDefined();
    expect(screen.getByText('Collected Revenue')).toBeDefined();
    expect(screen.getByText('Pending Receivables')).toBeDefined();
    expect(screen.getByText('Realization Rate')).toBeDefined();

    expect(screen.getByText('12 Active Plot / Villa Allotments')).toBeDefined();
    expect(screen.getByText('65%')).toBeDefined();

    // Check currency values are rendered
    expect(screen.getAllByText(/1,00,00,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/65,00,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/35,00,000/).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers onOpenLedgersModal when Master Ledger Overview button is clicked', () => {
    const onOpenLedgersModal = vi.fn();
    render(<PortalAllotmentsStatsGrid stats={mockStats} onOpenLedgersModal={onOpenLedgersModal} />);

    const button = screen.getByRole('button', { name: /Master Ledger Overview/i });
    fireEvent.click(button);

    expect(onOpenLedgersModal).toHaveBeenCalledTimes(1);
  });
});
