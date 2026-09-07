import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortalAllotmentScheduleDrawer } from '@/src/components/admin/portal-allotments/PortalAllotmentScheduleDrawer';
import type { PaymentScheduleItem } from '@/src/components/admin/portal-allotments/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      paymentSchedule: 'Payment Schedule',
      ofLabel: 'of',
      paidLabel: 'paid',
      dueLabel: 'Due',
      noPaymentSchedules: 'No payment schedules generated for this allotment.',
      paid: 'Paid',
      pending: 'Pending',
    };
    return map[key] || key;
  },
}));

const mockSchedules: PaymentScheduleItem[] = [
  {
    id: 'pay-1',
    allotment_id: 'allot-1',
    milestone_name: 'Booking Advance',
    due_date: '2026-06-01T00:00:00.000Z',
    amount: 500000,
    status: 'paid',
    paid_date: '2026-05-30T00:00:00.000Z',
  },
  {
    id: 'pay-2',
    allotment_id: 'allot-1',
    milestone_name: 'Plinth Level',
    due_date: '2026-08-01T00:00:00.000Z',
    amount: 1500000,
    status: 'pending',
    paid_date: null,
  },
];

describe('PortalAllotmentScheduleDrawer', () => {
  it('renders payment schedules, milestones, amounts, and statuses when expanded', () => {
    render(
      <PortalAllotmentScheduleDrawer
        isExpanded={true}
        paymentSchedules={mockSchedules}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.getByText('Payment Schedule')).toBeDefined();
    expect(screen.getByText(/1 of 2 paid/)).toBeDefined();
    expect(screen.getByText('Booking Advance')).toBeDefined();
    expect(screen.getByText('Plinth Level')).toBeDefined();
    expect(screen.getByText('₹5,00,000')).toBeDefined();
    expect(screen.getByText('₹15,00,000')).toBeDefined();
    expect(screen.getByText('Paid')).toBeDefined();
    expect(screen.getByText('Pending')).toBeDefined();
  });

  it('does not render content when isExpanded is false', () => {
    render(
      <PortalAllotmentScheduleDrawer
        isExpanded={false}
        paymentSchedules={mockSchedules}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.queryByText('Payment Schedule')).toBeNull();
  });

  it('triggers onToggleStatus callback with payment id and current status', () => {
    const handleToggle = vi.fn();
    render(
      <PortalAllotmentScheduleDrawer
        isExpanded={true}
        paymentSchedules={mockSchedules}
        onToggleStatus={handleToggle}
      />
    );

    const pendingBtn = screen.getByRole('button', { name: /Pending/i });
    fireEvent.click(pendingBtn);
    expect(handleToggle).toHaveBeenCalledWith('pay-2', 'pending');
  });

  it('displays empty message when payment schedules are not available', () => {
    render(
      <PortalAllotmentScheduleDrawer
        isExpanded={true}
        paymentSchedules={[]}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.getByText('No payment schedules generated for this allotment.')).toBeDefined();
  });
});
