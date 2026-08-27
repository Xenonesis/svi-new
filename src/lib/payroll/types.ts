export interface SalaryStructure {
  id: string;
  user_id: string;
  base_salary: number;
  basic_pay: number;
  hra: number;
  special_allowance: number;
  conveyance_allowance: number;
  medical_allowance: number;
  pf_deduction: number;
  esi_deduction: number;
  professional_tax: number;
  tds: number;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  pan_number?: string | null;
  uan_number?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  employee_name?: string;
  employee_email?: string;
  employee_department?: string | null;
}

export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'completed';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'hold';

export interface MonthlyPayroll {
  id: string;
  month_year: string; // 'YYYY-MM'
  title: string;
  total_employees: number;
  total_gross_payout: number;
  total_net_payout: number;
  total_deductions: number;
  status: PayrollStatus;
  allow_payslip_download: boolean;
  processed_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
  id: string;
  payroll_id: string;
  user_id: string;
  month_year: string;

  // Enriched employee details
  employee_name?: string;
  employee_email?: string;
  employee_department?: string | null;
  employee_phone?: string | null;

  // Attendance Metrics
  total_month_days: number;
  working_days: number;
  present_days: number;
  half_days: number;
  paid_leaves: number;
  absent_days: number;
  lop_days: number;

  // Salary Breakdown
  base_salary: number;
  basic_pay: number;
  hra: number;
  special_allowance: number;
  conveyance_allowance: number;
  medical_allowance: number;
  gross_earnings: number;

  // Deductions & Adjustments
  lop_deduction: number;
  pf_deduction: number;
  esi_deduction: number;
  professional_tax: number;
  tds: number;
  advance_deduction: number;
  other_deductions: number;
  incentive_bonus: number;
  total_deductions: number;
  net_salary: number;

  // Payment Status & Gating
  payment_status: PaymentStatus;
  payment_mode?: string;
  payment_date?: string | null;
  transaction_reference?: string | null;
  remarks?: string | null;
  is_download_allowed: boolean;
  download_count: number;

  // Bank Info snapshot
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  pan_number?: string | null;
  uan_number?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface CalculatePayrollPayload {
  month_year: string; // 'YYYY-MM'
  total_month_days?: number;
  working_days?: number;
}
