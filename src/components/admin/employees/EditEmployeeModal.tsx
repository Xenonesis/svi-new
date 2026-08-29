'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, FileText, AlertCircle, Save, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from './EmployeeCard';
import { DepartmentRoleSelector } from './DepartmentRoleSelector';

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: (updated: {
    full_name: string;
    phone: string | null;
    department: string | null;
    notes: string | null;
  }) => void;
  token: string;
}

export function EditEmployeeModal({ employee, onClose, onSuccess, token }: EditEmployeeModalProps) {
  const [fullName, setFullName] = useState(employee.full_name || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [department, setDepartment] = useState(employee.department || '');
  const [notes, setNotes] = useState(employee.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanDepartment = department.trim();
    const cleanNotes = notes.trim();
    if (!cleanName) {
      setError('Please enter the employee full name.');
      return;
    }

    if (cleanPhone) {
      const phoneDigits = cleanPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('Phone number must contain at least 10 valid digits.');
        return;
      }
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          full_name: cleanName,
          phone: cleanPhone || null,
          department: cleanDepartment || null,
          notes: cleanNotes || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to update employee details.'));
      }

      toast.success(`Updated details for "${cleanName}"`);
      onSuccess({
        full_name: cleanName,
        phone: cleanPhone || null,
        department: cleanDepartment || null,
        notes: cleanNotes || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to update employee profile.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161622]"
        >
          {/* Top Gold Accent Bar */}
          <div className="via-brand-gold absolute top-0 right-0 left-0 z-10 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />

          {/* Modal Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-gray-100 p-6 pb-4 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-full font-serif font-bold">
                {employee.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                  Edit Employee Profile
                </h3>
                <p
                  className="font-mono text-xs text-gray-500 select-all dark:text-gray-400"
                  title={employee.id}
                >
                  ID: {employee.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form
            id="edit-employee-form"
            onSubmit={handleSubmit}
            className="scrollbar-gold flex-1 space-y-4 overflow-y-auto overscroll-contain p-6"
          >
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Khushi Sharma"
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                />
              </div>
            </div>

            {/* Email (Read-Only Info) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Login / System Email
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  disabled
                  value={employee.email}
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-2.5 pr-4 pl-9 text-xs text-gray-500 select-all dark:border-white/5 dark:bg-white/[0.03] dark:text-gray-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9218300589"
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                />
              </div>
            </div>
            {/* Department / Role */}
            <DepartmentRoleSelector value={department} onChange={setDepartment} />

            {/* Notes / Remarks */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Internal HR Notes
              </label>
              <div className="relative">
                <FileText
                  size={14}
                  className="pointer-events-none absolute top-3 left-3 text-gray-400 dark:text-gray-500"
                />
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sales Executive - North Region, joined via referral"
                  className="focus:border-brand-gold dark:focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9.5 text-xs leading-relaxed text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:focus:bg-[#161622]"
                />
              </div>
            </div>
          </form>

          {/* Modal Actions Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 p-4 px-6 backdrop-blur-sm dark:border-white/10 dark:bg-[#12121c]/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-employee-form"
              disabled={loading}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
