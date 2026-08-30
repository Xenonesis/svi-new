export interface TimesheetRecord {
  id: string;
  team_id: string;
  team_name: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'pending';
  notes?: string | null;
  punch_in_time?: string | null;
  punch_out_time?: string | null;
  total_hours?: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  punch_out_geofence_verified: boolean;
  geofence_distance_meters?: number | null;
  full_name: string;
  email: string;
  work_log: {
    summary: string | null;
    client_calls: number;
    site_visits: number;
  };
}

export interface TimesheetMetrics {
  total: number;
  present: number;
  late: number;
  halfDay: number;
  leave: number;
  absent: number;
  totalCalls: number;
  totalVisits: number;
  totalHours: string;
  presentRate: string | number;
  lateRate: string | number;
}
