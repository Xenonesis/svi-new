'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, FileText, AlertCircle, Save, Mail, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import type { Employee } from './EmployeeCard';

const OFFER_LETTER_ROLES = [
  {
    department: 'Sales Department',
    roles: [
      { label: 'Telecaller', value: 'Telecaller' },
      { label: 'BDE (Business Development Executive)', value: 'BDE' },
      { label: 'BDM (Business Development Manager)', value: 'BDM' },
      { label: 'Sales Manager', value: 'Sales Manager' },
      { label: 'Team Leader (Sales)', value: 'Team Leader' },
    ],
  },
  {
    department: 'IT Department',
    roles: [
      { label: 'Software Engineer', value: 'Software Engineer' },
      { label: 'Full Stack Developer', value: 'Full Stack Developer' },
      { label: 'IT Executive', value: 'IT Executive' },
    ],
  },
  {
    department: 'Management & Operations',
    roles: [
      { label: 'Project Manager', value: 'Project Manager' },
      { label: 'Operations Executive', value: 'Operations Executive' },
      { label: 'Legal & Accounts', value: 'Legal & Accounts' },
      { label: 'Field Executive', value: 'Field Executive' },
    ],
  },
];

const QUICK_ROLE_PILLS = [
  'Telecaller',
  'BDE',
  'BDM',
  'Sales Manager',
  'Team Leader',
  'Software Engineer',
  'Operations Executive',
];

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
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#161622]"
        >
          {/* Top Gold Accent Bar */}
          <div className="via-brand-gold absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />

          {/* Modal Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 items-center justify-center rounded-full font-serif font-bold">
                {employee.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                  Edit Employee Profile
                </h3>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  ID: {employee.id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Role & Department (Offer Letter Roles)
              </label>

              {/* Role Select Dropdown from Offer Letter */}
              <select
                value={
                  OFFER_LETTER_ROLES.flatMap((g) => g.roles).some((r) => r.value === department)
                    ? department
                    : department
                      ? '__custom__'
                      : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== '__custom__') {
                    setDepartment(val);
                  }
                }}
                aria-label="Select Role from Offer Letter"
                className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-900 transition-colors focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-200"
              >
                <option value="">— Select Designation / Role from Offer Letter —</option>
                {OFFER_LETTER_ROLES.map((group) => (
                  <optgroup key={group.department} label={group.department}>
                    {group.roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="__custom__">+ Custom Designation / Type below…</option>
              </select>

              {/* Editable input */}
              <div className="relative">
                <Briefcase
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Telecaller or BDM or Custom Role"
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                />
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-gray-400">Quick:</span>
                {QUICK_ROLE_PILLS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepartment(preset)}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      department === preset
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            {/* Notes / Remarks */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Internal HR Notes
              </label>
              <div className="relative">
                <FileText size={14} className="absolute top-3 left-3 text-gray-400" />
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sales Executive - North Region, joined via referral"
                  className="focus:border-brand-gold w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-xs text-gray-900 transition-all focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
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
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
