import { describe, it, expect } from 'vitest';
import type { SalaryStructure } from '../types';

describe('In-Hand Payroll Calculation Engine', () => {
  function computeNetSalary(
    struct: SalaryStructure,
    metrics: {
      totalMonthDays: number;
      workingDays: number;
      presentDays: number;
      halfDays: number;
      paidLeaves: number;
      incentiveBonus?: number;
      advanceDeduction?: number;
      otherDeductions?: number;
    }
  ) {
    const effectiveDays = metrics.presentDays + metrics.halfDays * 0.5 + metrics.paidLeaves;
    const lopDays = Math.max(0, Number((metrics.workingDays - effectiveDays).toFixed(1)));
    const baseSalary = struct.base_salary;
    const grossEarnings = baseSalary;

    const perDaySalary = metrics.totalMonthDays > 0 ? grossEarnings / metrics.totalMonthDays : 0;
    const lopDeduction = Math.round(perDaySalary * lopDays);

    const isInHand = struct.salary_type === 'in_hand';
    const pf = isInHand ? 0 : struct.pf_deduction;
    const esi = isInHand ? 0 : struct.esi_deduction;
    const pt = isInHand ? 0 : struct.professional_tax;
    const tds = isInHand ? 0 : struct.tds;
    const advance = metrics.advanceDeduction || 0;
    const other = metrics.otherDeductions || 0;
    const incentive = metrics.incentiveBonus || 0;

    const statutoryDeductions = pf + esi + pt + tds;
    const totalDeductions = lopDeduction + statutoryDeductions + advance + other;
    const netSalary = Math.max(0, Math.round(grossEarnings - totalDeductions + incentive));

    return {
      grossEarnings,
      lopDays,
      lopDeduction,
      statutoryDeductions,
      totalDeductions,
      netSalary,
    };
  }

  it('calculates full agreed in-hand salary without statutory cuts for full attendance', () => {
    const inHandStruct: SalaryStructure = {
      id: 'struct-1',
      user_id: 'user-1',
      base_salary: 30000,
      salary_type: 'in_hand',
      basic_pay: 15000,
      hra: 9000,
      special_allowance: 6000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      pf_deduction: 1800,
      esi_deduction: 250,
      professional_tax: 200,
      tds: 0,
      is_active: true,
    };

    const res = computeNetSalary(inHandStruct, {
      totalMonthDays: 30,
      workingDays: 26,
      presentDays: 26,
      halfDays: 0,
      paidLeaves: 0,
    });

    expect(res.lopDays).toBe(0);
    expect(res.lopDeduction).toBe(0);
    expect(res.statutoryDeductions).toBe(0);
    expect(res.netSalary).toBe(30000);
  });

  it('deducts LOP pro-rated on in-hand base when employee has unpaid absences', () => {
    const inHandStruct: SalaryStructure = {
      id: 'struct-2',
      user_id: 'user-2',
      base_salary: 30000,
      salary_type: 'in_hand',
      basic_pay: 15000,
      hra: 9000,
      special_allowance: 6000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      pf_deduction: 0,
      esi_deduction: 0,
      professional_tax: 0,
      tds: 0,
      is_active: true,
    };

    const res = computeNetSalary(inHandStruct, {
      totalMonthDays: 30,
      workingDays: 26,
      presentDays: 23,
      halfDays: 0,
      paidLeaves: 0,
    });

    expect(res.lopDays).toBe(3);
    expect(res.lopDeduction).toBe(3000);
    expect(res.netSalary).toBe(27000);
  });

  it('correctly applies incentives and advances on in-hand salary', () => {
    const inHandStruct: SalaryStructure = {
      id: 'struct-3',
      user_id: 'user-3',
      base_salary: 25000,
      salary_type: 'in_hand',
      basic_pay: 12500,
      hra: 7500,
      special_allowance: 5000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      pf_deduction: 0,
      esi_deduction: 0,
      professional_tax: 0,
      tds: 0,
      is_active: true,
    };

    const res = computeNetSalary(inHandStruct, {
      totalMonthDays: 30,
      workingDays: 26,
      presentDays: 26,
      halfDays: 0,
      paidLeaves: 0,
      incentiveBonus: 5000,
      advanceDeduction: 2000,
    });

    expect(res.netSalary).toBe(28000);
  });

  it('preserves standard statutory deductions for CTC employees', () => {
    const ctcStruct: SalaryStructure = {
      id: 'struct-4',
      user_id: 'user-4',
      base_salary: 30000,
      salary_type: 'ctc',
      basic_pay: 15000,
      hra: 9000,
      special_allowance: 6000,
      conveyance_allowance: 0,
      medical_allowance: 0,
      pf_deduction: 1800,
      esi_deduction: 0,
      professional_tax: 200,
      tds: 0,
      is_active: true,
    };

    const res = computeNetSalary(ctcStruct, {
      totalMonthDays: 30,
      workingDays: 26,
      presentDays: 26,
      halfDays: 0,
      paidLeaves: 0,
    });

    expect(res.statutoryDeductions).toBe(2000);
    expect(res.netSalary).toBe(28000);
  });
});
