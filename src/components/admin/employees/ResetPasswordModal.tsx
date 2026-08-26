'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, KeyRound, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

interface ResetPasswordModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export function ResetPasswordModal({
  employee,
  onClose,
  onSuccess,
  token,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let p = '';
    for (let i = 0; i < 12; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(p);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Generated password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractApiErrorMessage(data, 'Failed to reset password'));
      }
      onSuccess();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900"
        >
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <KeyRound className="text-amber-500" size={20} />
              <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                Reset Password
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Set a new temporary password for{' '}
            <strong className="text-gray-800 dark:text-gray-200">{employee.full_name}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  New Password (min 8 chars)
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  <RefreshCw size={11} /> Generate Strong
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 pr-10 font-mono text-xs text-gray-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  required
                />
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    title="Copy password"
                  >
                    {copied ? (
                      <CheckCircle2 size={15} className="text-emerald-500" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Update Password'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
