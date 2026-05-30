'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  LogOut,
  Mail,
  Phone,
  Plus,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import ActivityTimeline from '@/src/components/admin/ActivityTimeline';
import DocumentStatsChart from '@/src/components/admin/ChartComponents/DocumentStatsChart';
import QuickActions from '@/src/components/admin/QuickActions';
import UserGrowthChart from '@/src/components/admin/ChartComponents/UserGrowthChart';
import type { UserProfile } from '@/src/lib/supabase/types';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const PROPERTY_LABELS: Record<string, string> = {
  residential_3bhk: '3BHK Residential',
  residential_4bhk: '4BHK Residential',
  residential_plot: 'Residential Plot',
  commercial: 'Commercial Property',
  investment: 'Investment / General',
};

const renderPropertyInterestTags = (
  interest: string | null,
  properties: Array<{ name: string; slug: string }> = []
) => {
  if (!interest) return null;
  const items = interest.split(',').map((item) => {
    const trimmed = item.trim();
    const found = properties.find((p) => p.slug === trimmed);
    if (found) return found.name;
    if (PROPERTY_LABELS[trimmed]) return PROPERTY_LABELS[trimmed];
    return trimmed
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="bg-brand-gold/10 border-brand-gold/20 text-brand-gold hover:bg-brand-gold/20 hover:border-brand-gold/40 inline-flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-bold tracking-wide shadow-[0_0_15px_rgba(201,168,76,0.15)] transition-all hover:scale-105"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

function Badge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase shadow-sm ${
        role === 'admin'
          ? 'from-brand-gold/20 to-brand-gold/5 text-brand-gold border-brand-gold/30 border bg-gradient-to-r'
          : 'border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 dark:border-white/10 dark:from-white/10 dark:to-white/5 dark:text-gray-300'
      }`}
    >
      {role === 'admin' ? (
        <Shield className="text-brand-gold h-3 w-3" />
      ) : (
        <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
      )}
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

// ── Create User Modal ────────────────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  properties: Array<{ name: string; slug: string }>;
}

function CreateUserModal({ onClose, onSuccess, token, properties }: CreateUserModalProps) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    real_email: '',
    password: '',
    phone: '',
    property_interest: '',
    notes: '',
  });

  const displayProperties =
    properties.length > 0
      ? properties
      : Object.entries(PROPERTY_LABELS).map(([slug, name]) => ({ name, slug }));

  const selectedProperties = form.property_interest ? form.property_interest.split(',') : [];

  const handlePropertyToggle = (slug: string) => {
    let updated;
    if (selectedProperties.includes(slug)) {
      updated = selectedProperties.filter((s) => s !== slug);
    } else {
      updated = [...selectedProperties, slug];
    }
    setForm((p) => ({ ...p, property_interest: updated.join(',') }));
  };
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.email ||
      !form.password ||
      !form.full_name ||
      !form.real_email ||
      !form.phone ||
      !form.property_interest ||
      !form.notes
    ) {
      setError(
        'All fields (Name, SVI Email, Email, Password, Phone, Property Interest, and Notes) are required.'
      );
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all font-sans';
  const labelCls =
    'text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors duration-300 dark:bg-[#0e0e14]"
      >
        {/* Subtle gold line on top of the modal */}
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header */}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 font-sans">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
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
              <label className={labelCls}>SVI Email Address *</label>
              <div className="relative">
                <Mail className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="client@sviinfra.com"
                  className={`${inputCls} pl-9`}
                />
              </div>
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
                  className={`${inputCls} pl-9`}
                />
              </div>
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
                  className={`${inputCls} pl-9`}
                />
              </div>
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

// ── Edit User Modal ──────────────────────────────────────────────────────────
interface EditUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  properties: Array<{ name: string; slug: string }>;
}

function EditUserModal({ user, onClose, onSuccess, token, properties }: EditUserModalProps) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    real_email: user.real_email || '',
    phone: user.phone || '',
    property_interest: user.property_interest || '',
    notes: user.notes || '',
    role: user.role || 'client',
  });

  const displayProperties =
    properties.length > 0
      ? properties
      : Object.entries(PROPERTY_LABELS).map(([slug, name]) => ({ name, slug }));

  const selectedProperties = form.property_interest ? form.property_interest.split(',') : [];

  const handlePropertyToggle = (slug: string) => {
    let updated;
    if (selectedProperties.includes(slug)) {
      updated = selectedProperties.filter((s) => s !== slug);
    } else {
      updated = [...selectedProperties, slug];
    }
    setForm((p) => ({ ...p, property_interest: updated.join(',') }));
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !form.full_name ||
      !form.real_email ||
      !form.phone ||
      !form.property_interest ||
      !form.notes
    ) {
      setError('All fields (Name, Email, Phone, Property Interest, and Notes) are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update user');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 transition-all font-sans';
  const labelCls =
    'text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-1.5 block transition-colors duration-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-colors duration-300 dark:bg-[#0e0e14]"
      >
        {/* Subtle gold line on top of the modal */}
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-lg border">
              <Pencil className="text-brand-gold h-4 w-4" />
            </div>
            <h2 className="text-brand-navy font-serif text-lg font-semibold tracking-tight transition-colors duration-300 dark:text-white">
              Edit User Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 font-sans">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
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

            <div className="col-span-2 sm:col-span-1">
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
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
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
                  className={`${inputCls} pl-9`}
                />
              </div>
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

            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Access Role</label>
              <div className="relative">
                <Shield className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`${inputCls} appearance-none rounded-none pr-8 pl-9`}
                >
                  <option value="client">User</option>
                  <option value="admin">Admin</option>
                </select>
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
                  placeholder="Internal notes..."
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
                  <Pencil className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm ───────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  user: UserProfile;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

function DeleteConfirm({ user, onConfirm, onClose, loading }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl transition-colors duration-300 dark:bg-[#0e0e14]"
      >
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-red-500/50" />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <Trash2 className="h-5 w-5 text-red-400" />
        </div>
        <h3 className="text-brand-navy mb-2 font-serif text-lg tracking-tight transition-colors duration-300 dark:text-white">
          Delete User?
        </h3>
        <p className="mb-6 font-sans text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
          This will permanently delete{' '}
          <span className="text-brand-navy font-medium dark:text-white">{user.full_name}</span> and
          all associated data. This action is irreversible.
        </p>
        <div className="flex gap-3 font-sans">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gray-100 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:bg-red-500"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface AdvisorProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

function AdvisorSettingsModal({
  onClose,
  token,
  showToast,
}: {
  onClose: () => void;
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}) {
  const [profiles, setProfiles] = useState<AdvisorProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: settingData } = await supabase
          .from('portal_settings')
          .select('value')
          .eq('key', 'active_advisors')
          .maybeSingle();

        let initialSelected: string[] = [];
        if (settingData?.value?.ids && Array.isArray(settingData.value.ids)) {
          initialSelected = settingData.value.ids;
        }
        setSelectedIds(initialSelected);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name', { ascending: true });

        if (profilesError) throw profilesError;
        setProfiles(profilesData || []);
      } catch (err: any) {
        console.error('Failed to load advisor configuration:', err);
        showToast('error', 'Failed to retrieve advisor configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [showToast]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredProfiles.map((p) => p.id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: 'active_advisors',
          value: { ids: selectedIds },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update dynamic advisor list.');

      showToast('success', 'Public advisor list updated successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'An error occurred while saving.');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 font-sans backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-[#0e0e14]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-lg border">
              <Users className="text-brand-gold h-4 w-4" />
            </div>
            <div>
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                Manage Public Advisors
              </h2>
              <p className="text-[10px] text-gray-500">
                Select accounts to display as advisors in booking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-100 p-4 dark:border-white/8">
          <div className="relative">
            <Search className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-xs text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
            />
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <RefreshCw className="text-brand-gold mr-2 h-4 w-4 animate-spin" />
              <span>Loading profiles...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">No users found.</div>
          ) : (
            filteredProfiles.map((p) => {
              const isChecked = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleToggle(p.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    isChecked
                      ? 'border-brand-gold bg-brand-gold/5 dark:bg-brand-gold/2'
                      : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 dark:border-white/5 dark:bg-white/2 dark:hover:bg-white/4'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                      {p.full_name}
                    </p>
                    <p className="truncate text-[10px] text-gray-500">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[8px] font-bold tracking-widest text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
                      {p.role}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="accent-brand-gold focus:ring-brand-gold h-4 w-4 rounded border-gray-300"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/8">
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              disabled={loading}
              className="text-brand-gold hover:text-brand-gold/80 text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
            >
              Select All
            </button>
            <span className="text-gray-300 dark:text-white/10">|</span>
            <button
              onClick={handleClearAll}
              disabled={loading}
              className="text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700 disabled:opacity-50 dark:hover:text-gray-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-[10px] font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading || loading}
              className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-lg disabled:opacity-60"
            >
              {saveLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [analytics, setAnalytics] = useState<{
    userGrowth: Array<{ date: string; users: number }>;
    documentStats: Array<{ name: string; count: number }>;
    trends: { userGrowth: string; clientGrowth: string; adminCount: string };
  } | null>(null);
  const [activities, setActivities] = useState<
    Array<{
      id: string;
      type: 'user' | 'document' | 'settings' | 'download';
      title: string;
      description: string;
      timestamp: string;
      user: string;
    }>
  >([]);
  const [properties, setProperties] = useState<Array<{ name: string; slug: string }>>([]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async (tkn: string) => {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users);
    }
    setLoading(false);
  }, []);

  // Consolidated: auth check + parallel data fetch (users, analytics, activities)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      const tkn = session.access_token;
      setToken(tkn);
      setCurrentAdminId(session.user.id);
      setAdminName(profile?.full_name || session.user.email || 'Admin');

      const authHeaders = { Authorization: `Bearer ${tkn}` };
      const [usersRes, analyticsRes, activitiesRes, propertiesRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeaders }),
        fetch('/api/admin/analytics', { headers: authHeaders }),
        fetch('/api/admin/activities?limit=10', { headers: authHeaders }),
        supabase
          .from('properties')
          .select('name, slug')
          .eq('active', true)
          .order('name', { ascending: true }),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        setUsers(json.users);
      }
      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }
      if (propertiesRes && !propertiesRes.error && propertiesRes.data) {
        setProperties(propertiesRes.data);
      }
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error);
      }
      setUsers((u) => u.filter((x) => x.id !== deleteTarget.id));
      showToast('success', `${deleteTarget.full_name} has been deleted.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.real_email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const clientCount = users.filter((u) => u.role === 'client').length;

  // Use real data or fallback to empty arrays
  const userGrowthData = analytics?.userGrowth || [];
  const documentStatsData = analytics?.documentStats || [];
  const recentActivities = activities;

  return (
    <div className="relative w-full font-sans">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header section with page-mount animation */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight transition-colors duration-300 dark:text-white">
              System{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
                }}
              >
                Dashboard
              </span>
            </h1>
            <p className="text-xs tracking-wide text-gray-600 transition-colors duration-300 dark:text-gray-400">
              Manage authorized user accounts and monitor administrative access permissions.
            </p>
          </div>
        </div>

        {/* Stats Row with explicitly styled cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              label: 'Total Accounts',
              value: users.length,
              icon: Users,
              bgCls:
                'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-brand-gold/15 relative overflow-hidden transition-colors duration-300',
              iconBg: 'bg-brand-gold/10 border border-brand-gold/25',
              iconColor: 'text-brand-gold',
              showLine: true,
              trend: analytics?.trends?.userGrowth || '+0%',
            },
            {
              label: 'User Profiles',
              value: clientCount,
              icon: Building2,
              bgCls:
                'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
              iconBg: 'bg-white/5 border border-white/10',
              iconColor: 'text-gray-300',
              showLine: false,
              trend: analytics?.trends?.clientGrowth || '+0%',
            },
            {
              label: 'Administrators',
              value: users.length - clientCount,
              icon: Shield,
              bgCls:
                'bg-white/80 dark:bg-[#0e0e14]/65 backdrop-blur-xl border border-gray-200 dark:border-white/8 hover:border-brand-gold/15 transition-colors relative overflow-hidden',
              iconBg: 'bg-white/5 border border-white/10',
              iconColor: 'text-gray-300',
              showLine: false,
              trend: analytics?.trends?.adminCount || '0%',
            },
          ].map(({ label, value, icon: Icon, bgCls, iconBg, iconColor, showLine, trend }) => (
            <div key={label} className={`${bgCls} rounded-xl p-5 shadow-lg`}>
              {showLine && (
                <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
              )}
              <div className="mb-3 flex items-center justify-between">
                <div className={`h-11 w-11 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
                  {trend}
                </span>
              </div>
              <p className="text-brand-navy text-3xl font-bold tracking-tight transition-colors duration-300 dark:text-white">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Charts & Analytics Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <UserGrowthChart data={userGrowthData} />
          <DocumentStatsChart data={documentStatsData} />
        </div>

        {/* Quick Actions & Activity Timeline */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <QuickActions />
          </div>
          <div className="xl:col-span-2">
            <ActivityTimeline activities={recentActivities} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 font-sans sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-white dark:placeholder-gray-600"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchUsers(token);
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowAdvisorSettings(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Users className="h-3.5 w-3.5" /> Manage Advisors
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-xs font-bold tracking-widest uppercase shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Users Table glassmorphic container */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/8 dark:bg-[#0e0e14]/65">
          {/* Subtle gold line on top */}
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          {loading ? (
            <div className="flex items-center justify-center py-24 font-sans text-gray-500 transition-colors duration-300 dark:text-gray-400">
              <RefreshCw className="text-brand-gold mr-3 h-5 w-5 animate-spin" /> Loading user
              database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center font-sans">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 transition-colors duration-300 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 transition-colors duration-300 dark:text-gray-400">
                {search ? 'No matches found.' : 'No users created yet. Add one!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-sans text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-md transition-colors duration-300 dark:border-white/5 dark:bg-white/5">
                    {[
                      'User Profile',
                      'Contact Info',
                      'Property Interests',
                      'Joined Date',
                      'Actions',
                    ].map((h, idx) => (
                      <th
                        key={h}
                        className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400 ${idx === 4 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
                      className="group hover:from-brand-gold/5 dark:hover:from-brand-gold/10 relative transition-all duration-300 hover:bg-gradient-to-r hover:to-transparent dark:hover:to-transparent"
                    >
                      {/* User Profile */}
                      <td className="relative px-6 py-5">
                        <div className="bg-brand-gold absolute top-0 bottom-0 left-0 w-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="flex items-center gap-4">
                          <div className="from-brand-gold shadow-brand-gold/20 relative flex h-12 w-12 flex-shrink-0 transform items-center justify-center rounded-xl bg-gradient-to-br via-yellow-600 to-amber-700 font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                            <span className="text-lg">
                              {u.full_name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="group-hover:text-brand-gold font-serif text-base font-bold text-gray-900 transition-colors duration-300 dark:text-white">
                                {u.full_name}
                              </span>
                              <Badge role={u.role} />
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Mail className="text-brand-gold/70 h-3 w-3" />
                              {u.email}
                            </div>
                            {u.notes && (
                              <div className="mt-1 flex items-start gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                <FileText className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                <span className="max-w-[220px] truncate" title={u.notes}>
                                  {u.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          {u.phone ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-gray-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <Phone className="text-brand-gold h-3 w-3" />
                              </div>
                              {u.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                          {u.real_email ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-gray-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <Mail className="h-3 w-3 text-gray-400" />
                              </div>
                              <span className="max-w-[150px] truncate" title={u.real_email}>
                                {u.real_email}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Property Interests */}
                      <td className="w-[300px] px-6 py-5">
                        {u.property_interest ? (
                          renderPropertyInterestTags(u.property_interest, properties)
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:border-white/10 dark:text-gray-600">
                            No interests
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 shadow-sm dark:border-white/5 dark:bg-[#111118] dark:text-gray-400">
                          {new Date(u.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="relative w-[120px] px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            onClick={() => setEditTarget(u)}
                            className="group/btn hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy hover:shadow-brand-gold/20 dark:hover:border-brand-gold dark:hover:bg-brand-gold dark:hover:text-brand-navy relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:shadow-lg dark:border-white/10 dark:bg-[#111118] dark:text-gray-400"
                            title="Edit User Profile"
                          >
                            <Pencil className="h-4 w-4 transform transition-transform group-hover/btn:scale-110" />
                          </button>
                          {u.id !== currentAdminId && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="group/btn relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 dark:border-white/10 dark:bg-[#111118] dark:text-gray-400 dark:hover:border-red-500 dark:hover:bg-red-500 dark:hover:text-white"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4 transform transition-transform group-hover/btn:scale-110" />
                            </button>
                          )}
                        </div>
                        <div className="pointer-events-none absolute top-1/2 right-8 flex -translate-y-1/2 justify-end opacity-100 transition-opacity duration-300 group-hover:opacity-0">
                          <span className="flex gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            token={token}
            properties={properties}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              fetchUsers(token);
              showToast('success', 'User created successfully!');
            }}
          />
        )}
        {editTarget && (
          <EditUserModal
            user={editTarget}
            token={token}
            properties={properties}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              fetchUsers(token);
              showToast('success', 'User updated successfully!');
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            user={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
        {showAdvisorSettings && (
          <AdvisorSettingsModal
            onClose={() => setShowAdvisorSettings(false)}
            token={token}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 font-sans text-sm font-semibold shadow-2xl ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
