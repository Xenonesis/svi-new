import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortalAllotmentTableRow } from '@/src/components/admin/portal-allotments/PortalAllotmentTableRow';
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

const mockAllotment: AllotmentRecord = {
  id: 'allot-1',
  profile_id: 'prof-1',
  property_id: 'prop-1',
  unit_number: 'Villa-42',
  area: 150,
  total_cost: 7500000,
  booking_date: '2026-05-15',
  profiles: {
    id: 'prof-1',
    full_name: 'Rajesh Sharma',
    email: 'rajesh@example.com',
  },
  properties: {
    id: 'prop-1',
    name: 'Shyam Aangan',
  },
  payment_schedules: [],
};

describe('PortalAllotmentTableRow', () => {
  it('renders customer, property, unit, area, cost, and date details', () => {
    render(
      <PortalAllotmentTableRow
        allotment={mockAllotment}
        isExpanded={false}
        onToggleExpand={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/Rajesh Sharma/)).toBeDefined();
    expect(screen.getByText(/\(rajesh@example\.com\)/)).toBeDefined();
    expect(screen.getByText('Shyam Aangan')).toBeDefined();
    expect(screen.getByText('Villa-42')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
    expect(screen.getAllByText(/75,00,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2026-05-15')).toBeDefined();
    expect(screen.getByText('View Payments')).toBeDefined();
  });

  it('triggers expand toggle, edit, and delete callbacks', () => {
    const handleToggleExpand = vi.fn();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <PortalAllotmentTableRow
        allotment={mockAllotment}
        isExpanded={true}
        onToggleExpand={handleToggleExpand}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByText('Hide Payments')).toBeDefined();
    fireEvent.click(screen.getByText('Hide Payments'));
    expect(handleToggleExpand).toHaveBeenCalledTimes(1);

    const editBtn = screen.getByLabelText('Edit Allotment');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockAllotment);

    const deleteBtn = screen.getByLabelText('Delete');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('allot-1');
  });

  it('triggers onOpenLedger callback when Ledger button is clicked', () => {
    const handleOpenLedger = vi.fn();
    render(
      <PortalAllotmentTableRow
        allotment={mockAllotment}
        isExpanded={false}
        onToggleExpand={vi.fn()}
        onOpenLedger={handleOpenLedger}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const ledgerBtn = screen.getByLabelText('View Client Ledger');
    expect(ledgerBtn).toBeDefined();
    fireEvent.click(ledgerBtn);
    expect(handleOpenLedger).toHaveBeenCalledWith(mockAllotment);
  });

  it('renders nested child content when passed', () => {
    render(
      <PortalAllotmentTableRow
        allotment={mockAllotment}
        isExpanded={true}
        onToggleExpand={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      >
        <div data-testid="nested-drawer">Drawer Content</div>
      </PortalAllotmentTableRow>
    );

    expect(screen.getByTestId('nested-drawer')).toBeDefined();
    expect(screen.getByText('Drawer Content')).toBeDefined();
  });

  it('renders advisor name when present on allotment', () => {
    const allotmentWithAdvisor: AllotmentRecord = {
      ...mockAllotment,
      advisor_name: 'Muskan Varshney',
    };

    render(
      <PortalAllotmentTableRow
        allotment={allotmentWithAdvisor}
        isExpanded={false}
        onToggleExpand={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Advisor / Agent:')).toBeDefined();
    expect(screen.getByText('Muskan Varshney')).toBeDefined();
  });

  it('renders separate Ref ID and Unit No in table-row variant', () => {
    const allotmentWithTicket: AllotmentRecord = {
      ...mockAllotment,
      metadata: {
        ticket_id: 'PL2181',
      },
    };

    const { container } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={allotmentWithTicket}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    const cells = container.querySelectorAll('td');
    expect(cells.length).toBeGreaterThanOrEqual(8);
    // Cell 1: Ref ID
    expect(cells[0].textContent).toContain('PL2181');
    // Cell 2: Unit & Property (does NOT contain Ref ID)
    expect(cells[1].textContent).toContain('Unit Villa-42');
    expect(cells[1].textContent).toContain('Shyam Aangan');
    expect(cells[1].textContent).not.toContain('PL2181');
  });

  it('renders micro-progress bar with appropriate color and width based on collection percentage in table-row', () => {
    const { container: c100 } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={mockAllotment}
            financials={{
              ticketId: 'TICKET-1',
              normalizedTicketId: 'ticket-1',
              dealValue: 7500000,
              totalPaid: 7500000,
              balanceDue: 0,
              percentCompleted: 100,
              collectionPercentage: 100,
            }}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    const bar100 = c100.querySelector('div[style*="width: 100%"]');
    expect(bar100).toBeDefined();
    expect(bar100?.className).toContain('bg-emerald-500');

    const { container: c50 } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={mockAllotment}
            financials={{
              ticketId: 'TICKET-1',
              normalizedTicketId: 'ticket-1',
              dealValue: 7500000,
              totalPaid: 3750000,
              balanceDue: 3750000,
              percentCompleted: 50,
              collectionPercentage: 50,
            }}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    const bar50 = c50.querySelector('div[style*="width: 50%"]');
    expect(bar50).toBeDefined();
    expect(bar50?.className).toContain('bg-indigo-600');

    const { container: c25 } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={mockAllotment}
            financials={{
              ticketId: 'TICKET-1',
              normalizedTicketId: 'ticket-1',
              dealValue: 7500000,
              totalPaid: 1875000,
              balanceDue: 5625000,
              percentCompleted: 25,
              collectionPercentage: 25,
            }}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    const bar25 = c25.querySelector('div[style*="width: 25%"]');
    expect(bar25).toBeDefined();
    expect(bar25?.className).toContain('bg-amber-500');
  });

  it('renders overdue alert badge when past-due unpaid payment schedule exists', () => {
    const overdueAllotment: AllotmentRecord = {
      ...mockAllotment,
      payment_schedules: [
        {
          id: 'sched-1',
          title: 'Installment 1',
          amount: 500000,
          due_date: '2026-01-15',
          status: 'pending',
        },
        {
          id: 'sched-2',
          title: 'Installment 2',
          amount: 500000,
          due_date: '2026-03-01',
          status: 'unpaid',
        },
      ],
    };

    // Table-row variant
    const { container: tableContainer } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={overdueAllotment}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(tableContainer.textContent).toContain('Overdue: 2026-01-15');

    // Card variant
    const { container: cardContainer } = render(
      <PortalAllotmentTableRow
        variant="card"
        allotment={overdueAllotment}
        isExpanded={false}
        onToggleExpand={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(cardContainer.textContent).toContain('Overdue: 2026-01-15');
  });

  it('does not render overdue alert badge when payment schedule is paid or in the future', () => {
    const paidAllotment: AllotmentRecord = {
      ...mockAllotment,
      payment_schedules: [
        {
          id: 'sched-1',
          title: 'Installment 1',
          amount: 500000,
          due_date: '2026-01-15',
          status: 'paid',
        },
        {
          id: 'sched-2',
          title: 'Installment 2',
          amount: 500000,
          due_date: '2099-12-31',
          status: 'pending',
        },
      ],
    };

    const { container } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={paidAllotment}
            isExpanded={false}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(container.textContent).not.toContain('Overdue:');
  });
});
