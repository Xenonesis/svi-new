export interface ProfileSummary {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface PropertySummary {
  id: string;
  name: string;
  active?: boolean;
}

export interface PaymentScheduleItem {
  id: string;
  allotment_id?: string;
  milestone_name: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | string;
  paid_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AllotmentRecord {
  id: string;
  profile_id: string;
  property_id: string;
  unit_number: string;
  area: number | string | null;
  total_cost: number | null;
  booking_date: string | null;
  created_at?: string;
  updated_at?: string;
  profiles?: ProfileSummary | null;
  properties?: PropertySummary | null;
  payment_schedules?: PaymentScheduleItem[];
}

export interface AllotmentFormData {
  profile_id: string;
  property_id: string;
  unit_number: string;
  area: string;
  total_cost: string;
  booking_date: string;
}
