export interface AttendanceStatusResponse {
  user_id?: string;
  full_name?: string;
  email?: string;
  team_name?: string;
  status: 'not_punched' | 'punched_in' | 'punched_out';
  record_status?: 'present' | 'half_day' | 'absent' | 'leave' | 'pending' | null;
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  notes?: string | null;
  summary_text?: string | null;
  client_interactions_count?: number;
  site_visits_conducted_count?: number;
}

export interface AttendanceSettings {
  punch_in_start: string;
  punch_in_late_after: string;
  punch_in_cutoff: string;
  punch_out_start: string;
  punch_out_end: string;
  min_hours_half_day: number;
  min_hours_full_day: number;
  geofence_radius_meters: number;
}

export interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}
