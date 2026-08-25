export interface DashboardData {
  employee: {
    id: string;
    full_name: string;
    email: string;
    department?: string | null;
    role: string;
  };
  today: {
    date: string;
    punch_status: 'punched_in' | 'punched_out' | 'not_punched';
    punch_in_time: string | null;
    punch_out_time: string | null;
    total_hours: number | null;
    is_late: boolean;
  };
  metrics: {
    weekly_hours: number;
    pending_tasks: number;
    completed_tasks_today: number;
    assigned_leads: number;
    upcoming_site_visits: number;
  };
  urgent_tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string | null;
  }>;
  upcoming_site_visits: Array<{
    id: string;
    preferred_date: string;
    preferred_time?: string | null;
    status: string;
    location?: string | null;
    property?: { title: string; location?: string } | null;
    contact?: { full_name?: string; phone?: string } | null;
  }>;
  recent_leads: Array<{
    id: string;
    name: string;
    phone: string;
    lead_temperature: string;
    lead_status: string;
    created_at: string;
  }>;
}
