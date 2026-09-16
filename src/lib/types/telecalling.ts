export interface AdvisorPerformanceMetric {
  advisor_id: string;
  advisor_name: string;
  phone?: string | null;
  role?: string | null;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  answer_rate: number;
  total_talk_time_sec: number;
  avg_talk_time_sec: number;
  hot_leads: number;
  site_visits_booked: number;
  key1_count: number;
}

export interface CampaignPerformanceMetric {
  name: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  answer_rate: number;
  hot_leads: number;
}
