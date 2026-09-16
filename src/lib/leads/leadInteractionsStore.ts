import { supabaseAdmin } from '@/src/lib/supabase/admin';

export type LeadInteractionType =
  | 'note'
  | 'call_logged'
  | 'follow_up_scheduled'
  | 'whatsapp_sent'
  | 'visit_booked'
  | 'stage_changed'
  | 'reassigned';

export interface LeadInteraction {
  id: string;
  lead_phone: string;
  advisor_id?: string | null;
  advisor_name?: string | null;
  type: LeadInteractionType;
  content: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface CreateInteractionInput {
  lead_phone: string;
  advisor_id?: string | null;
  advisor_name?: string | null;
  type: LeadInteractionType;
  content: string;
  metadata?: Record<string, unknown> | null;
}

// In-memory fallback
const memoryInteractions: LeadInteraction[] = [];

export const leadInteractionsStore = {
  /**
   * Record a new interaction for a lead phone
   */
  async recordInteraction(input: CreateInteractionInput): Promise<LeadInteraction> {
    const cleanPhone = input.lead_phone.replace(/\D/g, '').slice(-10);
    const newInteraction: LeadInteraction = {
      id: crypto.randomUUID(),
      lead_phone: cleanPhone,
      advisor_id: input.advisor_id || null,
      advisor_name: input.advisor_name || null,
      type: input.type,
      content: input.content,
      metadata: input.metadata || {},
      created_at: new Date().toISOString(),
    };

    // 1. Try DB table insert
    try {
      const { data, error } = await supabaseAdmin
        .from('lead_interactions')
        .insert({
          id: newInteraction.id,
          lead_phone: newInteraction.lead_phone,
          advisor_id: newInteraction.advisor_id,
          advisor_name: newInteraction.advisor_name,
          type: newInteraction.type,
          content: newInteraction.content,
          metadata: newInteraction.metadata,
          created_at: newInteraction.created_at,
        })
        .select()
        .single();

      if (!error && data) {
        // Sync with chat_leads table fields if relevant
        await this.syncLeadAttributes(cleanPhone, input);
        return data as LeadInteraction;
      }
    } catch {
      // Table may still be provisioning; fall through to resilient fallback
    }

    // 2. Resilient fallback via portal_settings
    memoryInteractions.unshift(newInteraction);
    try {
      const key = `lead_interactions_${cleanPhone}`;
      const { data: existing } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', key)
        .single();

      const list: LeadInteraction[] = Array.isArray(existing?.value) ? existing.value : [];
      list.unshift(newInteraction);

      await supabaseAdmin.from('portal_settings').upsert({
        key,
        value: list.slice(0, 100),
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Retained in memoryInteractions
    }

    await this.syncLeadAttributes(cleanPhone, input);
    return newInteraction;
  },

  /**
   * Helper to sync chat_leads table when note, follow-up, or stage changes
   */
  async syncLeadAttributes(cleanPhone: string, input: CreateInteractionInput): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.type === 'note') {
        updates.notes = input.content;
      } else if (input.type === 'follow_up_scheduled' && input.metadata?.follow_up_at) {
        updates.follow_up_at = input.metadata.follow_up_at;
      } else if (input.type === 'stage_changed' && input.metadata?.stage) {
        updates.pipeline_stage = input.metadata.stage;
      } else if (input.type === 'visit_booked' && input.metadata?.site_visit_at) {
        updates.site_visit_at = input.metadata.site_visit_at;
        if (input.metadata.site_visit_project) {
          updates.site_visit_project = input.metadata.site_visit_project;
        }
      } else if (input.type === 'reassigned' && input.advisor_id) {
        updates.assigned_to = input.advisor_id;
      }

      await supabaseAdmin
        .from('chat_leads')
        .update(updates)
        .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`);
    } catch {
      // Best-effort sync
    }
  },

  /**
   * Fetch all interactions for a phone number
   */
  async getInteractions(leadPhone: string): Promise<LeadInteraction[]> {
    const cleanPhone = leadPhone.replace(/\D/g, '').slice(-10);

    // 1. Try DB table
    try {
      const phoneCandidates = [cleanPhone, `+91${cleanPhone}`, `91${cleanPhone}`];
      const { data, error } = await supabaseAdmin
        .from('lead_interactions')
        .select('*')
        .in('lead_phone', phoneCandidates)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as LeadInteraction[];
      }
    } catch {
      // Fall through to fallback
    }

    // 2. Try portal_settings fallback
    try {
      const key = `lead_interactions_${cleanPhone}`;
      const { data: existing } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (Array.isArray(existing?.value) && existing.value.length > 0) {
        return existing.value as LeadInteraction[];
      }
    } catch {
      // Fall through to memory
    }

    // 3. In-memory
    return memoryInteractions.filter((i) => i.lead_phone.includes(cleanPhone));
  },
};
