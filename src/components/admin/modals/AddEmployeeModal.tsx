'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
export function AddEmployeeModal({
  onClose,
  onSuccess,
  token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    real_email: '',
    phone: '',
    department: '',
    password: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let p = '';
    for (let i = 0; i < 12; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: p }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const fullName = formData.full_name.trim();
    const email = formData.email.trim().toLowerCase();
    const realEmail = formData.real_email.trim().toLowerCase();
    const password = formData.password;
    const phone = formData.phone.trim();
    const department = formData.department.trim();
    const notes = formData.notes.trim();
    if (!fullName) {
      setError('Please enter the employee full name.');
      return;
    }
    if (!email) {
      setError('Please enter the email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(`The Email Address "${email}" is invalid. Please check for typos (e.g. .com).`);
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('Phone number must contain at least 10 valid digits.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          real_email: realEmail || null,
          password,
          phone: phone || null,
          department: department || null,
          notes: notes || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMessage = extractApiErrorMessage(data, 'Failed to create employee.');
        setError(errMessage);
        return;
      }
      toast.success(`Employee "${fullName}" created successfully.`);
      onSuccess();
    } catch (err: unknown) {
      setError(
        extractApiErrorMessage(err, 'Network error or server unavailable. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm dark:bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:bg-brand-dark-surface w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
            New Employee
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Full Name *
              </label>
              <input
                required
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                SVI Corporate Email *
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="name@sviinfra.com"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Personal / Real Email
              </label>
              <input
                type="email"
                value={formData.real_email}
                onChange={(e) => setFormData((p) => ({ ...p, real_email: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="name@gmail.com"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="+91 98000 00000"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Role & Department (Optional)
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="e.g. Senior Sales Executive • Sales & CRM"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  'Sales & CRM',
                  'Telecaller & Leads',
                  'Operations & Admin',
                  'Legal & Accounts',
                  'Field Executive',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, department: preset }))}
                    className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 flex justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                <span>Password *</span>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-brand-gold hover:underline"
                >
                  Generate
                </button>
              </label>
              <input
                required
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 font-mono text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="Enter or generate password"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                className="focus:border-brand-gold w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                rows={3}
                placeholder="Additional info about the employee..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-3 text-xs font-bold tracking-widest text-gray-600 uppercase transition-all hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex-1 rounded-lg py-3 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
