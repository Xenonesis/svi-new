export type UserRole = 'admin' | 'client';

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

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

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
