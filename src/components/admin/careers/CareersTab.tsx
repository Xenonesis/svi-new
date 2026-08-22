'use client';

import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Search,
  Target,
  Users,
  Star,
  Zap,
  Heart,
  Award,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  getSettingsDensity,
  getSettingsInputClass,
  SETTINGS_LABEL_CLASS,
} from '../settings/helpers';

// Map icon string names to actual components
const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase size={20} />,
  Users: <Users size={20} />,
  Target: <Target size={20} />,
  Star: <Star size={20} />,
  Zap: <Zap size={20} />,
  Heart: <Heart size={20} />,
  Award: <Award size={20} />,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const JOB_TYPES = ['Onsite', 'Freelance', 'Hybrid', 'Remote'];

interface Career {
  id: string;
  title: string;
  type: string;
  salary: string;
  description?: string | null;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

interface CareersTabProps {
  token: string | null;
  isCompact?: boolean;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export function CareersTab({ token, isCompact = false, showToast }: CareersTabProps) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Onsite');
  const [formSalary, setFormSalary] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Briefcase');
  const [formActive, setFormActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  const { densityPadding, densityGridGap, densitySecSpacing } = getSettingsDensity(isCompact);
  const inputClass = getSettingsInputClass(densityPadding);

  const fetchCareers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/careers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch careers');
      setCareers(data.careers || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load careers.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [token]);

  const resetForm = () => {
    setFormTitle('');
    setFormType('Onsite');
    setFormSalary('');
    setFormDescription('');
    setFormIcon('Briefcase');
    setFormActive(true);
    setFormSortOrder(0);
    setEditingId(null);
    setShowAddForm(false);
  };

  const startEdit = (career: Career) => {
    setEditingId(career.id);
    setFormTitle(career.title);
    setFormType(career.type);
    setFormSalary(career.salary);
    setFormDescription(career.description ?? '');
    setFormIcon(career.icon);
    setFormActive(career.is_active);
    setFormSortOrder(career.sort_order);
    setShowAddForm(true);
    // Scroll to form
    setTimeout(() => {
      document
        .getElementById('career-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formType || !formSalary.trim()) {
      showToast('error', 'Title, type, and salary are required.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingId ?? undefined,
          title: formTitle.trim(),
          type: formType,
          salary: formSalary.trim(),
          description: formDescription.trim() || null,
          icon: formIcon,
          is_active: formActive,
          sort_order: formSortOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Save failed');
      showToast('success', editingId ? 'Career updated successfully!' : 'Career listing created!');
      resetForm();
      fetchCareers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save career.';
      showToast('error', msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (career: Career) => {
    setActionLoading(career.id);
    try {
      const res = await fetch('/api/admin/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...career, is_active: !career.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Toggle failed');
      showToast('success', `Career ${!career.is_active ? 'activated' : 'deactivated'}.`);
      fetchCareers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle career.';
      showToast('error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    setDeleteConfirm(null);
    try {
      const res = await fetch(`/api/admin/careers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Delete failed');
      showToast('success', 'Career listing deleted.');
      fetchCareers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete career.';
      showToast('error', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReorder = async (career: Career, direction: 'up' | 'down') => {
    const sorted = [...careers].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((c) => c.id === career.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapTarget = sorted[swapIdx];
    setActionLoading(career.id);
    try {
      await Promise.all([
        fetch('/api/admin/careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...career, sort_order: swapTarget.sort_order }),
        }),
        fetch('/api/admin/careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...swapTarget, sort_order: career.sort_order }),
        }),
      ]);
      fetchCareers();
    } catch {
      showToast('error', 'Failed to reorder careers.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCareers = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.salary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiltered = [...filteredCareers].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={`space-y-6 font-sans ${densitySecSpacing}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Briefcase className="text-brand-gold h-5 w-5" />
            Career Listings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage job openings shown on the public careers page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCareers}
            disabled={loading}
            className="hover:text-brand-gold flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-gray-300 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => {
              if (showAddForm && !editingId) {
                resetForm();
              } else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold tracking-wider uppercase shadow transition-all hover:brightness-110"
          >
            {showAddForm && !editingId ? <X size={13} /> : <Plus size={13} />}
            {showAddForm && !editingId ? 'Cancel' : 'Add Career'}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            id="career-form"
            key="career-form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit}
            className="dark:bg-brand-dark-surface/60 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/8"
          >
            <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-white">
              {editingId ? 'Edit Career Listing' : 'New Career Listing'}
            </h3>

            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${densityGridGap}`}>
              {/* Title */}
              <div className="sm:col-span-2">
                <label className={SETTINGS_LABEL_CLASS}>Job Title *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Business Development Manager"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className={SETTINGS_LABEL_CLASS}>Job Type *</label>
                <select
                  className={inputClass}
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary */}
              <div>
                <label className={SETTINGS_LABEL_CLASS}>Salary / Range *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Up to ₹40,000/mo"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className={SETTINGS_LABEL_CLASS}>Icon</label>
                <select
                  className={inputClass}
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className={SETTINGS_LABEL_CLASS}>Sort Order</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  min={0}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={SETTINGS_LABEL_CLASS}>Description (Optional)</label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Short description of the role..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    formActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-gray-200 bg-white text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                  }`}
                >
                  {formActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {formActive ? 'Active (Visible on site)' : 'Inactive (Hidden from site)'}
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="bg-brand-gold text-brand-navy flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold tracking-wider uppercase shadow transition-all hover:brightness-110 disabled:opacity-60"
              >
                {saveLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <Check size={13} />
                )}
                {editingId ? 'Save Changes' : 'Create Listing'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-sm text-gray-900 placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
          placeholder="Search by title, type, or salary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium dark:bg-white/8">
          {careers.length} total
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          {careers.filter((c) => c.is_active).length} active
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium dark:bg-white/8">
          {careers.filter((c) => !c.is_active).length} inactive
        </span>
      </div>

      {/* Career Listings Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-white/10">
          <Briefcase className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No careers match your search.' : 'No career listings yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="text-brand-gold mt-3 text-xs font-semibold underline-offset-2 hover:underline"
            >
              Add your first career listing
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sortedFiltered.map((career, idx) => (
              <motion.div
                key={career.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between dark:bg-white/3 ${
                  career.is_active
                    ? 'border-gray-200 dark:border-white/8'
                    : 'border-dashed border-gray-200 opacity-60 dark:border-white/5'
                }`}
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleReorder(career, 'up')}
                      disabled={idx === 0 || !!actionLoading}
                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-gray-200"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleReorder(career, 'down')}
                      disabled={idx === sortedFiltered.length - 1 || !!actionLoading}
                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-gray-200"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="bg-brand-gold/10 text-brand-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    {ICON_MAP[career.icon] ?? <Briefcase size={20} />}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {career.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded-sm bg-gray-100 px-1.5 py-0.5 font-medium dark:bg-white/8">
                        {career.type}
                      </span>
                      <span className="text-brand-gold font-semibold">{career.salary}</span>
                      {career.description && (
                        <span className="max-w-xs truncate text-gray-400 italic dark:text-gray-500">
                          {career.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(career)}
                    disabled={actionLoading === career.id}
                    title={career.is_active ? 'Deactivate listing' : 'Activate listing'}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                      career.is_active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                    }`}
                  >
                    {actionLoading === career.id ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : career.is_active ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {career.is_active ? 'Active' : 'Inactive'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => startEdit(career)}
                    className="hover:text-brand-gold rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-all hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                    title="Edit career"
                  >
                    <Edit2 size={13} />
                  </button>

                  {/* Delete */}
                  {deleteConfirm === career.id ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 dark:border-red-500/30 dark:bg-red-500/10">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDelete(career.id)}
                        className="rounded bg-red-500 p-0.5 text-white hover:bg-red-600"
                        title="Confirm delete"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                        title="Cancel"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(career.id)}
                      disabled={!!actionLoading}
                      className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                      title="Delete career"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info notice */}
      {!loading && careers.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            Active listings are shown publicly on the{' '}
            <a
              href="/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              /careers page
            </a>
            . Changes take effect immediately.
          </span>
        </div>
      )}
    </div>
  );
}
