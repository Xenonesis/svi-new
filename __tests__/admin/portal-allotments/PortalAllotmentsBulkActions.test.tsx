import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { PortalAllotmentsFloatingDock } from '@/src/components/admin/portal-allotments/PortalAllotmentsFloatingDock';
import { BulkWhatsAppReminderModal } from '@/src/components/admin/portal-allotments/BulkWhatsAppReminderModal';
import { PortalAllotmentsActiveView } from '@/src/components/admin/portal-allotments/PortalAllotmentsActiveView';
import { PortalAllotmentTableRow } from '@/src/components/admin/portal-allotments/PortalAllotmentTableRow';
import { usePortalAllotmentsAdmin } from '@/src/components/admin/portal-allotments/usePortalAllotmentsAdmin';
import type {
  AllotmentRecord,
  AllotmentFinancials,
} from '@/src/components/admin/portal-allotments/types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'allotments') {
        return {
          select: vi.fn(() => ({
            order: vi
              .fn()
              .mockImplementation(() => Promise.resolve({ data: mockAllotments, error: null })),
          })),
          insert: vi.fn().mockResolvedValue({ error: null }),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })),
      };
    }),
  },
}));
const mockAllotments: AllotmentRecord[] = [
  {
    id: 'allot-1',
    profile_id: 'prof-1',
    property_id: 'prop-1',
    unit_number: '101',
    area: 120,
    total_cost: 5000000,
    booking_date: '2026-01-10',
    profiles: {
      id: 'prof-1',
      full_name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9876543210',
    },
    properties: { id: 'prop-1', name: 'Shyam Aangan' },
    metadata: { ticket_id: 'SVI-1001' },
    payment_schedules: [
      {
        id: 'ps-1',
        allotment_id: 'allot-1',
        due_date: '2026-02-01',
        amount: 2000000,
        status: 'paid',
      },
    ],
  },
  {
    id: 'allot-2',
    profile_id: 'prof-2',
    property_id: 'prop-1',
    unit_number: '102',
    area: 150,
    total_cost: 6000000,
    booking_date: '2026-01-15',
    profiles: {
      id: 'prof-2',
      full_name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '9876500000',
    },
    properties: { id: 'prop-1', name: 'Shyam Aangan' },
    metadata: { ticket_id: 'SVI-1002' },
    payment_schedules: [],
  },
];

const mockGetFinancials = (allotment: AllotmentRecord): AllotmentFinancials => {
  if (allotment.id === 'allot-1') {
    return {
      ticketId: 'SVI-1001',
      normalizedTicketId: 'SVI1001',
      dealValue: 5000000,
      totalPaid: 2000000,
      balanceDue: 3000000,
      percentCompleted: 40,
    };
  }
  return {
    ticketId: 'SVI-1002',
    normalizedTicketId: 'SVI1002',
    dealValue: 6000000,
    totalPaid: 0,
    balanceDue: 6000000,
    percentCompleted: 0,
  };
};

describe('PortalAllotmentsFloatingDock', () => {
  it('does not render when selectedCount is 0', () => {
    const { container } = render(
      <PortalAllotmentsFloatingDock
        selectedCount={0}
        selectedTotalBalance={0}
        onOpenBulkWhatsApp={vi.fn()}
        onExportSelected={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when selectedCount > 0 and displays balance', () => {
    render(
      <PortalAllotmentsFloatingDock
        selectedCount={2}
        selectedTotalBalance={9000000}
        onOpenBulkWhatsApp={vi.fn()}
        onExportSelected={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    expect(screen.getByText('2 Selected')).toBeDefined();
    expect(screen.getByText(/Pending Balance: ₹90,00,000/i)).toBeDefined();
  });

  it('triggers action callbacks', () => {
    const onOpenBulkWhatsApp = vi.fn();
    const onExportSelected = vi.fn();
    const onClearSelection = vi.fn();

    render(
      <PortalAllotmentsFloatingDock
        selectedCount={2}
        selectedTotalBalance={9000000}
        onOpenBulkWhatsApp={onOpenBulkWhatsApp}
        onExportSelected={onExportSelected}
        onClearSelection={onClearSelection}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /whatsapp/i }));
    expect(onOpenBulkWhatsApp).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(onExportSelected).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /deselect all|clear/i }));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });
});

describe('BulkWhatsAppReminderModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('does not render content when isOpen is false', () => {
    render(
      <BulkWhatsAppReminderModal
        isOpen={false}
        onClose={vi.fn()}
        selectedAllotments={mockAllotments}
        getAllotmentFinancials={mockGetFinancials}
      />
    );
    expect(screen.queryByText('Bulk WhatsApp Reminders')).toBeNull();
  });

  it('renders modal with client details and pre-generated message template', () => {
    render(
      <BulkWhatsAppReminderModal
        isOpen={true}
        onClose={vi.fn()}
        selectedAllotments={mockAllotments}
        getAllotmentFinancials={mockGetFinancials}
      />
    );

    expect(screen.getByText('Bulk WhatsApp Reminders')).toBeDefined();
    expect(screen.getByText('Rahul Sharma')).toBeDefined();
    expect(screen.getByText('Priya Patel')).toBeDefined();
    expect(screen.getByText(/Pending: ₹30,00,000/)).toBeDefined();
    expect(screen.getByText(/Pending: ₹60,00,000/)).toBeDefined();

    expect(screen.getByText(/Namaste Rahul Sharma ji/)).toBeDefined();
    expect(screen.getByText(/Regarding your Unit 101 at Shyam Aangan/)).toBeDefined();
    expect(screen.getByText(/Your outstanding balance is ₹30,00,000/)).toBeDefined();
  });

  it('opens WhatsApp with pre-filled message on button click', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <BulkWhatsAppReminderModal
        isOpen={true}
        onClose={vi.fn()}
        selectedAllotments={[mockAllotments[0]]}
        getAllotmentFinancials={mockGetFinancials}
      />
    );

    const waButtons = screen.getAllByRole('button', { name: /open whatsapp|whatsapp/i });
    fireEvent.click(waButtons[0]);

    expect(windowOpenSpy).toHaveBeenCalled();
    const openedUrl = windowOpenSpy.mock.calls[0][0] as string;
    expect(openedUrl).toContain('https://wa.me/919876543210?text=');
    expect(decodeURIComponent(openedUrl)).toContain('Namaste Rahul Sharma ji');

    windowOpenSpy.mockRestore();
  });

  it('copies message to clipboard and displays toast', async () => {
    render(
      <BulkWhatsAppReminderModal
        isOpen={true}
        onClose={vi.fn()}
        selectedAllotments={[mockAllotments[0]]}
        getAllotmentFinancials={mockGetFinancials}
      />
    );

    const copyButtons = screen.getAllByRole('button', { name: /copy message|copy/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const writeTextMock = vi.mocked(navigator.clipboard.writeText);
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('Namaste Rahul Sharma ji');
    expect(toast.success).toHaveBeenCalled();
  });
});
describe('PortalAllotmentsActiveView with Checkboxes', () => {
  it('renders select-all checkbox and row checkboxes', () => {
    const onToggleSelectRow = vi.fn();
    const onToggleSelectAll = vi.fn();

    render(
      <PortalAllotmentsActiveView
        searchTerm=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search"
        loading={false}
        loadingText="Loading"
        noAllotmentsFoundText="No allotments"
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
        selectedProperty="all"
        properties={[]}
        selectedPaymentStatus="all"
        selectedSaleMode="all"
        selectedAdvisor="all"
        advisors={[]}
        activeFilterCount={0}
        selectedIds={new Set(['allot-1'])}
        onToggleSelectRow={onToggleSelectRow}
        onToggleSelectAll={onToggleSelectAll}
        isAllSelected={false}
        isSomeSelected={true}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('Select all allotments') as HTMLInputElement;
    expect(selectAllCheckbox).toBeDefined();
    expect(selectAllCheckbox.checked).toBe(false);
    expect(selectAllCheckbox.indeterminate).toBe(true);

    fireEvent.click(selectAllCheckbox);
    expect(onToggleSelectAll).toHaveBeenCalledTimes(1);

    const rowCheckbox1 = screen.getByLabelText('Select unit 101') as HTMLInputElement;
    expect(rowCheckbox1.checked).toBe(true);

    const rowCheckbox2 = screen.getByLabelText('Select unit 102') as HTMLInputElement;
    expect(rowCheckbox2.checked).toBe(false);

    fireEvent.click(rowCheckbox2);
    expect(onToggleSelectRow).toHaveBeenCalledWith('allot-2');
  });
});

describe('PortalAllotmentTableRow Checkbox & Drawer colSpan', () => {
  it('renders checkbox in table-row and sets colSpan to 10 for drawer', () => {
    const onToggleSelect = vi.fn();

    const { container } = render(
      <table>
        <tbody>
          <PortalAllotmentTableRow
            variant="table-row"
            allotment={mockAllotments[0]}
            financials={mockGetFinancials(mockAllotments[0])}
            isExpanded={true}
            onToggleExpand={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            isSelected={true}
            onToggleSelect={onToggleSelect}
          >
            <div>Drawer Content</div>
          </PortalAllotmentTableRow>
        </tbody>
      </table>
    );

    const checkbox = screen.getByLabelText('Select unit 101');
    expect(checkbox).toBeDefined();

    const drawerTd = container.querySelector('td[colSpan="10"]');
    expect(drawerTd).toBeDefined();
    expect(screen.getByText('Drawer Content')).toBeDefined();
  });
});

describe('usePortalAllotmentsAdmin Selection State', () => {
  it('manages row selection, select all, and clear selection', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    // Initially empty
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(false);

    // Toggle single row
    act(() => {
      result.current.toggleSelectRow('allot-1');
    });

    expect(result.current.selectedIds.has('allot-1')).toBe(true);
    expect(result.current.selectedIds.size).toBe(1);

    // Clear selection
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedIds.size).toBe(0);
  });
});
