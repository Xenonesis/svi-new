import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAllotmentRecords, defaultCompanyInfo } from '@/src/components/admin/allotment-records';

// Mock Supabase
vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [{ name: 'Project A' }, { name: 'Project B' }],
            error: null,
          }),
        })),
      })),
    })),
  },
}));

// Mock authStore
vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({ token: 'mock-token-xyz' }),
}));

// Mock documentExporter
vi.mock('@/src/lib/utils/documentExporter', () => ({
  exportToPDF: vi.fn().mockResolvedValue(true),
  exportToImage: vi.fn().mockResolvedValue(true),
}));

describe('useAllotmentRecords Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/documents')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              documents: [
                {
                  id: 'doc-1',
                  document_type: 'allotment_letter',
                  form_data: {
                    clientName: 'Rahul Verma',
                    ticketId: 'TCK-101',
                    advisorName: 'Adviser 1',
                    projectName: 'Project A',
                  },
                },
                {
                  id: 'doc-2',
                  document_type: 'allotment_letter',
                  form_data: {
                    clientName: 'Pooja Sharma',
                    ticketId: 'TCK-102',
                    advisorName: 'Adviser 2',
                    projectName: 'Project B',
                  },
                },
              ],
            }),
        });
      }
      if (url.includes('/api/admin/settings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ value: defaultCompanyInfo }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('initializes with default values and loads allotments', async () => {
    const { result } = renderHook(() => useAllotmentRecords());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.allotments.length).toBe(2);
    expect(result.current.filteredAllotments.length).toBe(2);
  });

  it('filters allotments by clientName search query', async () => {
    const { result } = renderHook(() => useAllotmentRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery('Rahul');
    });

    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].form_data.clientName).toBe('Rahul Verma');
  });

  it('filters allotments by projectFilter', async () => {
    const { result } = renderHook(() => useAllotmentRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setProjectFilter('Project B');
    });

    expect(result.current.filteredAllotments.length).toBe(1);
    expect(result.current.filteredAllotments[0].form_data.clientName).toBe('Pooja Sharma');
  });

  it('handles delete action smoothly', async () => {
    const { result } = renderHook(() => useAllotmentRecords());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const target = result.current.allotments[0];
    act(() => {
      result.current.setDeleteTarget(target);
    });

    expect(result.current.deleteTarget).toEqual(target);

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(result.current.allotments.length).toBe(1);
    expect(result.current.deleteTarget).toBeNull();
  });
});
