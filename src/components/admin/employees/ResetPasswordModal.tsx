'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  KeyRound,
  Copy,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  Send,
  Loader2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/src/lib/api/parseError';

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  real_email?: string | null;
  phone?: string | null;
  department?: string | null;
  role?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface ResetPasswordModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

interface PasswordCriteria {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

function evaluatePassword(pwd: string): {
  criteria: PasswordCriteria;
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  const criteria: PasswordCriteria = {
    hasMinLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSymbol: /[^A-Za-z0-9]/.test(pwd),
  };

  let score = 0;
  if (criteria.hasMinLength) score += 1;
  if (criteria.hasUpper && criteria.hasLower) score += 1;
  if (criteria.hasNumber) score += 1;
  if (criteria.hasSymbol) score += 1;
  if (pwd.length >= 12 && score >= 3) score = 4;

  let label: string;
  let color: string;
  let barColor: string;

  if (pwd.length === 0) {
    label = 'Empty';
    color = 'text-gray-400 dark:text-gray-500';
    barColor = 'bg-gray-200 dark:bg-white/10';
  } else if (score <= 1) {
    label = 'Weak';
    color = 'text-rose-500';
    barColor = 'bg-rose-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'text-amber-500';
    barColor = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-sky-500';
    barColor = 'bg-sky-500';
  } else {
    label = 'Strong';
    color = 'text-emerald-500';
    barColor = 'bg-emerald-500';
  }

  return { criteria, score, label, color, barColor };
}

export function ResetPasswordModal({
  employee,
  onClose,
  onSuccess,
  token,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedFullTemplate, setCopiedFullTemplate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const inputId = useId();
  const evaluation = evaluatePassword(password);
  const targetEmail = employee.real_email || employee.email;

  // Generate strong, memorable yet secure temporary password
  const generateStrongPassword = useCallback(() => {
    setIsGenerating(true);
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%*&';

    const getRandomChar = (pool: string) => pool.charAt(Math.floor(Math.random() * pool.length));

    const parts = [
      getRandomChar(upper),
      getRandomChar(upper),
      getRandomChar(lower),
      getRandomChar(lower),
      getRandomChar(lower),
      getRandomChar(numbers),
      getRandomChar(numbers),
      getRandomChar(symbols),
      getRandomChar(symbols),
      getRandomChar(upper + lower + numbers),
    ];

    // Shuffle characters
    for (let i = parts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [parts[i], parts[j]] = [parts[j], parts[i]];
    }

    const generated = parts.join('');
    setPassword(generated);
    setShowPassword(true);
    setError('');

    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Generated strong secure password');
    }, 150);
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Copy password only
  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(password);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = password;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedPassword(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      toast.error('Failed to copy password');
    }
  };

  // Construct message for clipboard or WhatsApp
  const formatHandoverMessage = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://svi-infra.com';
    return (
      `🔐 *SVI Portal Login Credentials*\n\n` +
      `Hello ${employee.full_name},\n` +
      `Your account temporary password has been reset by the Admin.\n\n` +
      `🌐 *Portal URL:* ${origin}/login\n` +
      `📧 *Email ID:* ${targetEmail}\n` +
      `🔑 *Temporary Password:* ${password}\n\n` +
      `⚠️ *Note:* Please log in and change your password immediately from your profile settings.`
    );
  };

  const handleCopyFullTemplate = async () => {
    if (!password) return;
    try {
      const msg = formatHandoverMessage();
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(msg);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = msg;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedFullTemplate(true);
      toast.success('Full login credentials copied to clipboard');
      setTimeout(() => setCopiedFullTemplate(false), 2000);
    } catch {
      toast.error('Failed to copy credentials message');
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!password) return;
    const msg = formatHandoverMessage();
    const cleanPhone = employee.phone ? employee.phone.replace(/\D/g, '') : '';
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waUrl = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
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
      toast.success(`Password successfully updated for "${employee.full_name}"`);
      onSuccess();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  const initials = employee.full_name
    ? employee.full_name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'EM';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md dark:bg-black/80"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl sm:p-6 dark:border-white/10 dark:bg-gray-950/95 dark:shadow-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
        >
          {/* Top Brand Accent Line */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-sm" />

          {/* Header */}
          <div className="mb-4 flex items-start justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-600/5 text-amber-600 shadow-md ring-1 shadow-amber-500/10 ring-amber-500/30 dark:text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="reset-password-title"
                  className="font-sans text-base font-bold tracking-tight text-gray-900 sm:text-lg dark:text-white"
                >
                  Reset Password
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Set a temporary password and safely share credentials.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Employee Context Pill Card */}
          <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 sm:p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-bold tracking-wider text-white shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {employee.full_name}
                    </span>
                    <span className="shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                      {employee.department || employee.role || 'Staff'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    <Mail size={12} className="shrink-0 text-gray-400" />
                    <span className="truncate">{targetEmail}</span>
                  </div>
                </div>
              </div>

              {employee.phone && (
                <div className="hidden items-center gap-1 rounded-lg border border-gray-200/60 bg-white px-2 py-1 text-[11px] font-medium text-gray-500 sm:flex dark:border-white/5 dark:bg-white/5 dark:text-gray-400">
                  <Phone size={11} className="text-gray-400" />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Section */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor={inputId}
                  className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  New Password <span className="font-normal text-amber-500">(min 8 chars)</span>
                </label>

                <button
                  type="button"
                  onClick={generateStrongPassword}
                  disabled={isGenerating}
                  className="group flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-amber-600 transition-all hover:bg-amber-500/10 hover:text-amber-700 active:scale-95 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
                  title="Generate a cryptographically secure random password"
                >
                  <RefreshCw
                    size={12}
                    className={`transition-transform duration-300 ${
                      isGenerating ? 'animate-spin' : 'group-hover:rotate-180'
                    }`}
                  />
                  <span>Generate Strong</span>
                </button>
              </div>

              <div className="relative flex items-center">
                {/* Leading Lock Icon */}
                <div className="pointer-events-none absolute left-3.5 text-gray-400 dark:text-gray-500">
                  <Lock size={16} />
                </div>

                <input
                  id={inputId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter or generate password"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pr-24 pl-10 font-mono text-sm tracking-wide text-gray-900 transition-all placeholder:font-sans placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-600"
                  required
                />

                {/* Trailing Actions (Visibility Toggle + Copy) */}
                <div className="absolute right-2 flex items-center gap-1">
                  {password && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-90 dark:hover:bg-white/10 dark:hover:text-white"
                        title={copiedPassword ? 'Copied!' : 'Copy password'}
                      >
                        {copiedPassword ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-90 dark:hover:bg-white/10 dark:hover:text-white"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      {evaluation.score >= 3 ? (
                        <ShieldCheck size={13} className="text-emerald-500" />
                      ) : evaluation.score === 2 ? (
                        <Shield size={13} className="text-amber-500" />
                      ) : (
                        <ShieldAlert size={13} className="text-rose-500" />
                      )}
                      Security Level
                    </span>
                    <span className={`font-bold ${evaluation.color}`}>{evaluation.label}</span>
                  </div>

                  {/* 4-bar progress indicator */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          evaluation.score >= step
                            ? evaluation.barColor
                            : 'bg-gray-200 dark:bg-white/10'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Mini Criteria Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        evaluation.criteria.hasMinLength
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                      }`}
                    >
                      {evaluation.criteria.hasMinLength ? '✓' : '•'} 8+ Chars
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        evaluation.criteria.hasUpper && evaluation.criteria.hasLower
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                      }`}
                    >
                      {evaluation.criteria.hasUpper && evaluation.criteria.hasLower ? '✓' : '•'} A-Z
                      & a-z
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        evaluation.criteria.hasNumber
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                      }`}
                    >
                      {evaluation.criteria.hasNumber ? '✓' : '•'} 0-9 Numbers
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        evaluation.criteria.hasSymbol
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                      }`}
                    >
                      {evaluation.criteria.hasSymbol ? '✓' : '•'} Symbol (!@#)
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Share / Handover Card */}
            {password.length >= 8 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-amber-500/[0.02] to-transparent p-3 dark:border-amber-500/30"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Share2 size={13} />
                    <span>Quick Handover to Employee</span>
                  </div>
                  <span className="text-[10px] text-gray-400">1-Tap Send</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyFullTemplate}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-98 dark:border-white/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
                  >
                    {copiedFullTemplate ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Copied Full Message
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-amber-500" />
                        <span>Copy Full Login Info</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-98 dark:text-emerald-400"
                    title="Open WhatsApp with prefilled credentials"
                  >
                    <Send size={13} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400"
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-2 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 sm:text-sm dark:text-gray-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-amber-800 focus:ring-4 focus:ring-amber-500/20 focus:outline-none active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Update Password</span>
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
