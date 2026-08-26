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
  KeyRound,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase/client';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
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
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);

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
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onDelete={() => handleDelete(emp.id)}
              onResetPassword={() => setResetTarget(emp)}
            />
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
      </AnimatePresence>
    </div>
  );
}

function EmployeeCard({
  employee,
  onDelete,
  onResetPassword,
}: {
  employee: Employee;
  onDelete: () => void;
  onResetPassword: () => void;
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const cleanNotes = employee.notes || '';

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Employee ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success('Employee Login Email copied');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dark:bg-brand-dark-surface relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10"
    >
      <div className="via-brand-gold/30 absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent" />

      <div>
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
                <p className="text-brand-gold truncate font-mono text-[11px] font-bold tracking-wider uppercase">
                  ID: {employee.id.slice(0, 8)}...
                </p>
                <button
                  onClick={() => handleCopyId(employee.id)}
                  className="hover:text-brand-gold shrink-0 text-gray-400 transition-colors"
                  title="Copy Full ID"
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
            title="Delete Employee"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {/* Email / Login ID */}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200">
            <div className="flex min-w-0 items-center gap-2.5">
              <Mail size={14} className="shrink-0 text-gray-400" />
              <span className="truncate text-xs font-medium">{employee.email}</span>
            </div>
            <button
              onClick={() => handleCopyEmail(employee.email)}
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
              title="Copy Login Email"
            >
              {copiedEmail ? (
                <CheckCircle2 size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>

          {employee.phone && (
            <div className="flex items-center gap-2.5 px-1 text-xs text-gray-600 dark:text-gray-400">
              <Phone size={13} className="text-gray-400" />
              <span>{employee.phone}</span>
            </div>
          )}

          {cleanNotes && (
            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-white/10">
              <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <FileText size={13} className="mt-0.5 shrink-0 text-gray-400" />
                <p className="line-clamp-2 leading-relaxed">{cleanNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/10">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <Calendar size={12} />
          <span>Joined {new Date(employee.created_at).toLocaleDateString()}</span>
        </div>
        <button
          onClick={onResetPassword}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-300"
        >
          <KeyRound size={12} />
          <span>Reset Password</span>
        </button>
      </div>
    </motion.div>
  );
}

function ResetPasswordModal({
  employee,
  onClose,
  onSuccess,
  token,
}: {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let p = '';
    for (let i = 0; i < 12; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(p);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let activeToken = token;
      if (!activeToken) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeToken = sessionData.session?.access_token || '';
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = extractApiErrorMessage(data, 'Failed to update password');
        setError(msg);
        return;
      }

      // Copy credentials to clipboard
      const creds = `SVI Workspace Credentials\nEmployee: ${employee.full_name}\nLogin Email: ${employee.email}\nNew Password: ${password}\nLogin URL: http://localhost:3001/employee/login`;
      await navigator.clipboard.writeText(creds);
      toast.success('New credentials copied to clipboard!');
      onSuccess();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Error resetting password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm dark:bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:bg-brand-dark-surface relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Reset Employee Password
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{employee.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleReset} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Login Email (ID)
            </label>
            <input
              type="text"
              disabled
              value={employee.email}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <button
                type="button"
                onClick={generatePassword}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <RefreshCw size={11} /> Generate
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:border-brand-gold mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 transition-all focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
            />
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Saving will update the password and auto-copy the full login credentials to your
            clipboard so you can send them to the employee.
          </p>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <KeyRound size={14} />}
              Save & Copy Credentials
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
