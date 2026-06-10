import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type { PostgrestError } from '@supabase/supabase-js';

export type Lottery = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  prize?: string | null;
  draw_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ScheduledDraw = {
  id: string;
  lottery_id: string;
  scheduled_at: string;
  status: string;
  pre_notify_minutes?: number;
  show_countdown?: boolean;
  include_countdown_in_email?: boolean;
  created_at?: string;
};

export type LotteryParticipant = {
  id: string;
  lottery_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  ticket_number?: string | null;
  created_at?: string;
};

export const lotteryRepository = {
  // ─── Lotteries ─────────────────────────────────────────────────────

  /**
   * Get active lottery (for public countdown / display).
   */
  async getActive(): Promise<{
    data: Lottery | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('lotteries')
      .select('id, title')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as any;
  },

  /**
   * Get a lottery by ID with minimal fields.
   */
  async getById(id: string): Promise<{
    data: Lottery | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('lotteries').select('id, title, status').eq('id', id).single();
  },

  /**
   * List all lotteries (admin).
   */
  async listAll(): Promise<{
    data: Lottery[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('lotteries').select('*').order('created_at', { ascending: false });
  },

  // ─── Scheduled Draws ───────────────────────────────────────────────

  /**
   * Get a pending/reminder_sent schedule for a lottery.
   */
  async getSchedule(lotteryId: string): Promise<{
    data: ScheduledDraw | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('scheduled_draws')
      .select('*')
      .eq('lottery_id', lotteryId)
      .in('status', ['pending', 'reminder_sent'])
      .maybeSingle() as any;
  },

  /**
   * Get public schedule info (for countdown display).
   */
  async getPublicSchedule(lotteryId: string): Promise<{
    data: ScheduledDraw | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin
      .from('scheduled_draws')
      .select('id, scheduled_at, show_countdown, include_countdown_in_email, status')
      .eq('lottery_id', lotteryId)
      .in('status', ['pending', 'reminder_sent'])
      .eq('show_countdown', true)
      .maybeSingle() as any;
  },

  /**
   * Create a scheduled draw.
   */
  async createSchedule(data: {
    lottery_id: string;
    scheduled_at: string;
    pre_notify_minutes: number;
    show_countdown: boolean;
    include_countdown_in_email: boolean;
    status: string;
  }): Promise<{
    data: ScheduledDraw | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('scheduled_draws').insert(data).select().single() as any;
  },

  /**
   * Cancel pending schedules for a lottery.
   */
  async cancelSchedules(lotteryId: string): Promise<{
    error: PostgrestError | null;
  }> {
    const { error } = await supabaseAdmin
      .from('scheduled_draws')
      .update({ status: 'cancelled' })
      .eq('lottery_id', lotteryId)
      .in('status', ['pending', 'reminder_sent']);
    return { error };
  },

  /**
   * Get a lottery title for logging / notifications.
   */
  async getTitle(id: string): Promise<string> {
    const { data } = await supabaseAdmin.from('lotteries').select('title').eq('id', id).single();
    return data?.title || 'Unknown Lottery';
  },

  // ─── Participants ──────────────────────────────────────────────────

  /**
   * Get participants for a lottery.
   */
  async getParticipants(lotteryId: string): Promise<{
    data: LotteryParticipant[] | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('lottery_participants').select('*').eq('lottery_id', lotteryId);
  },

  /**
   * Add a participant to a lottery.
   */
  async addParticipant(data: Partial<LotteryParticipant>): Promise<{
    data: LotteryParticipant | null;
    error: PostgrestError | null;
  }> {
    return supabaseAdmin.from('lottery_participants').insert(data).select().single() as any;
  },
};
