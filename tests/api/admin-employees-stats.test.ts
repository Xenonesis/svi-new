import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextRequest as ConcreteNextRequest } from 'next/server';

interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  real_email: string | null;
  phone: string | null;
  role: string;
  department: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RpcLeadStatsRecord {
  assigned_to: string;
  total_leads: number;
  won_leads: number;
  active_leads: number;
}

interface AttendanceRecord {
  user_id: string;
  status: string;
}

interface LegacyChatLeadRecord {
  assigned_to: string | null;
  lifecycle_status: string | null;
}

interface EmployeeStatsResponse {
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  presentDays: number;
  totalDays: number;
  attendanceRate: number;
}

interface EmployeeResponseItem extends ProfileRecord {
  stats: EmployeeStatsResponse;
}

interface EmployeesApiResponse {
  employees: EmployeeResponseItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface SupabaseQueryResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
}

class MockQueryBuilder<T> implements PromiseLike<SupabaseQueryResult<T>> {
  private _data: T | null;
  private _error: { message: string; code?: string } | null;
  private _count?: number | null;

  public inCalls: Array<{ column: string; values: unknown[] }> = [];
  public gteCalls: Array<{ column: string; value: unknown }> = [];

  constructor(
    data: T | null,
    error: { message: string; code?: string } | null = null,
    count?: number | null
  ) {
    this._data = data;
    this._error = error;
    this._count = count;
  }

  select(_columns?: string, _opts?: { count?: string }): this {
    return this;
  }

  eq(_col: string, _val: unknown): this {
    return this;
  }

  order(_col: string, _opts?: { ascending?: boolean }): this {
    return this;
  }

  range(_from: number, _to: number): this {
    return this;
  }

  or(_filter: string): this {
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.inCalls.push({ column, values });
    return this;
  }

  gte(column: string, value: unknown): this {
    this.gteCalls.push({ column, value });
    return this;
  }

  then<TResult1 = SupabaseQueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result: SupabaseQueryResult<T> = {
      data: this._data,
      error: this._error,
      count: this._count ?? (Array.isArray(this._data) ? this._data.length : null),
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

let mockProfilesBuilder = new MockQueryBuilder<ProfileRecord[]>([]);
let mockAttendanceBuilder = new MockQueryBuilder<AttendanceRecord[]>([]);
let mockChatLeadsBuilder = new MockQueryBuilder<LegacyChatLeadRecord[]>([]);
let mockChatLeadsQueryCount = 0;

interface RpcMockResult {
  data: RpcLeadStatsRecord[] | null;
  error: { message: string; code?: string } | null;
}

const mockRpcFn = vi.fn<(name: string, args: Record<string, unknown>) => Promise<RpcMockResult>>();

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({
    id: 'admin-test-uuid',
    email: 'admin@sviinfrasolutions.com',
    role: 'admin',
  }),
}));

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    rpc: (name: string, args: Record<string, unknown>) => mockRpcFn(name, args),
    from: (table: string) => {
      if (table === 'profiles') {
        return mockProfilesBuilder;
      }
      if (table === 'attendance_records') {
        return mockAttendanceBuilder;
      }
      if (table === 'chat_leads') {
        mockChatLeadsQueryCount++;
        return mockChatLeadsBuilder;
      }
      return new MockQueryBuilder<unknown>(null);
    },
  },
}));

import { GET } from '@/app/api/admin/employees/route';

const sampleEmployees: ProfileRecord[] = [
  {
    id: 'emp-uuid-1',
    full_name: 'Alice Johnson',
    email: 'alice@sviinfrasolutions.com',
    real_email: 'alice.personal@gmail.com',
    phone: '+919876543210',
    role: 'employee',
    department: 'Sales',
    notes: 'Senior Sales Agent',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'emp-uuid-2',
    full_name: 'Bob Smith',
    email: 'bob@sviinfrasolutions.com',
    real_email: null,
    phone: '+919876543211',
    role: 'employee',
    department: 'Marketing',
    notes: null,
    is_active: true,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
];

describe('/api/admin/employees - RPC Lead Stats & Aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatLeadsQueryCount = 0;
    mockProfilesBuilder = new MockQueryBuilder<ProfileRecord[]>(sampleEmployees, null, 2);
    mockAttendanceBuilder = new MockQueryBuilder<AttendanceRecord[]>([]);
    mockChatLeadsBuilder = new MockQueryBuilder<LegacyChatLeadRecord[]>([]);
  });

  it('aggregates stats using RPC correctly without row truncation for large lead volumes', async () => {
    // Simulate 21,737 total leads distributed between two employees
    const rpcLeadData: RpcLeadStatsRecord[] = [
      {
        assigned_to: 'emp-uuid-1',
        total_leads: 5420,
        won_leads: 320,
        active_leads: 4100,
      },
      {
        assigned_to: 'emp-uuid-2',
        total_leads: 16317,
        won_leads: 1200,
        active_leads: 12500,
      },
    ];

    mockRpcFn.mockResolvedValueOnce({
      data: rpcLeadData,
      error: null,
    });

    const mockAttendance: AttendanceRecord[] = [
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'absent' },
    ];
    mockAttendanceBuilder = new MockQueryBuilder<AttendanceRecord[]>(mockAttendance);

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);
    expect(mockRpcFn).toHaveBeenCalledTimes(1);
    expect(mockRpcFn).toHaveBeenCalledWith('get_employee_lead_stats', {
      p_employee_ids: ['emp-uuid-1', 'emp-uuid-2'],
    });

    // Verify chat_leads fallback query was NOT triggered
    expect(mockChatLeadsQueryCount).toBe(0);

    // Verify Alice Johnson stats
    const emp1 = body.employees.find((e) => e.id === 'emp-uuid-1');
    expect(emp1).toBeDefined();
    expect(emp1?.stats.totalLeads).toBe(5420);
    expect(emp1?.stats.wonLeads).toBe(320);
    expect(emp1?.stats.activeLeads).toBe(4100);
    expect(emp1?.stats.totalDays).toBe(3);
    expect(emp1?.stats.presentDays).toBe(2);
    expect(emp1?.stats.attendanceRate).toBe(67); // Math.round((2 / 3) * 100)

    // Verify Bob Smith stats
    const emp2 = body.employees.find((e) => e.id === 'emp-uuid-2');
    expect(emp2).toBeDefined();
    expect(emp2?.stats.totalLeads).toBe(16317);
    expect(emp2?.stats.wonLeads).toBe(1200);
    expect(emp2?.stats.activeLeads).toBe(12500);
    expect(emp2?.stats.totalDays).toBe(0);
    expect(emp2?.stats.presentDays).toBe(0);
    expect(emp2?.stats.attendanceRate).toBe(100); // 100% when totalDays is 0
  });

  it('seamlessly falls back to legacy query when RPC returns an error', async () => {
    // Simulate RPC missing in Supabase (e.g. code 42883)
    mockRpcFn.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'function get_employee_lead_stats(uuid[]) does not exist',
        code: '42883',
      },
    });

    const legacyLeads: LegacyChatLeadRecord[] = [
      { assigned_to: 'emp-uuid-1', lifecycle_status: 'won' },
      { assigned_to: 'emp-uuid-1', lifecycle_status: 'qualified' },
      { assigned_to: 'emp-uuid-1', lifecycle_status: 'lost' },
      { assigned_to: 'emp-uuid-2', lifecycle_status: 'contacted' },
      { assigned_to: 'emp-uuid-2', lifecycle_status: 'won' },
    ];
    mockChatLeadsBuilder = new MockQueryBuilder<LegacyChatLeadRecord[]>(legacyLeads);

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);
    expect(mockRpcFn).toHaveBeenCalledTimes(1);

    // Verify fallback query was triggered on chat_leads
    expect(mockChatLeadsQueryCount).toBe(1);
    expect(mockChatLeadsBuilder.inCalls).toEqual([
      {
        column: 'assigned_to',
        values: ['emp-uuid-1', 'emp-uuid-2'],
      },
    ]);

    // Check stats computed by fallback logic
    const emp1 = body.employees.find((e) => e.id === 'emp-uuid-1');
    expect(emp1?.stats.totalLeads).toBe(3);
    expect(emp1?.stats.wonLeads).toBe(1);
    expect(emp1?.stats.activeLeads).toBe(1); // 'qualified' is not 'won' and not 'lost'

    const emp2 = body.employees.find((e) => e.id === 'emp-uuid-2');
    expect(emp2?.stats.totalLeads).toBe(2);
    expect(emp2?.stats.wonLeads).toBe(1);
    expect(emp2?.stats.activeLeads).toBe(1); // 'contacted'
  });

  it('seamlessly falls back to legacy query when RPC promise rejects', async () => {
    // Simulate network error / timeout during RPC call
    mockRpcFn.mockRejectedValueOnce(new Error('Network connection timeout to Supabase RPC'));

    const legacyLeads: LegacyChatLeadRecord[] = [
      { assigned_to: 'emp-uuid-1', lifecycle_status: 'won' },
      { assigned_to: 'emp-uuid-1', lifecycle_status: 'new' },
    ];
    mockChatLeadsBuilder = new MockQueryBuilder<LegacyChatLeadRecord[]>(legacyLeads);

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);
    expect(mockChatLeadsQueryCount).toBe(1);

    const emp1 = body.employees.find((e) => e.id === 'emp-uuid-1');
    expect(emp1?.stats.totalLeads).toBe(2);
    expect(emp1?.stats.wonLeads).toBe(1);
    expect(emp1?.stats.activeLeads).toBe(1);
  });

  it('correctly calculates attendance metrics over 60-day window', async () => {
    mockRpcFn.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const mockAttendance: AttendanceRecord[] = [
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'present' },
      { user_id: 'emp-uuid-1', status: 'absent' },
      // 4 present out of 5 = 80%
      { user_id: 'emp-uuid-2', status: 'present' },
      { user_id: 'emp-uuid-2', status: 'half_day' },
      // 1 present out of 2 = 50%
    ];
    mockAttendanceBuilder = new MockQueryBuilder<AttendanceRecord[]>(mockAttendance);

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);
    const emp1 = body.employees.find((e) => e.id === 'emp-uuid-1');
    expect(emp1?.stats.presentDays).toBe(4);
    expect(emp1?.stats.totalDays).toBe(5);
    expect(emp1?.stats.attendanceRate).toBe(80);

    const emp2 = body.employees.find((e) => e.id === 'emp-uuid-2');
    expect(emp2?.stats.presentDays).toBe(1);
    expect(emp2?.stats.totalDays).toBe(2);
    expect(emp2?.stats.attendanceRate).toBe(50);
  });

  it('handles employee with zero leads in RPC response with zero defaults', async () => {
    // RPC returns stats for emp-uuid-1 only; emp-uuid-2 has 0 leads
    mockRpcFn.mockResolvedValueOnce({
      data: [
        {
          assigned_to: 'emp-uuid-1',
          total_leads: 10,
          won_leads: 5,
          active_leads: 3,
        },
      ],
      error: null,
    });

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);

    const emp2 = body.employees.find((e) => e.id === 'emp-uuid-2');
    expect(emp2).toBeDefined();
    expect(emp2?.stats.totalLeads).toBe(0);
    expect(emp2?.stats.wonLeads).toBe(0);
    expect(emp2?.stats.activeLeads).toBe(0);
    expect(emp2?.stats.attendanceRate).toBe(100);
  });

  it('skips RPC and attendance queries when no employees exist', async () => {
    mockProfilesBuilder = new MockQueryBuilder<ProfileRecord[]>([], null, 0);

    const request: NextRequest = new ConcreteNextRequest('http://localhost/api/admin/employees');
    const response = await GET(request);
    const body = (await response.json()) as EmployeesApiResponse;

    expect(response.status).toBe(200);
    expect(body.employees).toEqual([]);
    expect(body.total).toBe(0);
    expect(mockRpcFn).not.toHaveBeenCalled();
    expect(mockChatLeadsQueryCount).toBe(0);
  });
});
