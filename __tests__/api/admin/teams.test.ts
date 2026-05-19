import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/lib/supabase/verifyAdmin', () => ({
  verifyAdmin: vi.fn().mockResolvedValue({ id: 'admin-123', email: 'admin@test.com' }),
}));

const mockTeamsSelect = vi.fn();
const mockMembersSelect = vi.fn();

vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn((table: string) => {
      if (table === 'teams') {
        return { select: mockTeamsSelect };
      }
      if (table === 'team_members') {
        return { select: mockMembersSelect };
      }
      return { select: vi.fn() };
    }),
  },
}));

import { GET } from '@/app/api/admin/attendance/teams/route';

describe('GET /api/admin/attendance/teams', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockTeamsSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 'team-1', name: 'Engineering', description: 'Dev team', created_at: '2025-01-01' },
          { id: 'team-2', name: 'Sales', description: 'Sales team', created_at: '2025-01-02' },
          { id: 'team-3', name: 'Marketing', description: 'Mkt team', created_at: '2025-01-03' },
        ],
        error: null,
      }),
    });

    // team_members select returns all members in one query (N+1 fix)
    mockMembersSelect.mockResolvedValue({
      data: [
        { team_id: 'team-1' },
        { team_id: 'team-1' },
        { team_id: 'team-1' },
        { team_id: 'team-2' },
        { team_id: 'team-2' },
      ],
      error: null,
    });
  });

  it('should return 401 when not admin', async () => {
    const { verifyAdmin } = await import('@/src/lib/supabase/verifyAdmin');
    (verifyAdmin as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return teams with correct member counts', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.teams).toHaveLength(3);

    // team-1 has 3 members
    const team1 = data.teams.find((t: { id: string }) => t.id === 'team-1');
    expect(team1.member_count).toBe(3);

    // team-2 has 2 members
    const team2 = data.teams.find((t: { id: string }) => t.id === 'team-2');
    expect(team2.member_count).toBe(2);

    // team-3 has 0 members
    const team3 = data.teams.find((t: { id: string }) => t.id === 'team-3');
    expect(team3.member_count).toBe(0);
  });

  it('should use only 2 queries instead of N+1', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    await GET(request);

    // Should call from('teams') once and from('team_members') once
    // Not N+1 (which would be 1 + 3 = 4 calls)
    const { supabaseAdmin } = await import('@/src/lib/supabase/admin');
    expect(supabaseAdmin.from).toHaveBeenCalledTimes(2);
    expect(supabaseAdmin.from).toHaveBeenCalledWith('teams');
    expect(supabaseAdmin.from).toHaveBeenCalledWith('team_members');
  });

  it('should handle empty teams list', async () => {
    mockTeamsSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);
    const data = await response.json();

    expect(data.teams).toHaveLength(0);
  });

  it('should handle teams with no members', async () => {
    mockMembersSelect.mockResolvedValue({
      data: [],
      error: null,
    });

    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);
    const data = await response.json();

    // All teams should have 0 members
    for (const team of data.teams) {
      expect(team.member_count).toBe(0);
    }
  });

  it('should set Cache-Control header', async () => {
    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe(
      'private, max-age=30, stale-while-revalidate=60'
    );
  });

  it('should handle database error on teams query', async () => {
    mockTeamsSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Table not found' },
      }),
    });

    const request = new NextRequest('http://localhost/api/admin/attendance/teams');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Table not found');
  });
});
