import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { calculateLeadTemperature } from '@/src/lib/leads/ivrParser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface IvrRecordItem {
  id: string;
  customer_phone: string;
  agent_name: string;
  agent_phone?: string | null;
  assigned_agent_id?: string | null;
  assigned_agent?: {
    id: string;
    full_name: string;
    phone?: string | null;
  } | null;
  dial_time: string;
  customer_ans_time?: string | null;
  customer_hang_time?: string | null;
  call_duration: number;
  dial_status: 'ANSWER' | 'NOANSWER';
  pressed_key?: string | null;
  temperature: 'hot' | 'warm' | 'cold';
  campaign_name: string;
  created_at: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const offset = (page - 1) * limit;

    const advisorId = searchParams.get('advisor_id');
    const dialStatus = searchParams.get('dial_status'); // 'ANSWER', 'NOANSWER', or 'all'
    const temperature = searchParams.get('temperature'); // 'hot', 'warm', 'cold', or 'all'
    const q = searchParams.get('q')?.trim();

    // 1. Try querying ivr_call_records with join on profiles
    let query = supabaseAdmin
      .from('ivr_call_records')
      .select('*, assigned_agent:assigned_agent_id(id, full_name, phone)', { count: 'exact' });

    if (advisorId && advisorId !== 'all') {
      query = query.eq('assigned_agent_id', advisorId);
    }
    if (dialStatus && dialStatus !== 'all') {
      query = query.eq('dial_status', dialStatus.toUpperCase());
    }
    if (q) {
      query = query.or(`customer_phone.ilike.%${q}%,agent_name.ilike.%${q}%`);
    }

    query = query.order('dial_time', { ascending: false }).range(offset, offset + limit - 1);

    const { data: recordsData, error, count } = await query;

    // If query failed or table not ready, try fallback from chat_leads
    if (error) {
      console.warn('ivr_call_records query fallback to chat_leads:', error.message);
      let fallbackQuery = supabaseAdmin
        .from('chat_leads')
        .select('*, assigned_agent:assigned_to(id, full_name, phone)', { count: 'exact' })
        .eq('source', 'ivr');

      if (advisorId && advisorId !== 'all') {
        fallbackQuery = fallbackQuery.eq('assigned_to', advisorId);
      }
      if (temperature && temperature !== 'all') {
        fallbackQuery = fallbackQuery.eq('temperature', temperature);
      }
      if (q) {
        fallbackQuery = fallbackQuery.or(`phone.ilike.%${q}%,name.ilike.%${q}%`);
      }

      const { data: fallbackData, count: fallbackCount } = await fallbackQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const items: IvrRecordItem[] = (fallbackData || []).map(
        (fb: {
          id: string;
          phone: string;
          created_at: string;
          temperature?: 'hot' | 'warm' | 'cold' | null;
          assigned_agent?: { id: string; full_name: string; phone?: string | null } | null;
          notes?: string | null;
        }) => {
          // Parse dial status from notes if present
          const isAnswer = fb.notes?.includes('ANSWER') && !fb.notes?.includes('NOANSWER');
          const status: 'ANSWER' | 'NOANSWER' = isAnswer ? 'ANSWER' : 'NOANSWER';

          return {
            id: fb.id,
            customer_phone: fb.phone,
            agent_name: fb.assigned_agent?.full_name || 'Assigned Agent',
            assigned_agent_id: fb.assigned_agent?.id,
            assigned_agent: fb.assigned_agent,
            dial_time: fb.created_at,
            call_duration: 30,
            dial_status: status,
            pressed_key: null,
            temperature: fb.temperature || 'warm',
            campaign_name: 'IVR Campaign',
            created_at: fb.created_at,
          };
        }
      );

      return NextResponse.json({
        records: items,
        total_count: fallbackCount || 0,
        page,
        limit,
        summary: {
          total_calls: fallbackCount || 0,
          answered_calls: 0,
          missed_calls: fallbackCount || 0,
          hot_count: 0,
          warm_count: 0,
          cold_count: 0,
        },
      });
    }

    const rawRecords = recordsData || [];
    let items: IvrRecordItem[] = rawRecords.map(
      (r: {
        id: string;
        customer_phone: string;
        agent_name: string;
        agent_phone?: string | null;
        assigned_agent_id?: string | null;
        assigned_agent?: { id: string; full_name: string; phone?: string | null } | null;
        dial_time: string;
        customer_ans_time?: string | null;
        customer_hang_time?: string | null;
        call_duration: number;
        dial_status: string;
        pressed_key?: string | null;
        campaign_name?: string | null;
        created_at: string;
      }) => {
        const temp = calculateLeadTemperature(r.call_duration || 0, r.pressed_key);
        const status: 'ANSWER' | 'NOANSWER' = r.dial_status === 'ANSWER' ? 'ANSWER' : 'NOANSWER';

        return {
          id: r.id,
          customer_phone: r.customer_phone,
          agent_name: r.agent_name,
          agent_phone: r.agent_phone,
          assigned_agent_id: r.assigned_agent_id,
          assigned_agent: r.assigned_agent,
          dial_time: r.dial_time,
          customer_ans_time: r.customer_ans_time,
          customer_hang_time: r.customer_hang_time,
          call_duration: r.call_duration || 0,
          dial_status: status,
          pressed_key: r.pressed_key,
          temperature: temp,
          campaign_name: r.campaign_name || 'General Campaign',
          created_at: r.created_at,
        };
      }
    );

    if (temperature && temperature !== 'all') {
      items = items.filter((item) => item.temperature === temperature);
    }

    return NextResponse.json({
      records: items,
      total_count: count || items.length,
      page,
      limit,
      summary: {
        total_calls: count || items.length,
        answered_calls: items.filter((i) => i.dial_status === 'ANSWER').length,
        missed_calls: items.filter((i) => i.dial_status === 'NOANSWER').length,
        hot_count: items.filter((i) => i.temperature === 'hot').length,
        warm_count: items.filter((i) => i.temperature === 'warm').length,
        cold_count: items.filter((i) => i.temperature === 'cold').length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const { id, customer_phone, temperature, assigned_agent_id } = body;

    if (!id && !customer_phone) {
      throw AppError.badRequest('Missing record id or customer_phone');
    }

    // 1. Update in ivr_call_records if id provided
    if (id) {
      const updateData: Record<string, unknown> = {};
      if (assigned_agent_id !== undefined) updateData.assigned_agent_id = assigned_agent_id;
      await supabaseAdmin.from('ivr_call_records').update(updateData).eq('id', id);
    }

    // 2. Synchronize temperature and assignment to chat_leads
    if (customer_phone) {
      const leadUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (temperature) leadUpdate.temperature = temperature;
      if (assigned_agent_id !== undefined) leadUpdate.assigned_to = assigned_agent_id;

      await supabaseAdmin
        .from('chat_leads')
        .update(leadUpdate)
        .eq('phone', customer_phone)
        .eq('source', 'ivr');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
