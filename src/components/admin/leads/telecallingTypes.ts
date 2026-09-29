import type {
  AdvisorPerformanceMetric,
  CampaignPerformanceMetric,
} from '@/src/lib/types/telecalling';

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

export type SortField =
  'answered_calls' | 'total_calls' | 'answer_rate' | 'total_talk_time_sec' | 'hot_leads';

export type TimeRange = 'all' | 'today' | 'week' | 'month';

export function formatSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export interface CachedDashboardEntry {
  summary: DashboardSummary | null;
  leaderboard: AdvisorPerformanceMetric[];
  campaigns: CampaignPerformanceMetric[];
  lastUpdated: string;
  timestamp: number;
}
