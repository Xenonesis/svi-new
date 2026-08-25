export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  punch_in_time: string | null;
  punch_out_time: string | null;
  total_hours: number | null;
  is_late: boolean;
  is_geofence_verified: boolean;
  notes?: string | null;
}

export interface MonthlyStats {
  total_records: number;
  present_count: number;
  late_count: number;
  half_day_count: number;
  leave_count: number;
  total_hours_worked: number;
  avg_daily_hours: number;
}

export interface LeaveQuota {
  casual_total: number;
  sick_total: number;
  earned_total: number;
  casual_taken: number;
  sick_taken: number;
  earned_taken: number;
  unpaid_taken: number;
}

export interface LeaveRecord {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
}
