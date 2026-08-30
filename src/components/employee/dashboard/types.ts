export interface DashboardData {
  employee: {
    id: string;
    full_name?: string;
    name?: string;
    email: string;
    department?: string | null;
    role: string;
    designation?: string | null;
  };
  today: {
    date: string;
    punch_status: 'punched_in' | 'punched_out' | 'not_punched';
    punch_in_time: string | null;
    punch_out_time: string | null;
    total_hours: number | null;
    is_late: boolean;
    is_geofence_verified?: boolean;
    geofence_distance_meters?: number | null;
    summary?: string | null;
  };
  metrics: {
    weekly_hours: number;
    hours_logged_this_week?: number;
    pending_tasks: number;
    pending_tasks_count?: number;
    completed_tasks_today: number;
    assigned_leads: number;
    pending_leads_count?: number;
    upcoming_site_visits: number;
    active_site_visits_count?: number;
    days_present_this_week?: number;
    on_time_streak?: number;
  };
  leaves?: {
    casual_remaining: number;
    sick_remaining: number;
    earned_remaining: number;
    total_remaining: number;
  };
  urgent_tasks: Array<{
    id: string;
    title: string;
    description?: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string | null;
    category?: string;
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
  recent_activities?: Array<{
    id: string;
    type: 'punch_in' | 'punch_out' | 'task_completed' | 'site_visit' | 'work_log';
    title: string;
    description: string;
    time: string;
  }>;
  geofence_locations?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
  }>;
}
