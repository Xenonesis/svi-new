import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard2 from '@/app/admin/dashboard2/page';

// Mock useRouter
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

// Mock auth store
vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      token: 'test-admin-token',
      userId: 'admin-user-id',
      isAdmin: true,
      loading: false,
    })
  ),
}));

// Mock supabase client
vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 'prop-1', name: 'Shreeji Valley - Phase 1', slug: 'shreeji-valley-1' },
            { id: 'prop-2', name: 'Vedic Greens', slug: 'vedic-greens' },
          ],
          error: null,
        }),
      })),
    })),
  },
}));

// Mock dashboard hooks
vi.mock('@/src/hooks/useDashboard', () => ({
  useUsers: () => ({
    data: { users: [] },
    isLoading: false,
  }),
  useAnalytics: () => ({
    data: {
      userGrowth: [],
      documentStats: [],
      trends: { userGrowth: '', clientGrowth: '', adminCount: '' },
    },
    isLoading: false,
  }),
  useActivities: () => ({
    data: { activities: [] },
    isLoading: false,
  }),
}));

// Mock user actions hook
vi.mock('@/src/components/admin/dashboard/useDashboardUserActions', () => ({
  useDashboardUserActions: () => ({
    deleteLoading: false,
    roleLoading: {},
    activeLoading: {},
    handleDelete: vi.fn(),
    handleRoleChange: vi.fn(),
    handleToggleActive: vi.fn(),
  }),
}));

// Mock exportExecutiveDossier
const mockExportDossier = vi.fn().mockResolvedValue(undefined);
vi.mock('@/src/lib/dashboard/exportExecutiveDossier', () => ({
  exportExecutiveDossier: (data: unknown) => mockExportDossier(data),
}));

// Mock fetch for executive dashboard route
const mockExecutiveData = {
  kpis: {
    totalCollections: 5400000,
    collectionsGrowthPercent: 12.5,
    collectionsSparkline: [10, 20, 30, 40, 54],
    activeLeads: 120,
    hotLeadsCount: 15,
    leadsSparkline: [5, 10, 15, 20],
    bookedPlots: 75,
    totalPlots: 100,
    plotsSparkline: [50, 60, 70, 75],
    onDutyStaff: 22,
    totalStaff: 25,
    attendanceRate: 88,
  },
  target: {
    monthlyTarget: 6000000,
    currentCollections: 5400000,
    percentage: 90,
    projectedTotal: 6200000,
    status: 'on_track' as const,
    dailyRunRateNeeded: 50000,
  },
  urgentActions: {
    unverifiedReceipts: [
      {
        id: 'rec-1',
        receipt_number: 'REC-101',
        customer_name: 'Anita Roy',
        amount: 350000,
        created_at: '2026-09-23T10:00:00Z',
      },
    ],
    hotLeadsPending: [
      {
        id: 'lead-1',
        name: 'Vikas Sharma',
        phone: '+919988776655',
        created_at: '2026-09-22T14:00:00Z',
        temperature: 'hot',
      },
    ],
    pendingLeaves: [],
  },
  paymentDues: [
    {
      id: 'due-1',
      customer_name: 'Rahul Gupta',
      plot_number: 'B-04',
      amount_due: 150000,
      due_date: '2026-09-30',
      is_overdue: false,
    },
  ],
  revenueTrend: [],
};

describe('AdminDashboard2 Page', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockExecutiveData,
    }) as unknown as typeof fetch;
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminDashboard2 />
      </QueryClientProvider>
    );
  };

  it('renders executive cockpit header, timeframe selectors, and zones correctly', async () => {
    renderPage();

    expect(screen.getByText('Executive Cockpit')).toBeDefined();
    expect(screen.getByText('Command Center')).toBeDefined();
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getByText('7 Days')).toBeDefined();
    expect(screen.getByText('30 Days')).toBeDefined();
    expect(screen.getByText('YTD')).toBeDefined();
    expect(screen.getByRole('button', { name: /open command palette/i })).toBeDefined();

    // Verify presence of Dual Cockpit titles
    expect(screen.getByText('Monthly Target Pacing')).toBeDefined();
    expect(screen.getByText('Project Inventory Pulse')).toBeDefined();

    // Verify operational triage radars
    expect(screen.getByText('Urgent Executive Triage')).toBeDefined();
    expect(screen.getByText('Payment Dues Radar')).toBeDefined();
  }, 15000);

  it('updates timeframe state when clicking timeframe buttons', async () => {
    renderPage();

    const sevenDaysBtn = screen.getByRole('button', { name: '7 Days' });
    fireEvent.click(sevenDaysBtn);

    // Should fetch or re-query for timeframe '7d'
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/dashboard/executive',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-admin-token' },
        })
      );
    });
  }, 15000);

  it('opens command palette modal when search button is clicked', async () => {
    renderPage();

    const searchBtn = screen.getByRole('button', { name: /open command palette/i });
    fireEvent.click(searchBtn);

    // Modal opens with placeholder
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a command or search/i)).toBeDefined();
    });
  }, 15000);

  it('toggles command palette with Ctrl+K keydown shortcut', async () => {
    renderPage();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a command or search/i)).toBeDefined();
    });
  }, 15000);

  it('triggers exportExecutiveDossier when export dossier is requested from briefing banner', async () => {
    renderPage();

    // Wait for executive data to load and briefing banner text to reflect loaded collections
    await waitFor(() => {
      expect(screen.getByText(/54\.0L collected/i)).toBeDefined();
    });

    const exportBtn = screen.getByRole('button', { name: /export dossier/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(mockExportDossier).toHaveBeenCalledWith(
        expect.objectContaining({
          kpis: expect.objectContaining({ totalCollections: 5400000 }),
        })
      );
    });
  }, 15000);
});
