import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePortalAllotmentsAdmin } from '@/src/components/admin/portal-allotments/usePortalAllotmentsAdmin';
import type { AllotmentRecord } from '@/src/components/admin/portal-allotments/types';

const mockAllotments: AllotmentRecord[] = [
  {
    id: 'allot-1',
    profile_id: 'prof-1',
    property_id: 'prop-1',
    unit_number: 'Villa-101',
    area: 120,
    total_cost: 6000000,
    booking_date: '2026-01-10',
    profiles: { id: 'prof-1', full_name: 'Rahul Gupta', email: 'rahul@example.com' },
    properties: { id: 'prop-1', name: 'Shyam Aangan' },
    payment_schedules: [
      {
        id: 'pay-1',
        milestone_name: 'Token',
        due_date: '2026-02-01',
        amount: 200000,
        status: 'pending',
      },
    ],
  },
  {
    id: 'allot-2',
    profile_id: 'prof-2',
    property_id: 'prop-2',
    unit_number: 'Plot-5',
    area: 250,
    total_cost: 8500000,
    booking_date: '2026-02-15',
    profiles: { id: 'prof-2', full_name: 'Pooja Singh', email: 'pooja@example.com' },
    properties: { id: 'prop-2', name: 'Shyam Farm' },
    payment_schedules: [],
  },
];

const mockProfiles = [
  { id: 'prof-1', full_name: 'Rahul Gupta', email: 'rahul@example.com' },
  { id: 'prof-2', full_name: 'Pooja Singh', email: 'pooja@example.com' },
];

const mockProperties = [
  { id: 'prop-1', name: 'Shyam Aangan' },
  { id: 'prop-2', name: 'Shyam Farm' },
];

let currentAllotments: AllotmentRecord[] = mockAllotments;

const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'allotments') {
        return {
          select: vi.fn(() => ({
            order: vi
              .fn()
              .mockImplementation(() => Promise.resolve({ data: currentAllotments, error: null })),
          })),
          insert: mockInsert,
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
          delete: vi.fn(() => ({
            eq: mockDeleteEq,
          })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          })),
        };
      }
      if (table === 'properties') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({ data: mockProperties, error: null }),
            })),
          })),
        };
      }
      if (table === 'payment_schedules') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      };
    }),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (params?.status) return `Payment marked as ${params.status}`;
    return key;
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('usePortalAllotmentsAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentAllotments = mockAllotments;
  });

  it('fetches allotments, profiles, and properties on mount', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.allotments.length).toBe(2);
    expect(result.current.profiles.length).toBe(2);
    expect(result.current.properties.length).toBe(2);
  });

  it('filters allotments by customer name, unit number, property name, or email', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSearchTerm('Rahul');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].unit_number).toBe('Villa-101');

    act(() => {
      result.current.setSearchTerm('Plot-5');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].profiles?.full_name).toBe('Pooja Singh');

    act(() => {
      result.current.setSearchTerm('Farm');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].properties?.name).toBe('Shyam Farm');

    act(() => {
      result.current.setSearchTerm('rahul@example.com');
    });
    expect(result.current.filteredAllotments.length).toBe(1);

    act(() => {
      result.current.setSearchTerm('NonExistent');
    });
    expect(result.current.filteredAllotments.length).toBe(0);
  });

  it('manages modal opening for create and edit and closing', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.openCreateModal();
    });
    expect(result.current.showModal).toBe(true);
    expect(result.current.editingId).toBeNull();
    expect(result.current.formData.profile_id).toBe('');

    act(() => {
      result.current.closeModal();
    });
    expect(result.current.showModal).toBe(false);

    act(() => {
      result.current.openEditModal(mockAllotments[0]);
    });
    expect(result.current.showModal).toBe(true);
    expect(result.current.editingId).toBe('allot-1');
    expect(result.current.formData.profile_id).toBe('prof-1');
    expect(result.current.formData.unit_number).toBe('Villa-101');
  });

  it('handles allotment deletion when confirmed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleDelete('allot-1');
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'allot-1');
    confirmSpy.mockRestore();
  });

  it('calculates sales revenue stats and per-client financials correctly', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    // Mock allotments:
    // allot-1: cost 6000000, 1 pending payment of 200000 -> totalPaid: 0, balance: 6000000
    // allot-2: cost 8500000, no payments -> totalPaid: 0, balance: 8500000
    // Total sales revenue: 6000000 + 8500000 = 14500000
    expect(result.current.salesRevenueStats.totalSalesRevenue).toBe(14500000);
    expect(result.current.salesRevenueStats.totalRevenueCollected).toBe(0);
    expect(result.current.salesRevenueStats.totalBalanceDue).toBe(14500000);
    expect(result.current.salesRevenueStats.activeAccountsCount).toBe(2);

    const fin1 = result.current.getAllotmentFinancials(mockAllotments[0]);
    expect(fin1.dealValue).toBe(6000000);
    expect(fin1.totalPaid).toBe(0);
    expect(fin1.balanceDue).toBe(6000000);
  });

  it('handles opening client ledger and saving deal value', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.openClientLedger(mockAllotments[0]);
    });
    expect(result.current.activeLedgerRefId).toBeDefined();

    act(() => {
      result.current.setIsLedgersModalOpen(true);
    });
    expect(result.current.isLedgersModalOpen).toBe(true);

    await act(async () => {
      await result.current.handleSaveDealValue('ALLOT1', 6500000);
    });
    expect(result.current.dealValuesMap['ALLOT1']).toBe(6500000);
  });

  it('filters allotments by property', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelectedProperty('prop-1');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].property_id).toBe('prop-1');

    act(() => {
      result.current.setSelectedProperty('prop-2');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].property_id).toBe('prop-2');

    act(() => {
      result.current.setSelectedProperty('all');
    });
    expect(result.current.filteredAllotments.length).toBe(2);
  });

  it('filters allotments by sale mode (Direct Sell vs Draw)', async () => {
    currentAllotments = [
      {
        ...mockAllotments[0],
        metadata: { allotment_mode: 'Direct Sell' },
      },
      {
        ...mockAllotments[1],
        metadata: { allotment_mode: 'Draw' },
      },
    ];

    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelectedSaleMode('Direct Sell');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].id).toBe('allot-1');

    act(() => {
      result.current.setSelectedSaleMode('Draw');
    });
    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].id).toBe('allot-2');

    act(() => {
      result.current.setSelectedSaleMode('all');
    });
    expect(result.current.filteredAllotments.length).toBe(2);
  });

  it('filters allotments by payment status (fully_paid, partially_paid, overdue, unpaid)', async () => {
    currentAllotments = [
      {
        ...mockAllotments[0],
        id: 'allot-fully-paid',
        total_cost: 5000000,
        payment_schedules: [
          {
            id: 'pay-f1',
            milestone_name: 'Full',
            due_date: '2026-01-01',
            amount: 5000000,
            status: 'paid',
          },
        ],
      },
      {
        ...mockAllotments[0],
        id: 'allot-partially-paid',
        total_cost: 6000000,
        payment_schedules: [
          {
            id: 'pay-p1',
            milestone_name: 'Token',
            due_date: '2026-01-01',
            amount: 3000000,
            status: 'paid',
          },
          {
            id: 'pay-p2',
            milestone_name: 'Balance',
            due_date: '2027-01-01',
            amount: 3000000,
            status: 'pending',
          },
        ],
      },
      {
        ...mockAllotments[0],
        id: 'allot-overdue',
        total_cost: 4000000,
        payment_schedules: [
          {
            id: 'pay-o1',
            milestone_name: 'Overdue Installment',
            due_date: '2020-01-01',
            amount: 1000000,
            status: 'pending',
          },
        ],
      },
      {
        ...mockAllotments[0],
        id: 'allot-unpaid',
        total_cost: 7000000,
        payment_schedules: [],
      },
    ];

    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setSelectedPaymentStatus('fully_paid');
    });
    expect(result.current.filteredAllotments.map((a) => a.id)).toEqual(['allot-fully-paid']);

    act(() => {
      result.current.setSelectedPaymentStatus('partially_paid');
    });
    expect(result.current.filteredAllotments.map((a) => a.id)).toEqual(['allot-partially-paid']);

    act(() => {
      result.current.setSelectedPaymentStatus('overdue');
    });
    expect(result.current.filteredAllotments.map((a) => a.id)).toEqual(['allot-overdue']);

    act(() => {
      result.current.setSelectedPaymentStatus('unpaid');
    });
    expect(result.current.filteredAllotments.map((a) => a.id)).toEqual([
      'allot-overdue',
      'allot-unpaid',
    ]);

    act(() => {
      result.current.setSelectedPaymentStatus('all');
    });
    expect(result.current.filteredAllotments.length).toBe(4);
  });

  it('sorts allotments by deal_value (descending and ascending)', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    // Default sort is booking_date desc
    expect(result.current.sortField).toBe('booking_date');
    expect(result.current.sortDirection).toBe('desc');

    // Click deal_value -> sets deal_value desc (allot-2: 8500000, allot-1: 6000000)
    act(() => {
      result.current.handleSort('deal_value');
    });
    expect(result.current.sortField).toBe('deal_value');
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.filteredAllotments[0].id).toBe('allot-2');
    expect(result.current.filteredAllotments[1].id).toBe('allot-1');

    // Click deal_value again -> toggles to asc (allot-1: 6000000, allot-2: 8500000)
    act(() => {
      result.current.handleSort('deal_value');
    });
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.filteredAllotments[0].id).toBe('allot-1');
    expect(result.current.filteredAllotments[1].id).toBe('allot-2');
  });

  it('defaults unit_number and ref_id to asc when clicked as new sort field', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.handleSort('unit_number');
    });
    expect(result.current.sortField).toBe('unit_number');
    expect(result.current.sortDirection).toBe('asc');

    act(() => {
      result.current.handleSort('ref_id');
    });
    expect(result.current.sortField).toBe('ref_id');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('resets filters and clears active count', async () => {
    const { result } = renderHook(() => usePortalAllotmentsAdmin());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.activeFilterCount).toBe(0);

    act(() => {
      result.current.setSelectedProperty('prop-1');
    });
    expect(result.current.activeFilterCount).toBe(1);

    act(() => {
      result.current.setSelectedPaymentStatus('overdue');
      result.current.setSelectedSaleMode('Direct Sell');
      result.current.setSelectedAdvisor('Advisor A');
      result.current.setSearchTerm('Rahul');
    });
    expect(result.current.activeFilterCount).toBe(5);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.selectedProperty).toBe('all');
    expect(result.current.selectedPaymentStatus).toBe('all');
    expect(result.current.selectedSaleMode).toBe('all');
    expect(result.current.selectedAdvisor).toBe('all');
    expect(result.current.searchTerm).toBe('');
    expect(result.current.activeFilterCount).toBe(0);
  });
});
