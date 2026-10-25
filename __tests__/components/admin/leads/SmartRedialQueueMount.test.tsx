import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadsTabNav } from '@/src/components/admin/leads/LeadsTabNav';
import type { LeadsTab } from '@/src/components/admin/leads/LeadsTabNav';
import { SmartRedialQueue } from '@/src/components/admin/leads/SmartRedialQueue';
import AdminLeadsPage from '@/app/admin/leads/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { IvrRecordItem } from '@/app/api/admin/leads/ivr-records/route';
import type { Employee } from '@/src/components/admin/employees/EmployeeCard';

// Mocks for AdminLeadsPage dependencies
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: () => ({
    token: 'test-admin-token',
    isAdmin: true,
    loading: false,
  }),
}));

const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    full_name: 'Ananya Sharma',
    email: 'ananya@sviinfra.com',
    phone: '9876500001',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'emp-2',
    full_name: 'Rahul Verma',
    email: 'rahul@sviinfra.com',
    phone: '9876500002',
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const mockRecords: IvrRecordItem[] = [
  {
    id: 'rec-1',
    customer_phone: '9876543210',
    agent_name: 'Ananya Sharma',
    agent_phone: '9876500001',
    dial_time: '2026-10-25T10:00:00Z',
    call_duration: 0,
    dial_status: 'NOANSWER',
    pressed_key: null,
    temperature: 'hot',
    campaign_name: 'Jaipur Ring Road Plots',
    created_at: '2026-10-25T10:00:00Z',
    recording_url: null,
    has_recording: false,
  },
  {
    id: 'rec-2',
    customer_phone: '9876543211',
    agent_name: 'Rahul Verma',
    agent_phone: '9876500002',
    dial_time: '2026-10-25T11:00:00Z',
    call_duration: 15,
    dial_status: 'ANSWER',
    pressed_key: '1',
    temperature: 'hot',
    campaign_name: 'Vatika Infotech City',
    created_at: '2026-10-25T11:00:00Z',
    recording_url: 'https://storage.sviinfra.com/recordings/audio2.mp3',
    has_recording: true,
  },
];

// Mock useIvrLeadsManagement to supply controlled records
vi.mock('@/src/components/admin/leads/useIvrLeadsManagement', () => ({
  useIvrLeadsManagement: () => ({
    ivrRecords: mockRecords,
    ivrTotalCount: mockRecords.length,
    ivrPage: 1,
    setIvrPage: vi.fn(),
    ivrLimit: 25,
    ivrLoading: false,
    ivrFilters: { dial_status: 'all', temperature: 'all', advisor_id: 'all' },
    setIvrFilters: vi.fn(),
    summary: {
      total_calls: 2,
      answered_calls: 1,
      missed_calls: 1,
      hot_count: 2,
      warm_count: 0,
      cold_count: 0,
    },
    employees: mockEmployees,
    fetchIvrRecords: vi.fn(),
    handleFilterChange: vi.fn(),
    handleTemperatureChange: vi.fn(),
    handleReassignAdvisor: vi.fn(),
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('SmartRedialQueueMount & LeadsTabNav Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ counts: { website_inquiries: 5 } }),
      })
    );
  });

  describe('LeadsTabNav Component', () => {
    it('renders the "Smart Redial Queue" tab with Action badge', () => {
      const handleTabChange = vi.fn();
      render(
        <LeadsTabNav
          activeTab="ivr"
          onTabChange={handleTabChange}
          ivrTotalCount={42}
          websiteCount={5}
        />
      );

      const redialTab = screen.getByRole('button', { name: /Smart Redial Queue/i });
      expect(redialTab).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();

      fireEvent.click(redialTab);
      expect(handleTabChange).toHaveBeenCalledWith('redial');
    });

    it('highlights the redial tab when active', () => {
      render(<LeadsTabNav activeTab="redial" onTabChange={vi.fn()} ivrTotalCount={42} />);

      const redialTab = screen.getByRole('button', { name: /Smart Redial Queue/i });
      expect(redialTab.className).toContain('bg-brand-navy');
    });
  });

  describe('SmartRedialQueue Component standalone', () => {
    it('renders queue metrics KPI cards and action buttons', () => {
      const handleFilterChange = vi.fn();
      const handleRefresh = vi.fn();

      render(
        <SmartRedialQueue
          records={mockRecords}
          employees={mockEmployees}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />
      );

      // Check KPI Command Row
      expect(screen.getByText('No-Answer Re-Dial')).toBeInTheDocument();
      expect(screen.getByText('Hot Priority Leads')).toBeInTheDocument();
      expect(screen.getByText(/Short Calls/i)).toBeInTheDocument();
      expect(screen.getByText('Entire Queue')).toBeInTheDocument();

      // Check Refresh Queue button
      const refreshBtn = screen.getByRole('button', { name: /Refresh Queue/i });
      expect(refreshBtn).toBeInTheDocument();
      fireEvent.click(refreshBtn);
      expect(handleRefresh).toHaveBeenCalled();

      // Check Action Buttons (Call Now, WhatsApp template, etc.)
      const callButtons = screen.getAllByText('Call Now');
      expect(callButtons.length).toBeGreaterThan(0);
    });
  });

  describe('AdminLeadsPage Integration & Tab Switching', () => {
    it('switches to redial queue view when redial tab is clicked in Leads Hub', () => {
      renderWithClient(<AdminLeadsPage />);

      // Initially on IVR leads
      expect(screen.getByText('IVR Campaign Leads')).toBeInTheDocument();

      // Click "Smart Redial Queue" tab
      const redialTab = screen.getByRole('button', { name: /Smart Redial Queue/i });
      fireEvent.click(redialTab);

      // Verify SmartRedialQueue is mounted and KPI cards are visible
      expect(screen.getByText('No-Answer Re-Dial')).toBeInTheDocument();
      expect(screen.getByText('Entire Queue')).toBeInTheDocument();
      expect(screen.getByText('Refresh Queue')).toBeInTheDocument();
    });

    it('mounts SmartRedialQueue directly when URL contains ?tab=redial', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          ...originalLocation,
          search: '?tab=redial',
        },
      });

      renderWithClient(<AdminLeadsPage />);

      expect(screen.getByText('No-Answer Re-Dial')).toBeInTheDocument();
      expect(screen.getByText('Hot Priority Leads')).toBeInTheDocument();

      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });
  });
});
