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
  milestone_name?: string;
  title?: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | string;
  paid_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AllotmentRecord {
  id: string;
  user_id?: string;
  profile_id?: string;
  property_id: string;
  unit_no?: string;
  unit_number?: string;
  status?: string;
  area?: number | string | null;
  total_cost?: number | null;
  booking_date?: string | null;
  allotted_date?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata?: {
    ticket_id?: string;
    ticketId?: string;
    area?: number | string | null;
    total_cost?: number | null;
    approved_by?: string;
    approved_at?: string;
    source?: string;
    [key: string]: any;
  } | null;
  profiles?: ProfileSummary | null;
  properties?: PropertySummary | null;
  payment_schedules?: PaymentScheduleItem[];
  receipts?: import('../payment-receipts/ReceiptTypes').SavedReceipt[];
}

export interface AllotmentFormData {
  profile_id: string;
  property_id: string;
  unit_number: string;
  area: string;
  total_cost: string;
  booking_date: string;
}

export interface PaymentMilestoneDraft {
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  paidDate?: string | null;
}

export interface AllotmentCandidate {
  ticketId: string;
  normalizedId: string;
  clientName: string;
  email: string;
  phone: string;
  projectName: string;
  propertyId: string | null;
  unitNo: string;
  area: string | number;
  totalCost: number;
  bookingDate: string;
  documentCount: number;
  sources: string[];
  paymentMilestones: PaymentMilestoneDraft[];
}
