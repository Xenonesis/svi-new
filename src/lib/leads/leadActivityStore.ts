import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface LeadActivity {
  id: string;
  lead_id: string;
  employee_id?: string | null;
  employee_name?: string | null;
  activity_type:
    | 'lead_created'
    | 'status_change'
    | 'note_added'
    | 'call_logged'
    | 'followup_scheduled'
    | 'temperature_change';
  title: string;
  notes?: string | null;
  follow_up_at?: string | null;
  created_at: string;
}

export interface CreateLeadActivityInput {
  lead_id: string;
  employee_id?: string | null;
  employee_name?: string | null;
  activity_type: LeadActivity['activity_type'];
  title: string;
  notes?: string | null;
  follow_up_at?: string | null;
}

// Fallback in-memory / portal_settings cache if DB table is initializing
const memoryActivities: LeadActivity[] = [];

export const leadActivityStore = {
  /**
   * Log an activity or interaction for a lead
   */
  async recordActivity(input: CreateLeadActivityInput): Promise<LeadActivity> {
    const activityId = crypto.randomUUID();
    const newActivity: LeadActivity = {
      id: activityId,
      lead_id: input.lead_id,
      employee_id: input.employee_id || null,
      employee_name: input.employee_name || null,
      activity_type: input.activity_type,
      title: input.title,
      notes: input.notes || null,
      follow_up_at: input.follow_up_at || null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('lead_activities')
        .insert({
          id: newActivity.id,
          lead_id: newActivity.lead_id,
          employee_id: newActivity.employee_id,
          employee_name: newActivity.employee_name,
          activity_type: newActivity.activity_type,
          title: newActivity.title,
          notes: newActivity.notes,
          follow_up_at: newActivity.follow_up_at,
          created_at: newActivity.created_at,
        })
        .select()
        .single();

      if (!error && data) {
        return data as LeadActivity;
      }
    } catch {
      // Table might not exist yet; fall through to resilient fallback
    }

    // Resilient fallback
    memoryActivities.unshift(newActivity);
    try {
      const key = `lead_activities_${input.lead_id}`;
      const { data: existing } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', key)
        .single();

      const list: LeadActivity[] = Array.isArray(existing?.value) ? existing.value : [];
      list.unshift(newActivity);

      await supabaseAdmin.from('portal_settings').upsert({
        key,
        value: list.slice(0, 100),
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Keep in memory if even portal_settings fails
    }

    return newActivity;
  },

  /**
   * Fetch chronological activities for a specific lead
   */
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as LeadActivity[];
      }
    } catch {
      // Fallback
    }

    // Try fallback from portal_settings
    try {
      const key = `lead_activities_${leadId}`;
      const { data: existing } = await supabaseAdmin
        .from('portal_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (existing?.value && Array.isArray(existing.value)) {
        return existing.value as LeadActivity[];
      }
    } catch {
      // Memory fallback
    }

    return memoryActivities.filter((a) => a.lead_id === leadId);
  },

  /**
   * Fetch all activities for leads managed by an employee
   */
  async getEmployeeActivities(employeeId: string): Promise<LeadActivity[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('lead_activities')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as LeadActivity[];
      }
    } catch {
      // Fallback
    }

    return memoryActivities.filter((a) => a.employee_id === employeeId);
  },

  /**
   * Notify Admin about a new lead created by an employee
   */
  async notifyAdminOnNewLead(data: {
    leadId: string;
    clientName: string;
    phone: string;
    employeeName: string;
    employeeId: string;
    projectInterest?: string | null;
    followUpAt?: string | null;
  }) {
    try {
      // Find all admin user IDs
      const { data: adminProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!adminProfiles || adminProfiles.length === 0) return;

      const formattedFollowUp = data.followUpAt
        ? new Date(data.followUpAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : null;

      const notifications = adminProfiles.map((admin) => ({
        user_id: admin.id,
        title: `📌 New Lead: ${data.clientName} (${data.employeeName})`,
        message: `Employee ${data.employeeName} added a new lead for ${data.projectInterest || 'general enquiry'}. Phone: ${data.phone}${formattedFollowUp ? ` | Follow-up: ${formattedFollowUp}` : ''}`,
        type: 'info',
        is_read: false,
        action_url: `/admin/employees?employee=${data.employeeId}&tab=leads`,
        metadata: {
          event: 'new_employee_lead',
          lead_id: data.leadId,
          employee_id: data.employeeId,
          employee_name: data.employeeName,
          client_name: data.clientName,
          phone: data.phone,
          follow_up_at: data.followUpAt,
        },
      }));

      await supabaseAdmin.from('notifications').insert(notifications);
    } catch (err) {
      console.error('Failed to dispatch admin notification for new lead:', err);
    }
  },

  /**
   * Notify Admin about a scheduled or rescheduled client follow-up
   */
  async notifyAdminOnFollowup(data: {
    leadId: string;
    clientName: string;
    employeeName: string;
    employeeId: string;
    followUpAt: string;
    projectInterest?: string | null;
    notes?: string | null;
  }) {
    try {
      const { data: adminProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (!adminProfiles || adminProfiles.length === 0) return;

      const formattedFollowUp = new Date(data.followUpAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const notifications = adminProfiles.map((admin) => ({
        user_id: admin.id,
        title: `🔔 Lead Follow-up: ${data.clientName}`,
        message: `${data.employeeName} scheduled client follow-up for ${formattedFollowUp}.${data.notes ? ` Notes: "${data.notes}"` : ''}`,
        type: 'alert',
        is_read: false,
        action_url: `/admin/employees?employee=${data.employeeId}&tab=leads`,
        metadata: {
          event: 'lead_followup_scheduled',
          lead_id: data.leadId,
          employee_id: data.employeeId,
          employee_name: data.employeeName,
          client_name: data.clientName,
          follow_up_at: data.followUpAt,
          notes: data.notes,
        },
      }));

      await supabaseAdmin.from('notifications').insert(notifications);
    } catch (err) {
      console.error('Failed to dispatch admin notification for follow-up:', err);
    }
  },
};
