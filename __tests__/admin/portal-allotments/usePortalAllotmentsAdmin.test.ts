import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePortalAllotmentsAdmin } from '@/src/components/admin/portal-allotments/usePortalAllotmentsAdmin';

const mockAllotments = [
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

const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'allotments') {
        return {
          select: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({ data: mockAllotments, error: null }),
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
});
