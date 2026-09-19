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
});
