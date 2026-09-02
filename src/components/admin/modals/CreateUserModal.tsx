'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
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
    property_interest: '',
    notes: '',
  });

  const [isEmailManual, setIsEmailManual] = useState(false);
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

        // Update suggested SVI email if user hasn't typed a custom email
        if (!isEmailManual && data.suggested_svi_email && fullName) {
          setForm((prev) => {
            if (!isEmailManual) {
              return { ...prev, email: data.suggested_svi_email };
            }
            return prev;
          });
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
        console.error('Error checking uniqueness:', err);
      } finally {
        setValidating({ email: false, real_email: false, phone: false });
      }
    },
    [token, isEmailManual]
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
      // Auto-generate SVI Email if email hasn't been manually edited by user
      if (!isEmailManual) {
        const generated = generateSviEmail(newName);
        setForm((prev) => ({ ...prev, full_name: newName, email: generated }));
      } else {
        setForm((prev) => ({ ...prev, full_name: newName }));
      }
    } else if (name === 'email') {
      setIsEmailManual(true);
      setForm((prev) => ({ ...prev, email: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (error) setError('');
  };

  const handleResetSviEmail = () => {
    setIsEmailManual(false);
    const autoEmail = generateSviEmail(form.full_name);
    setForm((prev) => ({ ...prev, email: autoEmail }));
    checkUniqueness(form.full_name, autoEmail, form.real_email, form.phone);
    toast.info('SVI Email synchronized with Full Name.');
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 dark:bg-brand-dark-surface relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors duration-300"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-lg border">
              <Plus className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-brand-navy font-serif text-lg font-semibold tracking-tight transition-colors duration-300 dark:text-white">
              Create User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 font-sans">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400 dark:text-red-300" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="Rajesh Kumar"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>SVI Email Address *</label>
                {isEmailManual && form.full_name && (
                  <button
                    type="button"
                    onClick={handleResetSviEmail}
                    className="text-brand-gold hover:text-brand-gold-light mb-1.5 flex items-center gap-1 text-[10px] font-semibold"
                    title="Regenerate automatic email from Full Name"
                  >
                    <Sparkles className="h-3 w-3" /> Auto
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="client@sviinfra.com"
                  className={`${inputCls} pr-8 pl-9 ${
                    uniqueErrors.email ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                />
                <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
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
                <p className="mt-1 text-[10px] font-medium text-red-500">{uniqueErrors.email}</p>
              )}
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
                  placeholder="client@example.com"
                  className={`${inputCls} pr-8 pl-9 ${
                    uniqueErrors.real_email ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                />
                <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
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
                <p className="mt-1 text-[10px] font-medium text-red-500">
                  {uniqueErrors.real_email}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
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
                  placeholder="+91 98000 00000"
                  className={`${inputCls} pr-8 pl-9 ${
                    uniqueErrors.phone ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                />
                <div className="absolute top-1/2 right-2.5 -translate-y-1/2">
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
                <p className="mt-1 text-[10px] font-medium text-red-500">{uniqueErrors.phone}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Property Interest * (Select Multiple)</label>
              <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-white/10 dark:bg-[#111118]">
                {displayProperties.map((p) => {
                  const isChecked = selectedProperties.includes(p.slug);
                  return (
                    <label
                      key={p.slug}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePropertyToggle(p.slug)}
                        className="text-brand-gold focus:ring-brand-gold border-gray-250 h-4 w-4 rounded dark:border-gray-700"
                      />
                      <span className="truncate text-xs text-gray-700 dark:text-gray-300">
                        {p.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2">
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
                  className={`${inputCls} resize-none pl-9`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3.5 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="border-brand-navy/45 border-t-brand-navy h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create User
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
