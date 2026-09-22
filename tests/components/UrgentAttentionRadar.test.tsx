import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UrgentAttentionRadar } from '@/src/components/admin/dashboard/executive/UrgentAttentionRadar';
import { PaymentDuesRadar } from '@/src/components/admin/dashboard/executive/PaymentDuesRadar';

describe('UrgentAttentionRadar', () => {
  const mockActions = {
    unverifiedReceipts: [
      {
        id: 'rec-1',
        receipt_number: 'REC-092',
        customer_name: 'Anil Agarwal',
        amount: 500000,
        created_at: '2026-09-23T10:00:00Z',
      },
    ],
    hotLeadsPending: [
      {
        id: 'lead-1',
        name: 'Sunita Sharma',
        phone: '+919988776655',
        created_at: '2026-09-23T08:00:00Z',
        temperature: 'hot',
      },
    ],
    pendingLeaves: [
      {
        id: 'leave-1',
        user_name: 'Rahul Verma',
        leave_type: 'Sick Leave',
        start_date: '2026-09-24',
        end_date: '2026-09-25',
      },
    ],
  };

  it('renders triage items with action buttons and badge', () => {
    render(<UrgentAttentionRadar urgentActions={mockActions} />);
    expect(screen.getByText(/Urgent Executive Triage/i)).toBeDefined();
    expect(screen.getByText('3 Pending')).toBeDefined();

    // Unverified Receipts
    expect(screen.getByText('Anil Agarwal')).toBeDefined();
    expect(screen.getByText(/₹5.00L • REC-092/i)).toBeDefined();
    const verifyLink = screen.getByRole('link', { name: /Verify/i });
    expect(verifyLink.getAttribute('href')).toBe('/admin/payment-receipt');

    // Hot Leads
    expect(screen.getByText('Sunita Sharma')).toBeDefined();
    expect(screen.getByText(/Hot Lead • \+919988776655/i)).toBeDefined();
    const assignLink = screen.getByRole('link', { name: /Assign/i });
    expect(assignLink.getAttribute('href')).toBe('/admin/leads');

    // Pending Leaves
    expect(screen.getByText('Rahul Verma')).toBeDefined();
    expect(screen.getByText(/Leave Request: Sick Leave/i)).toBeDefined();
    const reviewLink = screen.getByRole('link', { name: /Review/i });
    expect(reviewLink.getAttribute('href')).toBe('/admin/workforce?tab=leaves');
  });

  it('renders empty state when there are 0 urgent actions', () => {
    const emptyActions = {
      unverifiedReceipts: [],
      hotLeadsPending: [],
      pendingLeaves: [],
    };

    render(<UrgentAttentionRadar urgentActions={emptyActions} />);
    expect(screen.getByText(/Urgent Executive Triage/i)).toBeDefined();
    expect(screen.getByText('0 Pending')).toBeDefined();
    expect(screen.getByText(/All Clear!/i)).toBeDefined();
    expect(screen.getByText(/No urgent bottlenecks pending/i)).toBeDefined();
  });
});

describe('PaymentDuesRadar', () => {
  const mockPaymentDues = [
    {
      id: 'due-1',
      customer_name: 'Vikram Mehta',
      plot_number: 'B-12',
      amount_due: 150000,
      due_date: '2026-09-25',
      is_overdue: false,
    },
    {
      id: 'due-2',
      customer_name: 'Pooja Patel',
      plot_number: 'A-05',
      amount_due: 220000,
      due_date: '2026-09-20',
      is_overdue: true,
    },
  ];

  it('renders payment dues items and flags overdue installments', () => {
    render(<PaymentDuesRadar paymentDues={mockPaymentDues} />);
    expect(screen.getByText(/Payment Dues Radar/i)).toBeDefined();
    expect(screen.getByText(/Upcoming client installments/i)).toBeDefined();

    // Regular upcoming due
    expect(screen.getByText('Vikram Mehta')).toBeDefined();
    expect(screen.getByText(/Plot B-12 • Due: 2026-09-25/i)).toBeDefined();
    expect(screen.getByText('₹150k')).toBeDefined();

    // Overdue installment
    expect(screen.getByText('Pooja Patel')).toBeDefined();
    expect(screen.getByText(/Plot A-05 • Due: 2026-09-20/i)).toBeDefined();
    expect(screen.getByText('₹220k')).toBeDefined();
    expect(screen.getByText(/Overdue/i)).toBeDefined();
  });

  it('triggers alert feedback when reminder button is clicked', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<PaymentDuesRadar paymentDues={mockPaymentDues} />);

    const reminderButtons = screen.getAllByTitle(/Send Reminder/i);
    expect(reminderButtons.length).toBe(2);

    fireEvent.click(reminderButtons[0]);
    expect(alertMock).toHaveBeenCalledWith('Reminder queued for Vikram Mehta');

    alertMock.mockRestore();
  });

  it('renders empty state when paymentDues list is empty', () => {
    render(<PaymentDuesRadar paymentDues={[]} />);
    expect(screen.getByText(/Payment Dues Radar/i)).toBeDefined();
    expect(screen.getByText(/No upcoming payment dues/i)).toBeDefined();
  });
});
