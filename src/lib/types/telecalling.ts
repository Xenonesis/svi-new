export interface AdvisorPerformanceMetric {
  advisor_id: string;
  advisor_name: string;
  phone?: string | null;
  role?: string | null;
  is_active?: boolean;
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

export type TimeRange = 'all' | 'today' | 'week' | 'month';
export type SortField =
  | 'answered_calls'
  | 'total_calls'
  | 'answer_rate'
  | 'total_talk_time_sec'
  | 'hot_leads';

export interface DashboardSummary {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  answer_rate: number;
  total_talk_time_sec: number;
  avg_talk_time_sec: number;
  hot_leads: number;
  key1_count: number;
  active_advisors: number;
  total_roster_count: number;
}

export function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
