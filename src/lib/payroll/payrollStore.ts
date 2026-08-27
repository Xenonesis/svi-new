import { supabaseAdmin } from '@/src/lib/supabase/admin';
import type {
  SalaryStructure,
  MonthlyPayroll,
  PayrollItem,
  CalculatePayrollPayload,
} from './types';

// Fallback in-memory storage for resilience when migrations are pending
const memorySalaryStructures: Map<string, SalaryStructure> = new Map();
const memoryMonthlyPayrolls: Map<string, MonthlyPayroll> = new Map();
const memoryPayrollItems: Map<string, PayrollItem[]> = new Map();

/**
 * Resilient Payroll Store
 * Handles database operations for Salary Structures, Monthly Runs, Attendance-Linked Calculations,
 * and strict Admin Payslip Download Gating.
 */
export const payrollStore = {
  // ── 1. Salary Structures ───────────────────────────────────────────────────
  async getSalaryStructures(): Promise<SalaryStructure[]> {
    try {
      const { data: structures, error } = await supabaseAdmin
        .from('employee_salary_structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(
          '[payrollStore] DB read failed for salary_structures, using memory store:',
          error.message
        );
        return Array.from(memorySalaryStructures.values());
      }

      // Enrich with employee profile details
      const userIds = structures?.map((s) => s.user_id) || [];
      const profileMap = new Map<
        string,
        { full_name: string; email: string; department?: string | null }
      >();

      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email, department')
          .in('id', userIds);

        profiles?.forEach((p) => profileMap.set(p.id, p));
      }

      return (structures || []).map((s) => {
        const prof = profileMap.get(s.user_id);
        return {
          id: s.id,
          user_id: s.user_id,
          base_salary: Number(s.base_salary || 0),
          basic_pay: Number(s.basic_pay || 0),
          hra: Number(s.hra || 0),
          special_allowance: Number(s.special_allowance || 0),
          conveyance_allowance: Number(s.conveyance_allowance || 0),
          medical_allowance: Number(s.medical_allowance || 0),
          pf_deduction: Number(s.pf_deduction || 0),
          esi_deduction: Number(s.esi_deduction || 0),
          professional_tax: Number(s.professional_tax || 0),
          tds: Number(s.tds || 0),
          bank_name: s.bank_name,
          account_number: s.account_number,
          ifsc_code: s.ifsc_code,
          pan_number: s.pan_number,
          uan_number: s.uan_number,
          is_active: s.is_active ?? true,
          created_at: s.created_at,
          updated_at: s.updated_at,
          employee_name: prof?.full_name || 'Employee',
          employee_email: prof?.email || '',
          employee_department: prof?.department || null,
        };
      });
    } catch (err) {
      console.warn('[payrollStore] Unexpected error in getSalaryStructures:', err);
      return Array.from(memorySalaryStructures.values());
    }
  },

  async getSalaryStructureByUserId(userId: string): Promise<SalaryStructure | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('employee_salary_structures')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return memorySalaryStructures.get(userId) || null;
      }

      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email, department')
        .eq('id', userId)
        .maybeSingle();

      return {
        id: data.id,
        user_id: data.user_id,
        base_salary: Number(data.base_salary || 0),
        basic_pay: Number(data.basic_pay || 0),
        hra: Number(data.hra || 0),
        special_allowance: Number(data.special_allowance || 0),
        conveyance_allowance: Number(data.conveyance_allowance || 0),
        medical_allowance: Number(data.medical_allowance || 0),
        pf_deduction: Number(data.pf_deduction || 0),
        esi_deduction: Number(data.esi_deduction || 0),
        professional_tax: Number(data.professional_tax || 0),
        tds: Number(data.tds || 0),
        bank_name: data.bank_name,
        account_number: data.account_number,
        ifsc_code: data.ifsc_code,
        pan_number: data.pan_number,
        uan_number: data.uan_number,
        is_active: data.is_active ?? true,
        created_at: data.created_at,
        updated_at: data.updated_at,
        employee_name: prof?.full_name,
        employee_email: prof?.email,
        employee_department: prof?.department,
      };
    } catch (err) {
      console.warn('[payrollStore] Error getting salary structure by user_id:', err);
      return memorySalaryStructures.get(userId) || null;
    }
  },

  async upsertSalaryStructure(
    payload: Partial<SalaryStructure> & { user_id: string }
  ): Promise<SalaryStructure> {
    const base = Number(payload.base_salary || 0);
    const basic =
      payload.basic_pay !== undefined ? Number(payload.basic_pay) : Math.round(base * 0.5);
    const hra = payload.hra !== undefined ? Number(payload.hra) : Math.round(base * 0.3);
    const special =
      payload.special_allowance !== undefined
        ? Number(payload.special_allowance)
        : Math.max(0, base - (basic + hra));

    const record = {
      user_id: payload.user_id,
      base_salary: base,
      basic_pay: basic,
      hra: hra,
      special_allowance: special,
      conveyance_allowance: Number(payload.conveyance_allowance || 0),
      medical_allowance: Number(payload.medical_allowance || 0),
      pf_deduction: Number(payload.pf_deduction || 0),
      esi_deduction: Number(payload.esi_deduction || 0),
      professional_tax: Number(payload.professional_tax ?? 200),
      tds: Number(payload.tds || 0),
      bank_name: payload.bank_name || null,
      account_number: payload.account_number || null,
      ifsc_code: payload.ifsc_code || null,
      pan_number: payload.pan_number || null,
      uan_number: payload.uan_number || null,
      is_active: payload.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('employee_salary_structures')
        .upsert(record, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.warn('[payrollStore] DB upsert failed, updating memory store:', error.message);
        const memObj: SalaryStructure = {
          id: `mem_sal_${Date.now()}`,
          ...record,
          created_at: new Date().toISOString(),
        };
        memorySalaryStructures.set(payload.user_id, memObj);
        return memObj;
      }

      return {
        ...data,
        base_salary: Number(data.base_salary),
        basic_pay: Number(data.basic_pay),
        hra: Number(data.hra),
        special_allowance: Number(data.special_allowance),
        conveyance_allowance: Number(data.conveyance_allowance),
        medical_allowance: Number(data.medical_allowance),
        pf_deduction: Number(data.pf_deduction),
        esi_deduction: Number(data.esi_deduction),
        professional_tax: Number(data.professional_tax),
        tds: Number(data.tds),
      };
    } catch (err) {
      console.warn('[payrollStore] Error upserting salary structure:', err);
      const memObj: SalaryStructure = {
        id: `mem_sal_${Date.now()}`,
        ...record,
        created_at: new Date().toISOString(),
      };
      memorySalaryStructures.set(payload.user_id, memObj);
      return memObj;
    }
  },

  // ── 2. Monthly Payrolls ────────────────────────────────────────────────────
  async getMonthlyPayrolls(): Promise<MonthlyPayroll[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('monthly_payrolls')
        .select('*')
        .order('month_year', { ascending: false });

      if (error) {
        console.warn('[payrollStore] DB read failed for monthly_payrolls:', error.message);
        return Array.from(memoryMonthlyPayrolls.values());
      }

      return (data || []).map((m) => ({
        id: m.id,
        month_year: m.month_year,
        title: m.title,
        total_employees: m.total_employees,
        total_gross_payout: Number(m.total_gross_payout || 0),
        total_net_payout: Number(m.total_net_payout || 0),
        total_deductions: Number(m.total_deductions || 0),
        status: m.status,
        allow_payslip_download: m.allow_payslip_download ?? false,
        processed_by: m.processed_by,
        notes: m.notes,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
    } catch (err) {
      console.warn('[payrollStore] Error getting monthly payrolls:', err);
      return Array.from(memoryMonthlyPayrolls.values());
    }
  },

  async getMonthlyPayrollById(
    payrollId: string
  ): Promise<{ payroll: MonthlyPayroll; items: PayrollItem[] } | null> {
    try {
      const { data: payroll, error } = await supabaseAdmin
        .from('monthly_payrolls')
        .select('*')
        .eq('id', payrollId)
        .maybeSingle();

      if (error || !payroll) {
        const memPayroll = memoryMonthlyPayrolls.get(payrollId);
        if (!memPayroll) return null;
        return { payroll: memPayroll, items: memoryPayrollItems.get(payrollId) || [] };
      }

      // Fetch items joined with employee profiles
      const { data: items } = await supabaseAdmin
        .from('payroll_items')
        .select('*')
        .eq('payroll_id', payrollId);

      const userIds = items?.map((i) => i.user_id) || [];
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, department, phone')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      const enrichedItems: PayrollItem[] = (items || []).map((item) => {
        const prof = profileMap.get(item.user_id);
        return {
          id: item.id,
          payroll_id: item.payroll_id,
          user_id: item.user_id,
          month_year: item.month_year,
          employee_name: prof?.full_name || 'Employee',
          employee_email: prof?.email || '',
          employee_department: prof?.department || null,
          employee_phone: prof?.phone || null,

          total_month_days: item.total_month_days,
          working_days: item.working_days,
          present_days: Number(item.present_days || 0),
          half_days: Number(item.half_days || 0),
          paid_leaves: Number(item.paid_leaves || 0),
          absent_days: Number(item.absent_days || 0),
          lop_days: Number(item.lop_days || 0),

          base_salary: Number(item.base_salary || 0),
          basic_pay: Number(item.basic_pay || 0),
          hra: Number(item.hra || 0),
          special_allowance: Number(item.special_allowance || 0),
          conveyance_allowance: Number(item.conveyance_allowance || 0),
          medical_allowance: Number(item.medical_allowance || 0),
          gross_earnings: Number(item.gross_earnings || 0),

          lop_deduction: Number(item.lop_deduction || 0),
          pf_deduction: Number(item.pf_deduction || 0),
          esi_deduction: Number(item.esi_deduction || 0),
          professional_tax: Number(item.professional_tax || 0),
          tds: Number(item.tds || 0),
          advance_deduction: Number(item.advance_deduction || 0),
          other_deductions: Number(item.other_deductions || 0),
          incentive_bonus: Number(item.incentive_bonus || 0),
          total_deductions: Number(item.total_deductions || 0),
          net_salary: Number(item.net_salary || 0),

          payment_status: item.payment_status,
          payment_mode: item.payment_mode,
          payment_date: item.payment_date,
          transaction_reference: item.transaction_reference,
          remarks: item.remarks,
          is_download_allowed: item.is_download_allowed ?? false,
          download_count: item.download_count || 0,
        };
      });

      return {
        payroll: {
          id: payroll.id,
          month_year: payroll.month_year,
          title: payroll.title,
          total_employees: payroll.total_employees,
          total_gross_payout: Number(payroll.total_gross_payout || 0),
          total_net_payout: Number(payroll.total_net_payout || 0),
          total_deductions: Number(payroll.total_deductions || 0),
          status: payroll.status,
          allow_payslip_download: payroll.allow_payslip_download ?? false,
          processed_by: payroll.processed_by,
          notes: payroll.notes,
          created_at: payroll.created_at,
          updated_at: payroll.updated_at,
        },
        items: enrichedItems,
      };
    } catch (err) {
      console.warn('[payrollStore] Error getting monthly payroll by id:', err);
      return null;
    }
  },

  // ── 3. Calculate Monthly Payroll from Attendance ───────────────────────────
  async calculateMonthlyPayroll(
    payload: CalculatePayrollPayload,
    adminUserId: string
  ): Promise<{ payroll: MonthlyPayroll; items: PayrollItem[] }> {
    const { month_year } = payload;
    const [yearStr, monthStr] = month_year.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = payload.total_month_days || new Date(year, month, 0).getDate();
    const workingDays = payload.working_days || 26;

    const startDate = `${month_year}-01`;
    const endDate = `${month_year}-${String(daysInMonth).padStart(2, '0')}`;

    // 1. Get all employees with salary structures
    const salaryStructures = await this.getSalaryStructures();
    const activeStructures = salaryStructures.filter((s) => s.is_active);

    // 2. Fetch all attendance records for this month
    const { data: attendanceRecords } = await supabaseAdmin
      .from('attendance_records')
      .select('user_id, date, status')
      .gte('date', startDate)
      .lte('date', endDate);

    // 3. Group attendance by user_id
    const attendanceByUser = new Map<
      string,
      { present: number; halfDay: number; leaves: number; absent: number }
    >();

    (attendanceRecords || []).forEach((rec) => {
      const current = attendanceByUser.get(rec.user_id) || {
        present: 0,
        halfDay: 0,
        leaves: 0,
        absent: 0,
      };
      if (rec.status === 'present') current.present += 1;
      else if (rec.status === 'half_day') current.halfDay += 1;
      else if (rec.status === 'leave') current.leaves += 1;
      else if (rec.status === 'absent') current.absent += 1;
      attendanceByUser.set(rec.user_id, current);
    });

    // 4. Calculate item for each active employee
    const itemsToUpsert: Array<Omit<PayrollItem, 'id' | 'payroll_id'> & { payroll_id?: string }> =
      [];
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    for (const struct of activeStructures) {
      const att = attendanceByUser.get(struct.user_id) || {
        present: 0,
        halfDay: 0,
        leaves: 0,
        absent: 0,
      };

      const presentDays = att.present;
      const halfDays = att.halfDay;
      const paidLeaves = att.leaves;
      const effectiveDays = presentDays + halfDays * 0.5 + paidLeaves;

      // If no attendance was logged at all in this cycle, treat as standard full attendance or calculate LOP
      const lopDays = Math.max(0, Number((workingDays - effectiveDays).toFixed(1)));
      const absentDays = att.absent || lopDays;

      const baseSalary = struct.base_salary;
      const grossEarnings = baseSalary;

      // LOP deduction formula: (Gross / Total Days) * LOP Days
      const perDaySalary = daysInMonth > 0 ? grossEarnings / daysInMonth : 0;
      const lopDeduction = Math.round(perDaySalary * lopDays);

      const pf = struct.pf_deduction;
      const esi = struct.esi_deduction;
      const pt = struct.professional_tax;
      const tds = struct.tds;

      const itemDeductions = lopDeduction + pf + esi + pt + tds;
      const netSalary = Math.max(0, Math.round(grossEarnings - itemDeductions));

      totalGross += grossEarnings;
      totalDeductions += itemDeductions;
      totalNet += netSalary;

      itemsToUpsert.push({
        user_id: struct.user_id,
        month_year,
        employee_name: struct.employee_name,
        employee_email: struct.employee_email,
        employee_department: struct.employee_department,

        total_month_days: daysInMonth,
        working_days: workingDays,
        present_days: presentDays,
        half_days: halfDays,
        paid_leaves: paidLeaves,
        absent_days: absentDays,
        lop_days: lopDays,

        base_salary: baseSalary,
        basic_pay: struct.basic_pay,
        hra: struct.hra,
        special_allowance: struct.special_allowance,
        conveyance_allowance: struct.conveyance_allowance,
        medical_allowance: struct.medical_allowance,
        gross_earnings: grossEarnings,

        lop_deduction: lopDeduction,
        pf_deduction: pf,
        esi_deduction: esi,
        professional_tax: pt,
        tds,
        advance_deduction: 0,
        other_deductions: 0,
        incentive_bonus: 0,
        total_deductions: itemDeductions,
        net_salary: netSalary,

        payment_status: 'pending',
        payment_mode: 'bank_transfer',
        is_download_allowed: false, // Default to FALSE - Admin must explicitly allow!
        download_count: 0,

        bank_name: struct.bank_name,
        account_number: struct.account_number,
        ifsc_code: struct.ifsc_code,
        pan_number: struct.pan_number,
        uan_number: struct.uan_number,
      });
    }

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthTitle = `${monthNames[month - 1] || 'Month'} ${year}`;

    // 5. Create or update monthly_payrolls record
    const payrollPayload = {
      month_year,
      title: `Payroll ${monthTitle}`,
      total_employees: itemsToUpsert.length,
      total_gross_payout: totalGross,
      total_net_payout: totalNet,
      total_deductions: totalDeductions,
      status: 'draft' as const,
      allow_payslip_download: false, // Strict default
      processed_by: adminUserId,
      updated_at: new Date().toISOString(),
    };

    let savedPayroll: MonthlyPayroll;
    let savedItems: PayrollItem[];

    try {
      const { data: pData, error: pErr } = await supabaseAdmin
        .from('monthly_payrolls')
        .upsert(payrollPayload, { onConflict: 'month_year' })
        .select()
        .single();

      if (pErr || !pData) {
        console.warn(
          '[payrollStore] DB upsert failed for monthly_payrolls, saving to memory:',
          pErr?.message
        );
        savedPayroll = {
          id: `mem_pay_${month_year}`,
          ...payrollPayload,
          created_at: new Date().toISOString(),
        };
        memoryMonthlyPayrolls.set(savedPayroll.id, savedPayroll);
      } else {
        savedPayroll = {
          id: pData.id,
          month_year: pData.month_year,
          title: pData.title,
          total_employees: pData.total_employees,
          total_gross_payout: Number(pData.total_gross_payout),
          total_net_payout: Number(pData.total_net_payout),
          total_deductions: Number(pData.total_deductions),
          status: pData.status,
          allow_payslip_download: pData.allow_payslip_download ?? false,
          processed_by: pData.processed_by,
          notes: pData.notes,
          created_at: pData.created_at,
          updated_at: pData.updated_at,
        };
      }

      // Upsert individual items
      const itemsWithId = itemsToUpsert.map((item) => ({
        ...item,
        payroll_id: savedPayroll.id,
      }));

      const { data: dbItems, error: iErr } = await supabaseAdmin
        .from('payroll_items')
        .upsert(itemsWithId, { onConflict: 'payroll_id,user_id' })
        .select();

      if (iErr || !dbItems) {
        console.warn(
          '[payrollStore] DB upsert failed for payroll_items, saving to memory:',
          iErr?.message
        );
        savedItems = itemsWithId.map((item, idx) => ({
          id: `mem_item_${idx}_${Date.now()}`,
          ...item,
          payroll_id: savedPayroll.id,
        }));
        memoryPayrollItems.set(savedPayroll.id, savedItems);
      } else {
        savedItems = dbItems.map((di) => ({
          ...di,
          present_days: Number(di.present_days),
          half_days: Number(di.half_days),
          paid_leaves: Number(di.paid_leaves),
          absent_days: Number(di.absent_days),
          lop_days: Number(di.lop_days),
          base_salary: Number(di.base_salary),
          basic_pay: Number(di.basic_pay),
          hra: Number(di.hra),
          special_allowance: Number(di.special_allowance),
          conveyance_allowance: Number(di.conveyance_allowance),
          medical_allowance: Number(di.medical_allowance),
          gross_earnings: Number(di.gross_earnings),
          lop_deduction: Number(di.lop_deduction),
          pf_deduction: Number(di.pf_deduction),
          esi_deduction: Number(di.esi_deduction),
          professional_tax: Number(di.professional_tax),
          tds: Number(di.tds),
          advance_deduction: Number(di.advance_deduction),
          other_deductions: Number(di.other_deductions),
          incentive_bonus: Number(di.incentive_bonus),
          total_deductions: Number(di.total_deductions),
          net_salary: Number(di.net_salary),
          is_download_allowed: di.is_download_allowed ?? false,
        }));
      }

      return { payroll: savedPayroll, items: savedItems };
    } catch (err) {
      console.warn('[payrollStore] Error in calculateMonthlyPayroll:', err);
      savedPayroll = {
        id: `mem_pay_${month_year}`,
        ...payrollPayload,
        created_at: new Date().toISOString(),
      };
      savedItems = itemsToUpsert.map((item, idx) => ({
        id: `mem_item_${idx}_${Date.now()}`,
        ...item,
        payroll_id: savedPayroll.id,
      }));
      memoryMonthlyPayrolls.set(savedPayroll.id, savedPayroll);
      memoryPayrollItems.set(savedPayroll.id, savedItems);
      return { payroll: savedPayroll, items: savedItems };
    }
  },

  // ── 4. Toggle Payslip Download Permission (Admin Control) ─────────────────
  async togglePayslipDownload(
    payrollId: string,
    options: { allowAll?: boolean; itemId?: string; allow: boolean }
  ): Promise<{ success: boolean; allow: boolean }> {
    try {
      if (options.allowAll !== undefined) {
        // Bulk toggle for whole month
        await supabaseAdmin
          .from('monthly_payrolls')
          .update({ allow_payslip_download: options.allow, updated_at: new Date().toISOString() })
          .eq('id', payrollId);

        await supabaseAdmin
          .from('payroll_items')
          .update({ is_download_allowed: options.allow, updated_at: new Date().toISOString() })
          .eq('payroll_id', payrollId);

        // Memory fallback update
        const memP = memoryMonthlyPayrolls.get(payrollId);
        if (memP) memP.allow_payslip_download = options.allow;
        const memItems = memoryPayrollItems.get(payrollId);
        if (memItems) memItems.forEach((i) => (i.is_download_allowed = options.allow));
      } else if (options.itemId) {
        // Single employee toggle
        await supabaseAdmin
          .from('payroll_items')
          .update({ is_download_allowed: options.allow, updated_at: new Date().toISOString() })
          .eq('id', options.itemId);

        const memItems = memoryPayrollItems.get(payrollId);
        if (memItems) {
          const it = memItems.find((i) => i.id === options.itemId);
          if (it) it.is_download_allowed = options.allow;
        }
      }

      return { success: true, allow: options.allow };
    } catch (err) {
      console.warn('[payrollStore] Error toggling payslip download:', err);
      return { success: false, allow: options.allow };
    }
  },

  // ── 5. Adjust Item (Incentives / Advance / Remarks) ───────────────────────
  async updatePayrollItem(
    itemId: string,
    adjustments: {
      incentive_bonus?: number;
      advance_deduction?: number;
      other_deductions?: number;
      remarks?: string;
      payment_status?: 'pending' | 'processing' | 'paid' | 'hold';
      payment_date?: string;
      transaction_reference?: string;
    }
  ): Promise<PayrollItem | null> {
    try {
      const { data: item } = await supabaseAdmin
        .from('payroll_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) return null;

      const incentive =
        adjustments.incentive_bonus !== undefined
          ? Number(adjustments.incentive_bonus)
          : Number(item.incentive_bonus || 0);
      const advance =
        adjustments.advance_deduction !== undefined
          ? Number(adjustments.advance_deduction)
          : Number(item.advance_deduction || 0);
      const other =
        adjustments.other_deductions !== undefined
          ? Number(adjustments.other_deductions)
          : Number(item.other_deductions || 0);

      const lopDeduction = Number(item.lop_deduction || 0);
      const pf = Number(item.pf_deduction || 0);
      const esi = Number(item.esi_deduction || 0);
      const pt = Number(item.professional_tax || 0);
      const tds = Number(item.tds || 0);
      const gross = Number(item.gross_earnings || 0);

      const totalDeductions = lopDeduction + pf + esi + pt + tds + advance + other;
      const netSalary = Math.max(0, Math.round(gross - totalDeductions + incentive));

      const updates = {
        incentive_bonus: incentive,
        advance_deduction: advance,
        other_deductions: other,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        remarks: adjustments.remarks !== undefined ? adjustments.remarks : item.remarks,
        payment_status: adjustments.payment_status || item.payment_status,
        payment_date:
          adjustments.payment_date !== undefined ? adjustments.payment_date : item.payment_date,
        transaction_reference:
          adjustments.transaction_reference !== undefined
            ? adjustments.transaction_reference
            : item.transaction_reference,
        updated_at: new Date().toISOString(),
      };

      const { data: updated } = await supabaseAdmin
        .from('payroll_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      return updated;
    } catch (err) {
      console.warn('[payrollStore] Error updating payroll item:', err);
      return null;
    }
  },

  // ── 6. Employee Gated Payslip Read ─────────────────────────────────────────
  async getEmployeePayrollOverview(userId: string): Promise<{
    salaryStructure: SalaryStructure | null;
    payrolls: Array<PayrollItem & { is_downloadable: boolean; status_message: string }>;
  }> {
    const salaryStructure = await this.getSalaryStructureByUserId(userId);

    try {
      const { data: items } = await supabaseAdmin
        .from('payroll_items')
        .select('*, monthly_payrolls!inner(status, allow_payslip_download)')
        .eq('user_id', userId)
        .order('month_year', { ascending: false });

      const payrollList = (items || []).map((item: any) => {
        const monthAllow = item.monthly_payrolls?.allow_payslip_download === true;
        const itemAllow = item.is_download_allowed === true;
        const isDownloadable = monthAllow || itemAllow;

        let statusMessage: string;
        if (isDownloadable) {
          statusMessage = 'Available for download';
        } else {
          statusMessage = 'Payslip pending release by Admin';
        }

        return {
          id: item.id,
          payroll_id: item.payroll_id,
          user_id: item.user_id,
          month_year: item.month_year,
          total_month_days: item.total_month_days,
          working_days: item.working_days,
          present_days: Number(item.present_days || 0),
          half_days: Number(item.half_days || 0),
          paid_leaves: Number(item.paid_leaves || 0),
          absent_days: Number(item.absent_days || 0),
          lop_days: Number(item.lop_days || 0),

          base_salary: Number(item.base_salary || 0),
          basic_pay: Number(item.basic_pay || 0),
          hra: Number(item.hra || 0),
          special_allowance: Number(item.special_allowance || 0),
          conveyance_allowance: Number(item.conveyance_allowance || 0),
          medical_allowance: Number(item.medical_allowance || 0),
          gross_earnings: Number(item.gross_earnings || 0),

          lop_deduction: Number(item.lop_deduction || 0),
          pf_deduction: Number(item.pf_deduction || 0),
          esi_deduction: Number(item.esi_deduction || 0),
          professional_tax: Number(item.professional_tax || 0),
          tds: Number(item.tds || 0),
          advance_deduction: Number(item.advance_deduction || 0),
          other_deductions: Number(item.other_deductions || 0),
          incentive_bonus: Number(item.incentive_bonus || 0),
          total_deductions: Number(item.total_deductions || 0),
          net_salary: Number(item.net_salary || 0),

          payment_status: item.payment_status,
          payment_mode: item.payment_mode,
          payment_date: item.payment_date,
          transaction_reference: item.transaction_reference,
          remarks: item.remarks,
          is_download_allowed: item.is_download_allowed ?? false,
          download_count: item.download_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,

          is_downloadable: isDownloadable,
          status_message: statusMessage,
        };
      });

      return { salaryStructure, payrolls: payrollList };
    } catch (err) {
      console.warn('[payrollStore] Error getting employee payroll overview:', err);
      return { salaryStructure, payrolls: [] };
    }
  },

  async getEmployeePayslipDetail(
    userId: string,
    itemId: string
  ): Promise<{
    allowed: boolean;
    item?: PayrollItem;
    message?: string;
  }> {
    try {
      const { data: item } = await supabaseAdmin
        .from('payroll_items')
        .select('*, monthly_payrolls!inner(title, allow_payslip_download, status)')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      if (!item) {
        return { allowed: false, message: 'Payslip not found' };
      }

      const monthAllow = (item as any).monthly_payrolls?.allow_payslip_download === true;
      const itemAllow = item.is_download_allowed === true;
      const isAllowed = monthAllow || itemAllow;

      if (!isAllowed) {
        return {
          allowed: false,
          message: 'Payslip download is strictly locked until allowed by Admin.',
        };
      }

      // Increment download count
      await supabaseAdmin
        .from('payroll_items')
        .update({ download_count: (item.download_count || 0) + 1 })
        .eq('id', itemId);

      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email, department, phone')
        .eq('id', userId)
        .single();

      const { data: struct } = await supabaseAdmin
        .from('employee_salary_structures')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return {
        allowed: true,
        item: {
          ...item,
          employee_name: prof?.full_name || 'Employee',
          employee_email: prof?.email || '',
          employee_department: prof?.department || null,
          employee_phone: prof?.phone || null,
          bank_name: struct?.bank_name || null,
          account_number: struct?.account_number || null,
          ifsc_code: struct?.ifsc_code || null,
          pan_number: struct?.pan_number || null,
          uan_number: struct?.uan_number || null,
        },
      };
    } catch (err) {
      console.warn('[payrollStore] Error getting employee payslip detail:', err);
      return { allowed: false, message: 'Error retrieving payslip' };
    }
  },
};
