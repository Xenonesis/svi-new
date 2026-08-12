'use client';
import { toast } from 'sonner';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Trash2,
  UserCircle2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';
import DynamicSkeleton from '@/src/components/ui/DynamicSkeleton';
import { AddEmployeeModal } from '@/src/components/admin/modals/AddEmployeeModal';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export default function EmployeesPage() {
  const token = useAuthStore((s) => s.token);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filter state
  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  const fetchEmployees = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmployees(data.employees || []);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to fetch employees');
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
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setEmployees(employees.filter((e) => e.id !== id));
      showToast('success', 'Employee deleted successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Toast */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl dark:text-white">
            Employees Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your organization's employees and their credentials.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold tracking-widest uppercase shadow-lg transition-all"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
        />
      </div>

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
            <EmployeeCard key={emp.id} employee={emp} onDelete={() => handleDelete(emp.id)} />
          ))}
        </div>
      )}

      {/* Add Modal */}
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
      </AnimatePresence>
    </div>
  );
}

function EmployeeCard({ employee, onDelete }: { employee: Employee; onDelete: () => void }) {
  const [copiedId, setCopiedId] = useState(false);

  const cleanNotes = employee.notes || '';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark:bg-brand-dark-surface relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10"
    >
      <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex w-full items-center gap-3 overflow-hidden pr-8">
          <div className="bg-brand-gold/10 text-brand-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-xl font-bold">
            {employee.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="w-full overflow-hidden">
            <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white">
              {employee.full_name}
            </h3>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-brand-gold truncate text-xs font-bold tracking-wider uppercase">
                ID: {employee.id}
              </p>
              <button
                onClick={() => handleCopy(employee.id)}
                className="hover:text-brand-gold shrink-0 text-gray-400 transition-colors"
                title="Copy ID"
              >
                {copiedId ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Mail size={16} className="text-gray-400" />
          <span className="truncate">{employee.email}</span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Phone size={16} className="text-gray-400" />
            <span>{employee.phone}</span>
          </div>
        )}

        {cleanNotes && (
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FileText size={16} className="mt-0.5 shrink-0 text-gray-400" />
              <p className="line-clamp-2 text-xs leading-relaxed">{cleanNotes}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-white/10 dark:text-gray-500">
          <Calendar size={14} />
          Joined {new Date(employee.created_at).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}
