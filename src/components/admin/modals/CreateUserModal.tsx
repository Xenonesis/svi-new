'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Eye, EyeOff, FileText, Mail, Phone, Plus, X } from 'lucide-react';
import { PROPERTY_LABELS } from '../helpers/propertyLabels';
import { INPUT_CLS, LABEL_CLS, MODAL_OVERLAY_CLASS } from '../helpers/formStyles';
import { getDisplayProperties, togglePropertySelection } from '../helpers/propertyUtils';

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

  const displayProperties = getDisplayProperties(properties);

  const selectedProperties = form.property_interest ? form.property_interest.split(',') : [];

  const handlePropertyToggle = (slug: string) => {
    setForm((p) => ({
      ...p,
      property_interest: togglePropertySelection(p.property_interest, slug),
    }));
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
