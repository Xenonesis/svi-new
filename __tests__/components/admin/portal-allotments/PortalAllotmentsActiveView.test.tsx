import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortalAllotmentsActiveView } from '@/src/components/admin/portal-allotments/PortalAllotmentsActiveView';
import type { AllotmentRecord } from '@/src/components/admin/portal-allotments/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      propertyLabel: 'Property',
      unitLabel: 'Unit',
      area: 'Area (sq yds)',
      totalCostLabel: 'Total Cost',
      bookingDate: 'Booking Date',
      advisorLabel: 'Advisor / Agent',
      viewPayments: 'View Payments',
      hidePayments: 'Hide Payments',
      editAllotment: 'Edit Allotment',
      deleteConfirmation: 'Delete',
    };
    return map[key] || key;
  },
}));

const mockAllotments: AllotmentRecord[] = [
  {
    id: 'allot-1',
    profile_id: 'prof-1',
    property_id: 'prop-1',
    unit_no: 'A-101',
    area: 120,
    total_cost: 6000000,
    profiles: {
      id: 'prof-1',
      full_name: 'Aditya Sharma',
      email: 'aditya@example.com',
      phone: '9876543210',
    },
    properties: {
      id: 'prop-1',
      name: 'Shyam Aangan Phase 1',
    },
    payment_schedules: [],
  },
  {
    id: 'allot-2',
    profile_id: 'prof-2',
    property_id: 'prop-2',
    unit_no: 'B-202',
    area: 150,
    total_cost: 7500000,
    profiles: {
      id: 'prof-2',
      full_name: 'Gaurav Kohli',
      email: 'gaurav@example.com',
      phone: '9812345678',
    },
    properties: {
      id: 'prop-2',
      name: 'Green Valley Villas',
    },
    payment_schedules: [],
  },
];

const mockGetFinancials = (allotment: AllotmentRecord) => ({
  ticketId: `TICKET-${allotment.id}`,
  normalizedTicketId: `ticket-${allotment.id}`,
  dealValue: Number(allotment.total_cost),
  totalPaid: allotment.id === 'allot-1' ? 6000000 : 3000000,
  balanceDue: allotment.id === 'allot-1' ? 0 : 4500000,
  percentCompleted: allotment.id === 'allot-1' ? 100 : 40,
});

describe('PortalAllotmentsActiveView', () => {
  it('renders toolbar with search input, property filter, sort dropdown, and view toggles', () => {
    render(
      <PortalAllotmentsActiveView
        searchTerm=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search by client..."
        loading={false}
        loadingText="Loading..."
        noAllotmentsFoundText="No allotments found."
        filteredAllotments={mockAllotments}
        getAllotmentFinancials={mockGetFinancials}
        expandedAllotment={null}
        onToggleExpand={vi.fn()}
        onOpenLedger={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePaymentStatus={vi.fn()}
        onSelectReceipt={vi.fn()}
        onShareWhatsApp={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Search by client...')).toBeDefined();
    expect(screen.getByText(/All Projects/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Table View' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Card View' })).toBeDefined();
    expect(screen.getByText('All Allotments')).toBeDefined();
    expect(screen.getByText('Pending Balance')).toBeDefined();
    expect(screen.getByText('Fully Paid')).toBeDefined();
  });

  it('switches to card view when Card View button is clicked', () => {
    render(
      <PortalAllotmentsActiveView
        searchTerm=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search by client..."
        loading={false}
        loadingText="Loading..."
        noAllotmentsFoundText="No allotments found."
        filteredAllotments={mockAllotments}
        getAllotmentFinancials={mockGetFinancials}
        expandedAllotment={null}
        onToggleExpand={vi.fn()}
        onOpenLedger={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePaymentStatus={vi.fn()}
        onSelectReceipt={vi.fn()}
        onShareWhatsApp={vi.fn()}
      />
    );

    const cardViewBtn = screen.getByRole('button', { name: 'Card View' });
    fireEvent.click(cardViewBtn);

    // Both allotments should be visible in cards
    expect(screen.getByText('Aditya Sharma')).toBeDefined();
    expect(screen.getByText('Gaurav Kohli')).toBeDefined();
  });

  it('filters by status chips (e.g. Fully Paid)', () => {
    render(
      <PortalAllotmentsActiveView
        searchTerm=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search by client..."
        loading={false}
        loadingText="Loading..."
        noAllotmentsFoundText="No allotments found."
        filteredAllotments={mockAllotments}
        getAllotmentFinancials={mockGetFinancials}
        expandedAllotment={null}
        onToggleExpand={vi.fn()}
        onOpenLedger={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePaymentStatus={vi.fn()}
        onSelectReceipt={vi.fn()}
        onShareWhatsApp={vi.fn()}
      />
    );

    // Click Fully Paid chip (Aditya is 100% paid, Gaurav is 40%)
    const paidChip = screen.getByText('Fully Paid');
    fireEvent.click(paidChip);

    expect(screen.getByText('Aditya Sharma')).toBeDefined();
    expect(screen.queryByText('Gaurav Kohli')).toBeNull();
  });
});
