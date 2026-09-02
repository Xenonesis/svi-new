'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { DepartmentRoleSelector } from '../employees/DepartmentRoleSelector';
import { generateSviEmail } from '@/src/lib/utils/sviEmailGenerator';

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

  const [isEmailManual, setIsEmailManual] = useState(false);
  const isEmailManualRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedSviEmail, setSuggestedSviEmail] = useState<string | null>(null);
  // Uniqueness validation state
  const [validating, setValidating] = useState<{
    email: boolean;
    real_email: boolean;
    phone: boolean;
  }>({ email: false, real_email: false, phone: false });

  const [uniqueErrors, setUniqueErrors] = useState<{
    email: string | null;
    real_email: string | null;
    phone: string | null;
  }>({ email: null, real_email: null, phone: null });

  const [uniqueValid, setUniqueValid] = useState<{
    email: boolean;
    real_email: boolean;
    phone: boolean;
  }>({ email: false, real_email: false, phone: false });

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let p = '';
    for (let i = 0; i < 12; i++) {
      p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: p }));
  };

  // Debounced uniqueness checker
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkUniqueness = useCallback(
    async (fullName: string, email: string, realEmail: string, phone: string) => {
      if (!token) return;

      const params = new URLSearchParams();
      if (fullName) params.set('full_name', fullName);
      if (email) params.set('email', email);
      if (realEmail) params.set('real_email', realEmail);
      if (phone) params.set('phone', phone);

      if (!fullName && !email && !realEmail && !phone) return;

      setValidating({
        email: Boolean(email || fullName),
        real_email: Boolean(realEmail),
        phone: Boolean(phone && phone.replace(/\D/g, '').length >= 10),
      });

      try {
        const res = await fetch(`/api/admin/users/check-unique?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.suggested_svi_email) {
          setSuggestedSviEmail(data.suggested_svi_email);
          if (!isEmailManualRef.current && fullName) {
            setFormData((prev) => {
              if (!isEmailManualRef.current) {
                return { ...prev, email: data.suggested_svi_email };
              }
              return prev;
            });
          }
        }

        setUniqueErrors({
          email: data.email_error || null,
          real_email: data.real_email_error || null,
          phone: data.phone_error || null,
        });

        setUniqueValid({
          email: Boolean(email && data.email_available),
          real_email: Boolean(realEmail && data.real_email_available),
          phone: Boolean(phone && phone.replace(/\D/g, '').length >= 10 && data.phone_available),
        });
      } catch (err) {
        console.error('Error checking employee uniqueness:', err);
      } finally {
        setValidating({ email: false, real_email: false, phone: false });
      }
    },
    [token]
  );

  useEffect(() => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    checkTimerRef.current = setTimeout(() => {
      checkUniqueness(formData.full_name, formData.email, formData.real_email, formData.phone);
    }, 350);

    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [formData.full_name, formData.email, formData.real_email, formData.phone, checkUniqueness]);

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!isEmailManualRef.current) {
      const generated = generateSviEmail(newName);
      setFormData((prev) => ({ ...prev, full_name: newName, email: generated }));
    } else {
      setFormData((prev) => ({ ...prev, full_name: newName }));
    }
    if (error) setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEmailManualRef.current = true;
    setIsEmailManual(true);
    setFormData((prev) => ({ ...prev, email: e.target.value }));
    if (error) setError('');
  };

  const handleResetSviEmail = () => {
    isEmailManualRef.current = false;
    setIsEmailManual(false);
    const autoEmail = generateSviEmail(formData.full_name);
    setFormData((prev) => ({ ...prev, email: autoEmail }));
    checkUniqueness(formData.full_name, autoEmail, formData.real_email, formData.phone);
    toast.info('SVI Corporate Email synchronized with Full Name.');
  };

  const handleApplySuggestedEmail = (emailToUse: string) => {
    isEmailManualRef.current = true;
    setIsEmailManual(true);
    setFormData((prev) => ({ ...prev, email: emailToUse }));
    setUniqueErrors((prev) => ({ ...prev, email: null }));
    setUniqueValid((prev) => ({ ...prev, email: true }));
    toast.success(`Applied suggested corporate email: ${emailToUse}`);
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
      setError('Full Name is required');
      return;
    }
    if (!email) {
      setError('Email Address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address format');
      return;
    }

    if (uniqueErrors.email) {
      setError(uniqueErrors.email);
      return;
    }

    if (realEmail && !emailRegex.test(realEmail)) {
      setError('Invalid personal email address format');
      return;
    }

    if (uniqueErrors.real_email) {
      setError(uniqueErrors.real_email);
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError('Phone number must contain at least 10 valid digits');
        return;
      }
    }

    if (uniqueErrors.phone) {
      setError(uniqueErrors.phone);
      return;
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
          real_email: realEmail || undefined,
          phone: phone || undefined,
          department: department || undefined,
          password,
          notes: notes || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          extractApiErrorMessage(data, 'Failed to create employee. Please try again.')
        );
      }

      toast.success('Employee created successfully');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to create employee. Please try again.'));
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
        className="dark:bg-brand-dark-surface relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10"
      >
        {/* Top Gold Accent Bar */}
        <div className="via-brand-gold absolute top-0 right-0 left-0 z-10 h-1 bg-gradient-to-r from-transparent to-transparent opacity-60" />

        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
            New Employee
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-employee-form"
          onSubmit={handleSubmit}
          className="scrollbar-gold flex-1 space-y-4 overflow-y-auto overscroll-contain p-6"
        >
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
                onChange={handleFullNameChange}
                className="focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  SVI Corporate Email *
                </label>
                {isEmailManual && formData.full_name && (
                  <button
                    type="button"
                    onClick={handleResetSviEmail}
                    className="text-brand-gold hover:text-brand-gold-light mb-1 flex items-center gap-1 text-[10px] font-semibold"
                    title="Regenerate automatic email from Full Name"
                  >
                    <Sparkles className="h-3 w-3" /> Auto
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white ${
                    uniqueErrors.email ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  placeholder="name@sviinfra.com"
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {validating.email ? (
                    <Loader2 className="text-brand-gold h-3.5 w-3.5 animate-spin" />
                  ) : uniqueErrors.email ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  ) : uniqueValid.email ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : null}
                </div>
              </div>
              {uniqueErrors.email && (
                <div className="mt-1 space-y-1">
                  <p className="text-[10px] leading-tight font-medium text-red-500">
                    {uniqueErrors.email}
                  </p>
                  {suggestedSviEmail && suggestedSviEmail !== formData.email && (
                    <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold flex items-center justify-between gap-1.5 rounded-lg border p-1.5 text-[10px]">
                      <div className="flex min-w-0 items-center gap-1">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          Try: <strong className="font-semibold">{suggestedSviEmail}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplySuggestedEmail(suggestedSviEmail)}
                        className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy shrink-0 rounded px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors"
                      >
                        Use This
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Personal / Real Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.real_email}
                  onChange={(e) => setFormData((p) => ({ ...p, real_email: e.target.value }))}
                  className={`focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white ${
                    uniqueErrors.real_email ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  placeholder="name@gmail.com"
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {validating.real_email ? (
                    <Loader2 className="text-brand-gold h-3.5 w-3.5 animate-spin" />
                  ) : uniqueErrors.real_email ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  ) : uniqueValid.real_email ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : null}
                </div>
              </div>
              {uniqueErrors.real_email && (
                <p className="mt-1 text-[10px] leading-tight font-medium text-red-500">
                  {uniqueErrors.real_email}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className={`focus:border-brand-gold w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white ${
                    uniqueErrors.phone ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  placeholder="+91 98000 00000"
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {validating.phone ? (
                    <Loader2 className="text-brand-gold h-3.5 w-3.5 animate-spin" />
                  ) : uniqueErrors.phone ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  ) : uniqueValid.phone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : null}
                </div>
              </div>
              {uniqueErrors.phone && (
                <p className="mt-1 text-[10px] leading-tight font-medium text-red-500">
                  {uniqueErrors.phone}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <DepartmentRoleSelector
                value={formData.department}
                onChange={(val) => setFormData((p) => ({ ...p, department: val }))}
              />
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
        </form>

        {/* Modal Actions Footer */}
        <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-gray-50/70 p-4 px-6 backdrop-blur-sm dark:border-white/5 dark:bg-[#12121a]/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold tracking-widest text-gray-600 uppercase transition-all hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-employee-form"
            disabled={
              loading ||
              Boolean(
                uniqueErrors.email ||
                uniqueErrors.real_email ||
                uniqueErrors.phone ||
                validating.email ||
                validating.real_email ||
                validating.phone
              )
            }
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex-1 rounded-lg py-2.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
