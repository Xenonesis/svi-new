import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { PostgrestError } from '@supabase/supabase-js';
import type { AttendanceStatus } from '@/src/lib/supabase/types';

export type Team = {
  id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  created_at?: string;
};

export type AttendanceRecord = {
  id: string;
  team_id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  marked_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  created_at?: string;
};

export const attendanceRepository = {
  // ─── Teams ─────────────────────────────────────────────────────────

  /**
   * List all teams (with optional member counts).
   */
  async listTeams(): Promise<{
    data: Team[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('teams').select('*').order('created_at', { ascending: false });
  },

  /**
   * Get member counts for all teams (avoids N+1).
   */
  async getMemberCounts(): Promise<Map<string, number>> {
    const { data: allMembers } = await supabaseAdmin.from('team_members').select('team_id');
    const counts = new Map<string, number>();
    for (const m of allMembers || []) {
      counts.set(m.team_id, (counts.get(m.team_id) || 0) + 1);
    }
    return counts;
  },

  /**
   * Create a new team.
   */
  async createTeam(data: {
    name: string;
    description?: string | null;
    created_by: string;
  }): Promise<{
    data: Team | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('teams').insert(data).select().single();
  },

  /**
   * Get team name by ID.
   */
  async getTeamName(id: string): Promise<string> {
    const { data } = await supabaseAdmin.from('teams').select('name').eq('id', id).single();
    return data?.name || 'team';
  },

  // ─── Attendance Records ────────────────────────────────────────────

  /**
   * Get attendance records with optional filters.
   */
  async getRecords(
    opts: {
      teamId?: string | null;
      date?: string | null;
      from?: string | null;
      to?: string | null;
      limit?: number;
    } = {}
  ): Promise<{
    data: AttendanceRecord[] | null;
    error: PostgrestError | null;
  }> {
    const { teamId, date, from, to, limit = 500 } = opts;

    let query = supabaseAdmin
      .from('attendance_records')
      .select('*')
      .order('date', { ascending: false })
      .limit(Math.min(1000, Math.max(1, limit)));

    if (teamId) query = query.eq('team_id', teamId);
    if (date) query = query.eq('date', date);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    return query;
  },

  /**
   * Get attendance records with profile join (for formatted output).
   */
  async getRecordsWithProfiles(
    opts: {
      teamId?: string | null;
      date?: string | null;
      from?: string | null;
      to?: string | null;
      limit?: number;
    } = {}
  ): Promise<{
    data: any[] | null;
    error: PostgrestError | null;
  }> {
    const { teamId, date, from, to, limit = 500 } = opts;

    let query = supabaseAdmin
      .from('attendance_records')
      .select('*, profiles!inner(full_name, email)')
      .order('date', { ascending: false })
      .limit(Math.min(1000, Math.max(1, limit)));

    if (teamId) query = query.eq('team_id', teamId);
    if (date) query = query.eq('date', date);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);

    return query;
  },

  /**
   * Bulk upsert attendance records.
   */
  async upsertRecords(
    records: Array<{
      team_id: string;
      user_id: string;
      date: string;
      status: AttendanceStatus;
      notes?: string | null;
      marked_by: string;
    }>
  ): Promise<{
    data: AttendanceRecord[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('attendance_records')
      .upsert(records, { onConflict: 'team_id,user_id,date' })
      .select() as any;
  },

  // ─── Analytics ─────────────────────────────────────────────────────

  /**
   * Count records by status for a given date.
   */
  async countByStatus(date: string, status: string): Promise<number> {
    const { count } = await supabaseAdmin
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('date', date)
      .eq('status', status);
    return count || 0;
  },

  /**
   * Get records in a date range (for trend analysis).
   */
  async getByDateRange(
    from: string,
    to: string
  ): Promise<{
    data: Array<{ date: string; status: string }> | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('attendance_records')
      .select('date, status')
      .gte('date', from)
      .lte('date', to);
  },

  /**
   * Get report data (with profile join) for a date range.
   */
  async getReportData(opts: { teamId?: string | null; from: string; to?: string | null }): Promise<{
    data: any[] | null;
    error: PostgrestError | null;
  }> {
    let query = supabaseAdmin.from('attendance_records').select(`
      user_id,
      status,
      profiles!inner(full_name, email)
    `);

    if (opts.teamId) query = query.eq('team_id', opts.teamId);
    query = query.gte('date', opts.from);
    if (opts.to) query = query.lte('date', opts.to);

    return query;
  },
};
