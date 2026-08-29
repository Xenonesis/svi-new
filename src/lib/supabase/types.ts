export type UserRole = 'admin' | 'client' | 'employee';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  property_interest: string | null;
  role: UserRole;
  created_at: string;
  created_by: string | null;
  notes: string | null;
  real_email?: string | null;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  property_interest?: string;
  notes?: string;
  real_email?: string;
}

// ── Attendance System ────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  added_at: string;
  // Joined fields (from API, not in DB)
  full_name?: string;
  email?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'pending';

export interface AttendanceRecord {
  id: string;
  team_id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
  // Punch-in/out fields
  punch_in_time: string | null;
  punch_out_time: string | null;
  check_in_lat: number | null;
  check_in_lon: number | null;
  punch_out_lat: number | null;
  punch_out_lon: number | null;
  is_geofence_verified: boolean;
  punch_out_geofence_verified: boolean;
  geofence_distance_meters: number | null;
  is_late: boolean;
  total_hours: number | null;
  // Joined fields (from API)
  full_name?: string;
  email?: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
}

export interface MarkAttendancePayload {
  records: Array<{
    team_id: string;
    user_id: string;
    date: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

export interface AttendanceReportRow {
  user_id: string;
  full_name: string;
  email: string;
  present: number;
  absent: number;
  half_day: number;
  leave: number;
  total_days: number;
  attendance_percentage: number;
}

// ── Punch System ─────────────────────────────────────────────

export interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface AttendanceSettingsMap {
  punch_in_start: string; // "09:00" - Shift window start
  punch_in_late_after: string; // "09:15" - Late grace cutoff (punches after this are marked Late)
  punch_in_cutoff: string; // "10:30" - Half-day cutoff (punches after this count as Half Day)
  punch_out_start: string; // "17:00" - Shift standard end
  punch_out_end: string; // "21:00" - Max allowed punch out
  min_hours_half_day: number; // 4.0 - Minimum hours for Half Day (50% salary)
  min_hours_full_day: number; // 8.0 - Minimum hours for Full Day (100% salary)
  geofence_radius_meters: number; // 200
}

export type EmployeePunchStatus = 'not_punched' | 'punched_in' | 'punched_out';

export interface EmployeeLiveStatus {
  user_id: string;
  full_name: string;
  email: string;
  status: EmployeePunchStatus;
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  punch_out_geofence_verified: boolean;
}
