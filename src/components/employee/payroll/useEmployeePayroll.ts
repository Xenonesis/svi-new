'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase/client';
import type { SalaryStructure, PayrollItem } from '@/src/lib/payroll/types';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

export interface EmployeePayrollItem extends PayrollItem {
  is_downloadable: boolean;
  status_message: string;
}

export interface EmployeePayrollOverviewData {
  salaryStructure: SalaryStructure | null;
  payrolls: EmployeePayrollItem[];
}

export interface UseEmployeePayrollReturn {
  data: EmployeePayrollOverviewData | null;
  loading: boolean;
  viewingPayslipItem: PayrollItem | null;
  setViewingPayslipItem: (item: PayrollItem | null) => void;
  fetchingDetailId: string | null;
  fetchOverview: () => Promise<void>;
  handleOpenPayslip: (item: PayrollItem & { is_downloadable: boolean }) => Promise<void>;
}

export function useEmployeePayroll(): UseEmployeePayrollReturn {
  const [data, setData] = useState<EmployeePayrollOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingPayslipItem, setViewingPayslipItem] = useState<PayrollItem | null>(null);
  const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error('Session expired. Please log in.');
        return;
      }

      const res = await fetch('/api/employee/payroll', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = (await res.json()) as EmployeePayrollOverviewData & { message?: string };
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to fetch payroll records');
      }

      setData(resData);
    } catch (err: unknown) {
      console.error(err);
      toast.error(extractApiErrorMessage(err, 'Error loading payroll details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenPayslip = async (item: PayrollItem & { is_downloadable: boolean }) => {
    if (!item.is_downloadable) {
      toast.error('Payslip download is strictly locked until allowed by Admin.');
      return;
    }

    setFetchingDetailId(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(`/api/employee/payroll/${item.id}/payslip`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const detailData = (await res.json()) as {
        locked?: boolean;
        message?: string;
        item: PayrollItem;
      };

      if (!res.ok || detailData.locked) {
        throw new Error(detailData.message || 'Download not allowed yet by Admin');
      }

      setViewingPayslipItem(detailData.item);
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Failed to load payslip'));
    } finally {
      setFetchingDetailId(null);
    }
  };

  return {
    data,
    loading,
    viewingPayslipItem,
    setViewingPayslipItem,
    fetchingDetailId,
    fetchOverview,
    handleOpenPayslip,
  };
}
