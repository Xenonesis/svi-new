-- Migration: Employee Salary Structures, Monthly Payrolls, and Payroll Items
-- Date: 2026-08-27
-- Description: End-to-end payroll management with attendance-linked calculations and admin-gated download controls.

-- ============================================================================
-- 1. Employee Salary Structures
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employee_salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,          -- Monthly Gross / CTC base
  basic_pay NUMERIC(12,2) NOT NULL DEFAULT 0,            -- ~50% of base
  hra NUMERIC(12,2) NOT NULL DEFAULT 0,                  -- ~30% of base (House Rent Allowance)
  special_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,    -- Balancing allowance
  conveyance_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  medical_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  pf_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,         -- Provident Fund employee share
  esi_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,        -- ESI employee share
  professional_tax NUMERIC(12,2) NOT NULL DEFAULT 200,   -- Standard PT
  tds NUMERIC(12,2) NOT NULL DEFAULT 0,                  -- Income tax deduction
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  pan_number TEXT,
  uan_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_employee_salary_structure UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_salary_structures_user ON public.employee_salary_structures(user_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS trg_salary_structures_updated_at ON public.employee_salary_structures;
CREATE TRIGGER trg_salary_structures_updated_at
  BEFORE UPDATE ON public.employee_salary_structures
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS
ALTER TABLE public.employee_salary_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all salary structures" ON public.employee_salary_structures;
CREATE POLICY "Admins can manage all salary structures"
  ON public.employee_salary_structures FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees can view their own salary structure" ON public.employee_salary_structures;
CREATE POLICY "Employees can view their own salary structure"
  ON public.employee_salary_structures FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Service role full access salary structures" ON public.employee_salary_structures;
CREATE POLICY "Service role full access salary structures"
  ON public.employee_salary_structures FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- 2. Monthly Payrolls (Payroll Header Run per month)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL,                               -- 'YYYY-MM' (e.g. '2026-08')
  title TEXT NOT NULL,                                   -- 'Payroll August 2026'
  total_employees INTEGER NOT NULL DEFAULT 0,
  total_gross_payout NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_net_payout NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'completed')),
  allow_payslip_download BOOLEAN NOT NULL DEFAULT false, -- Master admin toggle for the month
  processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_monthly_payrolls_month UNIQUE (month_year)
);

CREATE INDEX IF NOT EXISTS idx_monthly_payrolls_month ON public.monthly_payrolls(month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_payrolls_status ON public.monthly_payrolls(status);

DROP TRIGGER IF EXISTS trg_monthly_payrolls_updated_at ON public.monthly_payrolls;
CREATE TRIGGER trg_monthly_payrolls_updated_at
  BEFORE UPDATE ON public.monthly_payrolls
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.monthly_payrolls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage monthly payrolls" ON public.monthly_payrolls;
CREATE POLICY "Admins can manage monthly payrolls"
  ON public.monthly_payrolls FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Service role full access monthly payrolls" ON public.monthly_payrolls;
CREATE POLICY "Service role full access monthly payrolls"
  ON public.monthly_payrolls FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================================================
-- 3. Payroll Items (Per Employee Monthly Payslip & Attendance Breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES public.monthly_payrolls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  
  -- Attendance Metrics
  total_month_days INTEGER NOT NULL DEFAULT 30,
  working_days INTEGER NOT NULL DEFAULT 26,
  present_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  half_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  paid_leaves NUMERIC(5,2) NOT NULL DEFAULT 0,
  absent_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  lop_days NUMERIC(5,2) NOT NULL DEFAULT 0,              -- Loss of Pay days
  
  -- Salary Breakdown
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  basic_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra NUMERIC(12,2) NOT NULL DEFAULT 0,
  special_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  conveyance_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  medical_allowance NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Deductions & Adjustments
  lop_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,         -- (Gross / total_month_days) * lop_days
  pf_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  esi_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  professional_tax NUMERIC(12,2) NOT NULL DEFAULT 200,
  tds NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  incentive_bonus NUMERIC(12,2) NOT NULL DEFAULT 0,      -- Sales incentive or performance bonus
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,           -- Gross - Deductions + Incentive
  
  -- Status & Gating Flags
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'hold')),
  payment_mode TEXT DEFAULT 'bank_transfer',
  payment_date TIMESTAMPTZ,
  transaction_reference TEXT,
  remarks TEXT,
  
  -- Admin Download Permission Control (Per-employee switch)
  is_download_allowed BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payroll_items_user_month UNIQUE (payroll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_user ON public.payroll_items(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_payroll ON public.payroll_items(payroll_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_month ON public.payroll_items(month_year);

DROP TRIGGER IF EXISTS trg_payroll_items_updated_at ON public.payroll_items;
CREATE TRIGGER trg_payroll_items_updated_at
  BEFORE UPDATE ON public.payroll_items
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all payroll items" ON public.payroll_items;
CREATE POLICY "Admins can manage all payroll items"
  ON public.payroll_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Employee can only read their own payroll item when admin has permitted it!
DROP POLICY IF EXISTS "Employees can view own released payroll items" ON public.payroll_items;
CREATE POLICY "Employees can view own released payroll items"
  ON public.payroll_items FOR SELECT
  USING (
    public.is_admin() OR 
    (
      auth.uid() = user_id AND 
      (
        is_download_allowed = true OR 
        EXISTS (
          SELECT 1 FROM public.monthly_payrolls mp 
          WHERE mp.id = payroll_items.payroll_id 
          AND mp.allow_payslip_download = true
        )
      )
    )
  );

DROP POLICY IF EXISTS "Service role full access payroll items" ON public.payroll_items;
CREATE POLICY "Service role full access payroll items"
  ON public.payroll_items FOR ALL
  USING (auth.role() = 'service_role');
