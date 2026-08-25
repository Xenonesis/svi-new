export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'general' | 'client_followup' | 'site_visit' | 'documentation' | 'field_work';
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface SiteVisitItem {
  id: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  preferred_date?: string | null;
  confirmed_date?: string | null;
  notes?: string | null;
  contact?: {
    name?: string;
    phone?: string;
  };
  conversation?: {
    project_id?: string;
  };
  created_at: string;
}

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  project_interest?: string | null;
  lead_source?: string | null;
  lead_status: string;
  lifecycle_status: string;
  lead_temperature?: string | null;
  summary?: string | null;
  created_at: string;
}

export interface WorkLogItem {
  id: string;
  date: string;
  summary_text: string;
  client_interactions_count: number;
  site_visits_conducted_count: number;
  created_at: string;
}

export type WorkTabType = 'tasks' | 'site-visits' | 'leads' | 'logs';
