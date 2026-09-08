import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmployeeWorkTracker } from '@/src/components/employee/work/useEmployeeWorkTracker';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockImplementation((key: string) => (key === 'tab' ? null : null)),
  }),
}));

describe('useEmployeeWorkTracker', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Call Client A',
      status: 'pending',
      priority: 'high',
      category: 'client_followup',
      created_at: '2026-09-08T00:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Inspect Site B',
      status: 'completed',
      priority: 'medium',
      category: 'site_visit',
      created_at: '2026-09-08T00:00:00Z',
    },
  ];

  const mockSiteVisits = [
    {
      id: 'visit-1',
      status: 'requested',
      created_at: '2026-09-08T00:00:00Z',
      contact: { name: 'John Doe', phone: '+919876543210' },
    },
  ];

  const mockLeads = [
    {
      id: 'lead-1',
      name: 'Ramesh Sharma',
      phone: '9876543210',
      lead_status: 'hot',
      lifecycle_status: 'contacted',
      created_at: '2026-09-08T00:00:00Z',
    },
  ];

  const mockWorkLogs = [
    {
      id: 'log-1',
      date: '2026-09-08',
      summary_text: 'Conducted 2 site visits',
      client_interactions_count: 5,
      site_visits_conducted_count: 2,
      created_at: '2026-09-08T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi
      .fn()
      .mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
        const urlStr = url.toString();

        if (urlStr.includes('/api/employee/work/tasks')) {
          if (init?.method === 'PATCH') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          if (init?.method === 'DELETE') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          if (init?.method === 'POST') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          return { ok: true, json: async () => ({ tasks: mockTasks }) } as Response;
        }

        if (urlStr.includes('/api/employee/work/site-visits')) {
          if (init?.method === 'PATCH') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          return { ok: true, json: async () => ({ site_visits: mockSiteVisits }) } as Response;
        }

        if (urlStr.includes('/api/employee/work/leads')) {
          if (init?.method === 'PATCH') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          return { ok: true, json: async () => ({ leads: mockLeads }) } as Response;
        }

        if (urlStr.includes('/api/employee/work/logs')) {
          if (init?.method === 'POST') {
            return { ok: true, json: async () => ({ success: true }) } as Response;
          }
          return { ok: true, json: async () => ({ logs: mockWorkLogs }) } as Response;
        }

        return { ok: true, json: async () => ({}) } as Response;
      }) as unknown as typeof fetch;
  });
  it('initializes with default values and loads work items on mount', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    expect(result.current.activeTab).toBe('tasks');
    expect(result.current.showAddTaskModal).toBe(false);
    expect(result.current.showAddLogModal).toBe(false);
    expect(result.current.showAddLeadModal).toBe(false);
    expect(result.current.selectedLeadForDrawer).toBe(null);

    // Wait for initial fetch to settle
    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.siteVisits).toHaveLength(1);
    expect(result.current.leads).toHaveLength(1);
    expect(result.current.workLogs).toHaveLength(1);
    expect(result.current.pendingTasksCount).toBe(1);
    expect(result.current.upcomingVisitsCount).toBe(1);
  });

  it('allows changing active tab and modal states', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    act(() => {
      result.current.setActiveTab('site-visits');
      result.current.setShowAddTaskModal(true);
      result.current.setShowAddLogModal(true);
      result.current.setShowAddLeadModal(true);
      result.current.setSelectedLeadForDrawer(mockLeads[0]);
    });

    expect(result.current.activeTab).toBe('site-visits');
    expect(result.current.showAddTaskModal).toBe(true);
    expect(result.current.showAddLogModal).toBe(true);
    expect(result.current.showAddLeadModal).toBe(true);
    expect(result.current.selectedLeadForDrawer?.name).toBe('Ramesh Sharma');
  });

  it('handles toggling task completion status', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.fetchData();
    });

    const pendingTask = result.current.tasks.find((t) => t.id === 'task-1')!;

    await act(async () => {
      await result.current.handleToggleTask(pendingTask);
    });

    const updatedTask = result.current.tasks.find((t) => t.id === 'task-1')!;
    expect(updatedTask.status).toBe('completed');
    expect(toast.success).toHaveBeenCalledWith('Task completed!');
  });

  it('handles task deletion', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.tasks).toHaveLength(2);

    await act(async () => {
      await result.current.handleDeleteTask('task-1');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks.find((t) => t.id === 'task-1')).toBeUndefined();
    expect(toast.success).toHaveBeenCalledWith('Task removed');
  });

  it('handles task creation', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.handleCreateTask({
        title: 'New Important Task',
        description: 'Testing task creation',
        priority: 'high',
        category: 'field_work',
        due_date: '2026-09-09',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Task created');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/employee/work/tasks',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('handles site visit status update', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.fetchData();
    });

    await act(async () => {
      await result.current.handleUpdateVisitStatus('visit-1', 'confirmed');
    });

    const updatedVisit = result.current.siteVisits.find((v) => v.id === 'visit-1')!;
    expect(updatedVisit.status).toBe('confirmed');
    expect(toast.success).toHaveBeenCalledWith('Visit marked as confirmed');
  });

  it('handles updating lead status and stage', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.fetchData();
    });
    await act(async () => {
      await result.current.handleUpdateLeadStage('lead-1', 'negotiation');
    });

    const updatedLead = result.current.leads.find((l) => l.id === 'lead-1')!;
    expect(updatedLead.lifecycle_status).toBe('negotiation');
    expect(toast.success).toHaveBeenCalledWith('Lead status updated');
  });

  it('handles shift log creation', async () => {
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.handleCreateLog({
        summary_text: 'Shift log content',
        client_interactions_count: 8,
        site_visits_conducted_count: 3,
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Work log submitted');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/employee/work/logs',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('displays toast error when fetchData fails', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useEmployeeWorkTracker());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load work items');
    expect(result.current.loading).toBe(false);
  });
});
