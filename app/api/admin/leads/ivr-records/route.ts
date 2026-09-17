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
    const rawLimit = parseInt(searchParams.get('limit') || '25', 10);
    const limit = Math.min(50000, Math.max(1, isNaN(rawLimit) ? 25 : rawLimit));
    const offset = (page - 1) * limit;

    const advisorId = searchParams.get('advisor_id');
    const dialStatus = searchParams.get('dial_status'); // 'ANSWER', 'NOANSWER', or 'all'
    const temperature = searchParams.get('temperature'); // 'hot', 'warm', 'cold', or 'all'
    const date = searchParams.get('date'); // 'YYYY-MM-DD' or ISO prefix
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const q = searchParams.get('q')?.trim();
    const pressedKey = searchParams.get('pressed_key'); // '1', 'none', or specific key
    const minDuration = searchParams.get('min_duration'); // in seconds
    const maxDuration = searchParams.get('max_duration'); // in seconds
    const campaignName = searchParams.get('campaign_name');
    const sortBy = searchParams.get('sort_by') || 'dial_time'; // 'dial_time', 'call_duration', 'customer_phone', 'agent_name'
    const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false;

    // 1. Construct database query factory with push-down filters
    let advisorName: string | null = null;
    if (advisorId && advisorId !== 'all') {
      const { data: advProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', advisorId)
        .maybeSingle();
      advisorName = advProfile?.full_name?.trim() || null;
    }

    const validSortColumns: Record<string, string> = {
      dial_time: 'dial_time',
      call_duration: 'call_duration',
      customer_phone: 'customer_phone',
      agent_name: 'agent_name',
      created_at: 'created_at',
    };
    const sortColumn = validSortColumns[sortBy] || 'dial_time';

    const createBaseQuery = () => {
      let qBuilder = supabaseAdmin
        .from('ivr_call_records')
        .select('*, assigned_agent:assigned_agent_id(id, full_name, phone)', { count: 'exact' });

      if (advisorId && advisorId !== 'all') {
        if (advisorName) {
          qBuilder = qBuilder.or(
            `assigned_agent_id.eq.${advisorId},agent_name.ilike.%${advisorName}%`
          );
        } else {
          qBuilder = qBuilder.eq('assigned_agent_id', advisorId);
        }
      }
      if (dialStatus && dialStatus !== 'all') {
        qBuilder = qBuilder.eq('dial_status', dialStatus.toUpperCase());
      }
      if (q) {
        qBuilder = qBuilder.or(`customer_phone.ilike.%${q}%,agent_name.ilike.%${q}%`);
      }
      if (date) {
        qBuilder = qBuilder
          .gte('dial_time', `${date}T00:00:00.000Z`)
          .lte('dial_time', `${date}T23:59:59.999Z`);
      } else {
        if (startDate) {
          qBuilder = qBuilder.gte(
            'dial_time',
            startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`
          );
        }
        if (endDate) {
          qBuilder = qBuilder.lte(
            'dial_time',
            endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`
          );
        }
      }

      // Push down temperature filters to PostgreSQL query so pagination is 100% accurate
      if (temperature === 'hot') {
        qBuilder = qBuilder.or('call_duration.gte.60,pressed_key.eq.1');
      } else if (temperature === 'warm') {
        qBuilder = qBuilder
          .gte('call_duration', 20)
          .lt('call_duration', 60)
          .neq('pressed_key', '1')
          .eq('dial_status', 'ANSWER');
      } else if (temperature === 'cold') {
        qBuilder = qBuilder.or(
          'dial_status.eq.NOANSWER,and(call_duration.lt.20,pressed_key.neq.1)'
        );
      }
      if (pressedKey && pressedKey !== 'all') {
        if (pressedKey === 'none') {
          qBuilder = qBuilder.is('pressed_key', null);
        } else {
          qBuilder = qBuilder.eq('pressed_key', pressedKey);
        }
      }
      if (minDuration) {
        const minSec = parseInt(minDuration, 10);
        if (!isNaN(minSec)) qBuilder = qBuilder.gte('call_duration', minSec);
      }
      if (maxDuration) {
        const maxSec = parseInt(maxDuration, 10);
        if (!isNaN(maxSec)) qBuilder = qBuilder.lte('call_duration', maxSec);
      }
      if (campaignName && campaignName !== 'all') {
        qBuilder = qBuilder.ilike('campaign_name', `%${campaignName}%`);
      }

      return qBuilder.order(sortColumn, { ascending: sortOrder });
    };
    // Fetch records and summary concurrently
    const advisorUuid = advisorId && advisorId !== 'all' ? advisorId : null;
    let perfRpcResult: unknown = null;
    try {
      const rpcRes = await supabaseAdmin.rpc('get_telecalling_performance', {
        p_time_cutoff: null,
        p_advisor_id: advisorUuid,
      });
      perfRpcResult = rpcRes.data;
    } catch {
      // Fall back gracefully
    }

    let recordsData: Record<string, unknown>[] = [];
    let error: { message: string } | null = null;
    let count: number | null = null;

    // PostgREST limits single responses to 1,000 rows (max_rows = 1000 in Supabase).
    // If limit <= 1000, perform standard single range query.
    // If limit > 1000 (e.g. exporting full dataset of 5,000 or 15,000 rows), batch-fetch in parallel chunks of 1,000.
    if (limit <= 1000) {
      const singleRes = await createBaseQuery().range(offset, offset + limit - 1);
      recordsData = singleRes.data || [];
      error = singleRes.error;
      count = singleRes.count;
    } else {
      // 1. Probe total matching count with head query using a fresh query builder
      const countRes = await createBaseQuery().range(offset, offset);
      error = countRes.error;
      count = countRes.count;

      const totalAvailable = count ?? 0;
      const totalToFetch = Math.min(limit, Math.max(0, totalAvailable - offset));

      if (!error && totalToFetch > 0) {
        const CHUNK_SIZE = 1000;
        const chunkCount = Math.ceil(totalToFetch / CHUNK_SIZE);

        // Fetch all 1000-row chunks in parallel with a fresh builder instance per chunk
        const chunkPromises = Array.from({ length: chunkCount }, (_, idx) => {
          const chunkStart = offset + idx * CHUNK_SIZE;
          const chunkEnd = Math.min(offset + totalToFetch - 1, chunkStart + CHUNK_SIZE - 1);
          return createBaseQuery().range(chunkStart, chunkEnd);
        });

        const chunkResults = await Promise.all(chunkPromises);
        for (const res of chunkResults) {
          if (res.error) {
            error = res.error;
            break;
          }
          if (res.data) {
            recordsData.push(...res.data);
          }
        }
      } else if (!error && totalToFetch === 0) {
        recordsData = [];
      }
    }
    // Fallback if ivr_call_records is not yet populated
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
    const items: IvrRecordItem[] = (
      rawRecords as unknown as Array<{
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
      }>
    ).map((r) => {
      const status: 'ANSWER' | 'NOANSWER' = r.dial_status === 'ANSWER' ? 'ANSWER' : 'NOANSWER';
      const temp = calculateLeadTemperature(r.call_duration || 0, r.pressed_key);
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
    });

    // Accurate campaign-wide summary
    const rpcSummary = (perfRpcResult as { summary?: Record<string, number> } | null)?.summary;
    let summary: {
      total_calls: number;
      answered_calls: number;
      missed_calls: number;
      hot_count: number;
      warm_count: number;
      cold_count: number;
    };

    if (rpcSummary && rpcSummary.total_calls !== undefined) {
      summary = {
        total_calls: rpcSummary.total_calls || count || 0,
        answered_calls: rpcSummary.answered_calls || 0,
        missed_calls: rpcSummary.missed_calls || 0,
        hot_count: rpcSummary.hot_leads || 0,
        warm_count: Math.max(0, (rpcSummary.answered_calls || 0) - (rpcSummary.hot_leads || 0)),
        cold_count: rpcSummary.missed_calls || 0,
      };
    } else {
      // Execute fast HEAD count queries across the whole campaign scope (not just 25 rows on page)
      let ansQuery = supabaseAdmin
        .from('ivr_call_records')
        .select('*', { count: 'exact', head: true })
        .eq('dial_status', 'ANSWER');
      let noansQuery = supabaseAdmin
        .from('ivr_call_records')
        .select('*', { count: 'exact', head: true })
        .eq('dial_status', 'NOANSWER');
      let hotLeadQuery = supabaseAdmin
        .from('ivr_call_records')
        .select('*', { count: 'exact', head: true })
        .or('call_duration.gte.60,pressed_key.eq.1');
      let totalScopeQuery = supabaseAdmin
        .from('ivr_call_records')
        .select('*', { count: 'exact', head: true });

      if (advisorId && advisorId !== 'all') {
        if (advisorName) {
          const advOr = `assigned_agent_id.eq.${advisorId},agent_name.ilike.%${advisorName}%`;
          ansQuery = ansQuery.or(advOr);
          noansQuery = noansQuery.or(advOr);
          hotLeadQuery = hotLeadQuery.or(advOr);
          totalScopeQuery = totalScopeQuery.or(advOr);
        } else {
          ansQuery = ansQuery.eq('assigned_agent_id', advisorId);
          noansQuery = noansQuery.eq('assigned_agent_id', advisorId);
          hotLeadQuery = hotLeadQuery.eq('assigned_agent_id', advisorId);
          totalScopeQuery = totalScopeQuery.eq('assigned_agent_id', advisorId);
        }
      }

      const [totalScopeRes, ansRes, noansRes, hotRes] = await Promise.all([
        totalScopeQuery,
        ansQuery,
        noansQuery,
        hotLeadQuery,
      ]);
      const ansCount = ansRes.count || 0;
      const noansCount = noansRes.count || 0;
      const hotCount = hotRes.count || 0;
      const scopeTotal = totalScopeRes.count || ansCount + noansCount;

      summary = {
        total_calls: scopeTotal,
        answered_calls: ansCount,
        missed_calls: noansCount,
        hot_count: hotCount,
        warm_count: Math.max(0, ansCount - hotCount),
        cold_count: noansCount,
      };
    }
    return NextResponse.json({
      records: items,
      total_count: count !== null && count !== undefined ? count : items.length,
      page,
      limit,
      summary,
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
      const cleanPhone = customer_phone.replace(/\D/g, '').slice(-10);
      const leadUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (temperature) leadUpdate.temperature = temperature;
      if (assigned_agent_id !== undefined) leadUpdate.assigned_to = assigned_agent_id;

      await supabaseAdmin
        .from('chat_leads')
        .update(leadUpdate)
        .eq('phone', cleanPhone)
        .eq('source', 'ivr');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
