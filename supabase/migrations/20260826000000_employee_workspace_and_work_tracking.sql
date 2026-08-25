-- ============================================================
-- Migration: Employee Workspace, Tasks, Work Logs, Leaves & Regularization
-- ============================================================

-- 1. Employee Daily Tasks / To-Dos Table
CREATE TABLE IF NOT EXISTS public.employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'client_followup', 'site_visit', 'documentation', 'field_work')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for tasks
CREATE INDEX IF NOT EXISTS idx_employee_tasks_user_id ON public.employee_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_status ON public.employee_tasks(status);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_due_date ON public.employee_tasks(due_date);

-- Trigger for employee_tasks updated_at
DROP TRIGGER IF EXISTS employee_tasks_updated_at ON public.employee_tasks;
CREATE TRIGGER employee_tasks_updated_at
  BEFORE UPDATE ON public.employee_tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS for employee_tasks
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view their own tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Employees can insert their own tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Employees can update their own tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Employees can delete their own tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Admins have full access to employee_tasks" ON public.employee_tasks;
DROP POLICY IF EXISTS "Service role full access employee_tasks" ON public.employee_tasks;

CREATE POLICY "Employees can view their own tasks"
  ON public.employee_tasks FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can insert their own tasks"
  ON public.employee_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can update their own tasks"
  ON public.employee_tasks FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can delete their own tasks"
  ON public.employee_tasks FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Service role full access employee_tasks"
  ON public.employee_tasks FOR ALL
  USING (auth.role() = 'service_role');


-- 2. Employee Daily Work Logs / Shift Summary Table
CREATE TABLE IF NOT EXISTS public.employee_work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  tasks_completed TEXT[] DEFAULT '{}',
  client_interactions_count INT DEFAULT 0,
  site_visits_conducted_count INT DEFAULT 0,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for work logs
CREATE INDEX IF NOT EXISTS idx_employee_work_logs_user_date ON public.employee_work_logs(user_id, date);

-- RLS for employee_work_logs
ALTER TABLE public.employee_work_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view their own work logs" ON public.employee_work_logs;
DROP POLICY IF EXISTS "Employees can insert their own work logs" ON public.employee_work_logs;
DROP POLICY IF EXISTS "Admins have full access to employee_work_logs" ON public.employee_work_logs;
DROP POLICY IF EXISTS "Service role full access employee_work_logs" ON public.employee_work_logs;

CREATE POLICY "Employees can view their own work logs"
  ON public.employee_work_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can insert their own work logs"
  ON public.employee_work_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Service role full access employee_work_logs"
  ON public.employee_work_logs FOR ALL
  USING (auth.role() = 'service_role');


-- 3. Employee Leave Requests Table
CREATE TABLE IF NOT EXISTS public.employee_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid', 'half_day')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(4, 1) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for leaves
CREATE INDEX IF NOT EXISTS idx_employee_leaves_user_id ON public.employee_leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_leaves_status ON public.employee_leaves(status);

-- Trigger for employee_leaves updated_at
DROP TRIGGER IF EXISTS employee_leaves_updated_at ON public.employee_leaves;
CREATE TRIGGER employee_leaves_updated_at
  BEFORE UPDATE ON public.employee_leaves
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS for employee_leaves
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view their own leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "Employees can insert their own leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "Employees can cancel pending leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "Admins can update leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "Service role full access employee_leaves" ON public.employee_leaves;

CREATE POLICY "Employees can view their own leaves"
  ON public.employee_leaves FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can insert their own leaves"
  ON public.employee_leaves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can cancel pending leaves"
  ON public.employee_leaves FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Admins can update leaves"
  ON public.employee_leaves FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Service role full access employee_leaves"
  ON public.employee_leaves FOR ALL
  USING (auth.role() = 'service_role');


-- 4. Attendance Regularization Requests (Missed Punch Request)
CREATE TABLE IF NOT EXISTS public.attendance_regularizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('punch_in', 'punch_out', 'full_day')),
  suggested_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for regularizations
CREATE INDEX IF NOT EXISTS idx_attendance_regularizations_user_id ON public.attendance_regularizations(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_regularizations_status ON public.attendance_regularizations(status);

-- RLS for attendance_regularizations
ALTER TABLE public.attendance_regularizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view their own regularizations" ON public.attendance_regularizations;
DROP POLICY IF EXISTS "Employees can insert their own regularizations" ON public.attendance_regularizations;
DROP POLICY IF EXISTS "Admins can update regularizations" ON public.attendance_regularizations;
DROP POLICY IF EXISTS "Service role full access attendance_regularizations" ON public.attendance_regularizations;

CREATE POLICY "Employees can view their own regularizations"
  ON public.attendance_regularizations FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Employees can insert their own regularizations"
  ON public.attendance_regularizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update regularizations"
  ON public.attendance_regularizations FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Service role full access attendance_regularizations"
  ON public.attendance_regularizations FOR ALL
  USING (auth.role() = 'service_role');
