'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Plus, Search, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import DynamicSkeleton from '@/src/components/ui/DynamicSkeleton';
import { AddEmployeeModal } from '@/src/components/admin/modals/AddEmployeeModal';
import { EmployeeCard, type Employee } from '@/src/components/admin/employees/EmployeeCard';
import { ResetPasswordModal } from '@/src/components/admin/employees/ResetPasswordModal';
import { EmployeePerformanceModal } from '@/src/components/admin/employees/EmployeePerformanceModal';

export default function EmployeesPage() {
  const token = useAuthStore((s) => s.token);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState<Employee | null>(null);

  // Filter state
  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone && e.phone.toLowerCase().includes(search.toLowerCase()))
  );

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let activeToken = token;
      if (!activeToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeToken = sessionData.session?.access_token || '';
      }
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/admin/employees', { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to fetch employees'));
      }
      setEmployees(data.employees || []);
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Error loading employees'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      let activeToken = token;
      if (!activeToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeToken = sessionData.session?.access_token || '';
      }
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to delete employee'));
      }
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      showToast('success', 'Employee deleted successfully');
    } catch (err: unknown) {
      showToast('error', extractApiErrorMessage(err, 'Failed to delete employee'));
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
            Employees Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your organization's employees, track personal performance & leads, and manage
            credentials.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold tracking-widest uppercase shadow-lg transition-all"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
        />
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <DynamicSkeleton type="property-grid" count={3} />
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
            No employees found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search
              ? 'Try adjusting your search query.'
              : 'Get started by creating a new employee.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onDelete={() => handleDelete(emp.id)}
              onResetPassword={() => setResetTarget(emp)}
              onViewPerformance={() => setPerformanceTarget(emp)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <AddEmployeeModal
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              showToast('success', 'Employee created successfully');
              fetchEmployees();
            }}
            token={token!}
          />
        )}
        {resetTarget && (
          <ResetPasswordModal
            employee={resetTarget}
            onClose={() => setResetTarget(null)}
            onSuccess={() => {
              setResetTarget(null);
              showToast('success', 'Password reset successfully');
            }}
            token={token!}
          />
        )}
        {performanceTarget && (
          <EmployeePerformanceModal
            employee={performanceTarget}
            isOpen={!!performanceTarget}
            onClose={() => setPerformanceTarget(null)}
            token={token || ''}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
