'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';
import { INPUT_CLS, LABEL_CLS, MODAL_OVERLAY_CLASS } from '../helpers/formStyles';
import { getDisplayProperties, togglePropertySelection } from '../helpers/propertyUtils';
import { generateSviEmail } from '@/src/lib/utils/sviEmailGenerator';
import { RoleSelect } from '../helpers/RoleSelect';
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  properties: Array<{ name: string; slug: string }>;
}

export function CreateUserModal({ onClose, onSuccess, token, properties }: CreateUserModalProps) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    real_email: '',
    password: '',
    phone: '',
    role: 'client',
    property_interest: '',
    notes: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const displayProperties = getDisplayProperties(properties);
  const selectedProperties = form.property_interest ? form.property_interest.split(',') : [];

  const handlePropertyToggle = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      property_interest: togglePropertySelection(prev.property_interest, slug),
    }));
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

        if (data.suggested_svi_email && fullName) {
          setForm((prev) => ({ ...prev, email: data.suggested_svi_email }));
        }

        setUniqueErrors({
          email: null,
          real_email: data.real_email_error || null,
          phone: data.phone_error || null,
        });

        setUniqueValid({
          email: Boolean(form.email || data.suggested_svi_email),
          real_email: Boolean(realEmail && data.real_email_available),
          phone: Boolean(phone && phone.replace(/\D/g, '').length >= 10 && data.phone_available),
        });
      } catch (err) {
        console.error('Error checking uniqueness:', err);
      } finally {
        setValidating({ email: false, real_email: false, phone: false });
      }
    },
    [token]
  );

  // Trigger debounced uniqueness check whenever full_name, email, real_email, or phone changes
  useEffect(() => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    checkTimerRef.current = setTimeout(() => {
      checkUniqueness(form.full_name, form.email, form.real_email, form.phone);
    }, 350);

    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [form.full_name, form.email, form.real_email, form.phone, checkUniqueness]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'full_name') {
      const newName = value;
      const generated = generateSviEmail(newName);
      setForm((prev) => ({ ...prev, full_name: newName, email: generated }));
      setUniqueErrors((prev) => ({ ...prev, email: null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: newPassword }));
    setShowPass(true);
    toast.success('Generated strong random password.');
  };

  const handleSelectAllProperties = () => {
    const allSlugs = displayProperties.map((p) => p.slug).join(',');
    setForm((prev) => ({ ...prev, property_interest: allSlugs }));
  };

  const handleClearAllProperties = () => {
    setForm((prev) => ({ ...prev, property_interest: '' }));
  };

  const handleAppendNote = (noteText: string) => {
    setForm((prev) => {
      const current = prev.notes.trim();
      if (!current) return { ...prev, notes: noteText };
      if (current.includes(noteText)) return prev;
      return { ...prev, notes: `${current}, ${noteText}` };
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const fullName = form.full_name.trim();
    const email = form.email.trim().toLowerCase();
    const realEmail = form.real_email.trim().toLowerCase();
    const password = form.password;
    const phone = form.phone.trim();
    const propertyInterest = form.property_interest.trim();
    const notes = form.notes.trim();

    if (!fullName) {
      setError('Please enter the client full name.');
      return;
    }

    if (!email) {
      setError('Please enter the SVI Email Address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(`The SVI Email Address "${email}" is invalid. Please check for typos (e.g. .com).`);
      return;
    }

    if (uniqueErrors.email) {
      setError(uniqueErrors.email);
      return;
    }

    if (!realEmail) {
      setError('Please enter the Real Email Address.');
      return;
    }
    if (!emailRegex.test(realEmail)) {
      setError(
        `The Real Email Address "${realEmail}" is invalid. Please check for typos (e.g. .com).`
      );
      return;
    }

    if (uniqueErrors.real_email) {
      setError(uniqueErrors.real_email);
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

    if (!phone) {
      setError('Please enter a phone number.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Phone number must contain at least 10 valid digits.');
      return;
    }

    if (uniqueErrors.phone) {
      setError(uniqueErrors.phone);
      return;
    }

    if (!propertyInterest) {
      setError('Please select at least one Property Interest.');
      return;
    }

    if (!notes) {
      setError('Please provide internal notes.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: fullName,
          email,
          real_email: realEmail,
          password,
          phone,
          role: form.role,
          property_interest: propertyInterest,
          notes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMessage = extractApiErrorMessage(
          json,
          'Failed to create user. Please check the details and try again.'
        );
        setError(errMessage);
        return;
      }
      toast.success(`User "${fullName}" created successfully.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        extractApiErrorMessage(err, 'Network error or server unavailable. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = INPUT_CLS;
  const labelCls = LABEL_CLS;

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="dark:border-brand-gold/25 relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors duration-300 dark:bg-[#0d0d14]"
      >
        <div className="via-brand-gold/60 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="border-brand-gold/30 bg-brand-gold/10 flex h-9 w-9 items-center justify-center rounded-xl border">
              <Plus className="text-brand-gold h-4 w-4" />
            </div>
            <div>
              <h2 className="text-brand-navy font-serif text-lg font-semibold tracking-tight transition-colors duration-300 dark:text-white">
                Create User
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Provision portal credentials & CRM preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-1 flex-col overflow-hidden font-sans"
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-300" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {/* 01. Client Identity & Contact */}
            <div>
              <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5 dark:border-white/5">
                <span className="text-brand-gold text-[10px] font-bold tracking-wider uppercase">
                  01. Client Identity & Contact
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    autoFocus
                    placeholder="Rajesh Kumar"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Real Email Address *</label>
                  <div className="relative">
                    <Mail className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <input
                      name="real_email"
                      type="email"
                      value={form.real_email}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      placeholder="client@example.com"
                      className={`${inputCls} pr-10 pl-9 ${
                        uniqueErrors.real_email ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
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

                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <div className="relative">
                    <Phone className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      placeholder="9876543210"
                      className={`${inputCls} pr-10 pl-9 ${
                        uniqueErrors.phone ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
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
              </div>
            </div>

            {/* 02. Portal Credentials & Access */}
            <div>
              <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5 dark:border-white/5">
                <span className="text-brand-gold text-[10px] font-bold tracking-wider uppercase">
                  02. Portal Credentials & Access
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <RoleSelect
                    role={form.role}
                    onRoleChange={(newRole) => setForm((prev) => ({ ...prev, role: newRole }))}
                    label="Account Role *"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-400">
                        SVI Email Address
                      </label>
                      <span className="font-bold text-red-500">*</span>
                    </span>
                    <span className="border-brand-gold/25 bg-brand-gold/10 text-brand-gold flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
                      <Sparkles className="h-2.5 w-2.5" /> Auto
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      readOnly
                      tabIndex={-1}
                      required
                      placeholder="Auto-generated from name..."
                      className={`${inputCls} cursor-not-allowed border-gray-200 bg-gray-50/80 pr-10 pl-9 text-gray-700 select-all dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200`}
                    />
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      {validating.email ? (
                        <Loader2 className="text-brand-gold h-3.5 w-3.5 animate-spin" />
                      ) : form.email ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-400">
                        Password
                      </label>
                      <span className="font-bold text-red-500">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-brand-gold hover:text-brand-gold-light flex cursor-pointer items-center gap-1 text-[10px] font-semibold transition-colors"
                    >
                      <Sparkles className="h-3 w-3" /> Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder="Min 8 chars"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="hover:text-brand-gold absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 03. CRM & Property Interest */}
            <div>
              <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5 dark:border-white/5">
                <span className="text-brand-gold text-[10px] font-bold tracking-wider uppercase">
                  03. CRM & Property Preferences
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={labelCls}>
                      Property Interest * ({selectedProperties.length}/{displayProperties.length}{' '}
                      Selected)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllProperties}
                        className="text-brand-gold hover:text-brand-gold-light text-[10px] font-semibold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-[10px] text-gray-400">•</span>
                      <button
                        type="button"
                        onClick={handleClearAllProperties}
                        className="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 dark:border-white/10 dark:bg-[#111118]">
                    {displayProperties.map((p) => {
                      const isChecked = selectedProperties.includes(p.slug);
                      return (
                        <label
                          key={p.slug}
                          className={`relative flex cursor-pointer items-center gap-2.5 rounded-lg border p-2 transition-all duration-150 ${
                            isChecked
                              ? 'border-brand-gold/60 bg-brand-gold/10 text-gray-900 shadow-xs dark:text-white'
                              : 'hover:border-brand-gold/30 border-gray-200 bg-white text-gray-700 dark:border-white/5 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePropertyToggle(p.slug)}
                            className="sr-only"
                          />
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors ${
                              isChecked
                                ? 'bg-brand-gold text-brand-navy'
                                : 'border border-gray-300 bg-transparent dark:border-white/20'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate text-xs font-medium" title={p.name}>
                            {p.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Notes (Internal) *</label>
                  <div className="relative">
                    <FileText className="text-brand-gold absolute top-3 left-3 h-3.5 w-3.5" />
                    <textarea
                      name="notes"
                      rows={2}
                      value={form.notes}
                      onChange={handleChange}
                      required
                      placeholder="Internal notes about this client..."
                      className={`${inputCls} resize-none py-2.5 pr-3 pl-9`}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-medium text-gray-400">Quick Tags:</span>
                    {[
                      'Site visit scheduled',
                      'Looking for Villa/Plot',
                      'Budget ₹40L-₹60L',
                      'Immediate decision maker',
                      'High priority investor',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAppendNote(tag)}
                        className="hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 transition-all dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer Actions */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-3.5 backdrop-blur-md dark:border-white/8 dark:bg-black/20">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold tracking-wider text-gray-700 uppercase transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
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
              className="glow-gold bg-brand-gold text-brand-navy hover:bg-brand-gold-light flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold tracking-widest uppercase shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="text-brand-navy h-4 w-4 shrink-0 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
