'use client';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  Star,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pending',
    color:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/30',
  },
  {
    value: 'contacted',
    label: 'Contacted',
    color:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500/30',
  },
  {
    value: 'approved',
    label: 'Approved',
    color:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500/30',
  },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

interface Registration {
  id: string;
  submission_id: string | null;
  name: string;
  last_name: string | null;
  email: string;
  phone: string;
  so_wo_do: string | null;
  preferred_date: string | null;
  aadhar_number: string | null;
  pan_number: string | null;
  photo_url: string | null;
  pan_card_file_url: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  advisor_name: string | null;
  project: string | null;
  property_size: string | null;
  property_type: string | null;
  plot_preference: string | null;
  payment_plan: string | null;
  payment_mode: string | null;
  scheme_amount: string | null;
  property_interest: string | null;
  message: string | null;
  status: string;
  is_important?: boolean;
  created_at: string;
}

interface FilterOptions {
  projects: string[];
  advisors: string[];
  propertyTypes: string[];
  propertySizes: string[];
  plotPreferences: string[];
  paymentPlans: string[];
  paymentModes: string[];
}

interface Filters {
  project: string;
  advisor: string;
  propertyType: string;
  propertySize: string;
  plotPreference: string;
  paymentPlan: string;
  paymentMode: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date' },
  { value: 'submission_id', label: 'Submission ID' },
  { value: 'name', label: 'Name' },
  { value: 'project', label: 'Project' },
  { value: 'advisor_name', label: 'Advisor' },
  { value: 'property_type', label: 'Property Type' },
  { value: 'scheme_amount', label: 'Scheme Amount' },
  { value: 'status', label: 'Status' },
];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="min-w-0 flex-1">
      <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus:border-brand-gold mt-1 w-full appearance-none truncate rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 transition-colors outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-300"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function DeleteConfirmModal({
  reg,
  onConfirm,
  onCancel,
  loading,
}: {
  reg: Registration;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-[#0e0e14]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-brand-navy mb-2 font-serif text-lg font-semibold dark:text-white">
            Delete Registration
          </h3>
          <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this registration?
          </p>
          <p className="mb-6 text-sm font-semibold text-gray-900 dark:text-white">
            {reg.name} {reg.last_name || ''} ({reg.email})
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailModal({
  reg,
  onClose,
  onStatusChange,
  onDelete,
}: {
  reg: Registration;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (reg: Registration) => void;
}) {
  const field = (label: string, value: string | null | undefined) =>
    value ? (
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:border-brand-gold/20 relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:bg-[#0e0e14]"
      >
        <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/8">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h2 className="text-brand-navy font-serif text-lg font-semibold dark:text-white">
                {reg.name} {reg.last_name || ''}
              </h2>
              <StatusBadge status={reg.status} />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500">{reg.email}</p>
              {reg.submission_id && (
                <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                  {reg.submission_id}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reg.status}
              onChange={(e) => onStatusChange(reg.id, e.target.value)}
              className="focus:border-brand-gold appearance-none rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 uppercase outline-none dark:border-white/10 dark:bg-[#111118] dark:text-gray-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onDelete(reg)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              title="Delete registration"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="hover:text-brand-gold cursor-pointer text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Submission ID', reg.submission_id)}
              {field('First Name', reg.name)}
              {field('Last Name', reg.last_name)}
              {field('Mobile', reg.phone)}
              {field('Email', reg.email)}
              {field('S/O, W/O, D/O', reg.so_wo_do)}
              {field('Date of Birth', reg.preferred_date)}
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Documents
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Aadhar Number', reg.aadhar_number)}
              {field('PAN Number', reg.pan_number)}
              {reg.photo_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Photo
                  </p>
                  <a
                    href={reg.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View Photo
                  </a>
                </div>
              )}
              {reg.pan_card_file_url && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    PAN Card
                  </p>
                  <a
                    href={reg.pan_card_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold text-sm underline"
                  >
                    View PAN Card
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('State', reg.state)}
              {field('City', reg.city)}
              {field('Address', reg.address)}
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold mb-3 text-xs font-bold tracking-widest uppercase">
              Property & Payment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Advisor', reg.advisor_name)}
              {field('Project', reg.project)}
              {field('Property Size', reg.property_size)}
              {field('Property Type', reg.property_type)}
              {field('Plot Preference', reg.plot_preference)}
              {field('Payment Plan', reg.payment_plan)}
              {field('Payment Mode', reg.payment_mode)}
              {field('Scheme Amount', reg.scheme_amount)}
            </div>
          </div>

          {field('Message', reg.message)}

          <p className="border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-white/8">
            Submitted on{' '}
            {new Date(reg.created_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
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
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-md dark:bg-black/85">
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

export default function AdminRegistrations() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Filters>({
    project: '',
    advisor: '',
    propertyType: '',
    propertySize: '',
    plotPreference: '',
    paymentPlan: '',
    paymentMode: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    projects: [],
    advisors: [],
    propertyTypes: [],
    propertySizes: [],
    plotPreferences: [],
    paymentPlans: [],
    paymentModes: [],
  });

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const fetchFilterOptions = useCallback(async (tkn: string) => {
    const res = await fetch('/api/admin/registrations?limit=1000', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (!res.ok) return;
    const json = await res.json();
    const regs: Registration[] = json.registrations || [];

    const unique = (arr: (string | null | undefined)[]) =>
      [...new Set(arr.filter(Boolean) as string[])].sort();

    setFilterOptions({
      projects: unique(regs.map((r) => r.project)),
      advisors: unique(regs.map((r) => r.advisor_name)),
      propertyTypes: unique(regs.map((r) => r.property_type)),
      propertySizes: unique(regs.map((r) => r.property_size)),
      plotPreferences: unique(regs.map((r) => r.plot_preference)),
      paymentPlans: unique(regs.map((r) => r.payment_plan)),
      paymentModes: unique(regs.map((r) => r.payment_mode)),
    });
  }, []);

  const fetchRegistrations = useCallback(
    async (tkn: string, q: string = '', p: number = 1) => {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50', page: String(p) });
      if (q) params.set('search', q);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      if (filters.project) params.set('project', filters.project);
      if (filters.advisor) params.set('advisor', filters.advisor);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.propertySize) params.set('propertySize', filters.propertySize);
      if (filters.plotPreference) params.set('plotPreference', filters.plotPreference);
      if (filters.paymentPlan) params.set('paymentPlan', filters.paymentPlan);
      if (filters.paymentMode) params.set('paymentMode', filters.paymentMode);
      if (filters.status) params.set('status', filters.status);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const res = await fetch(`/api/admin/registrations?${params}`, {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.registrations);
        setTotal(json.total);
        setHasMore(json.hasMore);
        setPage(json.page);
      }
      setLoading(false);
    },
    [sortBy, sortOrder, filters]
  );

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      const tkn = session.access_token;
      setToken(tkn);
      fetchRegistrations(tkn);
      fetchFilterOptions(tkn);
    });
  }, [router, fetchRegistrations, fetchFilterOptions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations(token, search, 1);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      project: '',
      advisor: '',
      propertyType: '',
      propertySize: '',
      plotPreference: '',
      paymentPlan: '',
      paymentMode: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast('success', `Status updated to ${newStatus}`);
      fetchRegistrations(token, search, page);
      if (selectedReg?.id === id) {
        setSelectedReg((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('success', 'Registration deleted');
      setDeleteTarget(null);
      setSelectedReg(null);
      fetchRegistrations(token, search, page);
    } catch {
      showToast('error', 'Failed to delete registration');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const params = new URLSearchParams({ limit: '1000' });
    if (search) params.set('search', search);
    if (filters.project) params.set('project', filters.project);
    if (filters.advisor) params.set('advisor', filters.advisor);
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.propertySize) params.set('propertySize', filters.propertySize);
    if (filters.plotPreference) params.set('plotPreference', filters.plotPreference);
    if (filters.paymentPlan) params.set('paymentPlan', filters.paymentPlan);
    if (filters.paymentMode) params.set('paymentMode', filters.paymentMode);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    const res = await fetch(`/api/admin/registrations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const json = await res.json();
    const regs: Registration[] = json.registrations || [];

    const headers = [
      'Submission ID',
      'Name',
      'Last Name',
      'Email',
      'Phone',
      'S/O W/O D/O',
      'DOB',
      'Aadhar',
      'PAN',
      'State',
      'City',
      'Address',
      'Advisor',
      'Project',
      'Property Size',
      'Property Type',
      'Plot Preference',
      'Payment Plan',
      'Payment Mode',
      'Scheme Amount',
      'Status',
      'Date',
    ];

    const rows = regs.map((r) => [
      r.submission_id || '',
      r.name,
      r.last_name || '',
      r.email,
      r.phone,
      r.so_wo_do || '',
      r.preferred_date || '',
      r.aadhar_number || '',
      r.pan_number || '',
      r.state || '',
      r.city || '',
      r.address || '',
      r.advisor_name || '',
      r.project || '',
      r.property_size || '',
      r.property_type || '',
      r.plot_preference || '',
      r.payment_plan || '',
      r.payment_mode || '',
      r.scheme_amount || '',
      r.status,
      new Date(r.created_at).toLocaleDateString('en-IN'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', `Exported ${regs.length} registrations`);
  };

  // Refetch when filters/sort change
  useEffect(() => {
    if (token) fetchRegistrations(token, search, 1);
  }, [filters, sortBy, sortOrder]);

  const startItem = total === 0 ? 0 : (page - 1) * 50 + 1;
  const endItem = Math.min(page * 50, total);

  return (
    <div className="relative w-full font-sans">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="bg-brand-navy-light/10 absolute top-0 right-0 h-[450px] w-[450px] rounded-full blur-[120px]" />
        <div className="bg-brand-gold/5 absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
            Property{' '}
            <span
              className="text-gradient-gold animate-bg-pan inline-block italic"
              style={{
                backgroundSize: '200% 200%',
                backgroundImage:
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
              }}
            >
              Registrations
            </span>
          </h1>
          <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
            View and manage all property registration submissions.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="dark:border-brand-gold/15 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:bg-[#0e0e14]/65">
            <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
            <div className="mb-3 flex items-center justify-between">
              <div className="bg-brand-gold/10 border-brand-gold/25 flex h-11 w-11 items-center justify-center rounded-lg border">
                <FileText className="text-brand-gold h-5 w-5" />
              </div>
            </div>
            <p className="text-brand-navy text-3xl font-bold tracking-tight dark:text-white">
              {total}
            </p>
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Total Registrations
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="text-brand-gold absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by submission ID, name, email, phone, aadhar, advisor or project..."
              className="focus:border-brand-gold focus:ring-brand-gold/15 w-full rounded-lg border border-gray-200 bg-white py-3 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-white dark:placeholder-gray-600"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchRegistrations(token, '', 1);
                }}
                className="hover:text-brand-gold absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="focus:border-brand-gold appearance-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:border-brand-gold hover:text-brand-gold flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors dark:border-white/10 dark:bg-[#0e0e14]/85"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-3 text-xs font-bold tracking-widest uppercase transition-all ${
              showFilters || activeFilterCount > 0
                ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5'
            }`}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-brand-gold text-brand-navy flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>

          <button
            onClick={() => fetchRegistrations(token, search, page)}
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
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <div className="dark:border-brand-gold/15 rounded-xl border border-gray-200 bg-white/80 p-5 backdrop-blur-xl dark:bg-[#0e0e14]/65">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-brand-navy text-xs font-bold tracking-widest dark:text-white">
                    FILTER BY
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-brand-gold hover:text-brand-gold/80 cursor-pointer text-xs font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {/* Status filter */}
                  <div className="min-w-0 flex-1">
                    <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => updateFilter('status', e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full appearance-none truncate rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-300"
                    >
                      <option value="">All</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FilterDropdown
                    label="Project"
                    value={filters.project}
                    options={filterOptions.projects}
                    onChange={(v) => updateFilter('project', v)}
                  />
                  <FilterDropdown
                    label="Advisor"
                    value={filters.advisor}
                    options={filterOptions.advisors}
                    onChange={(v) => updateFilter('advisor', v)}
                  />
                  <FilterDropdown
                    label="Property Type"
                    value={filters.propertyType}
                    options={filterOptions.propertyTypes}
                    onChange={(v) => updateFilter('propertyType', v)}
                  />
                  <FilterDropdown
                    label="Property Size"
                    value={filters.propertySize}
                    options={filterOptions.propertySizes}
                    onChange={(v) => updateFilter('propertySize', v)}
                  />
                  <FilterDropdown
                    label="Plot Preference"
                    value={filters.plotPreference}
                    options={filterOptions.plotPreferences}
                    onChange={(v) => updateFilter('plotPreference', v)}
                  />
                  <FilterDropdown
                    label="Payment Plan"
                    value={filters.paymentPlan}
                    options={filterOptions.paymentPlans}
                    onChange={(v) => updateFilter('paymentPlan', v)}
                  />
                  <FilterDropdown
                    label="Payment Mode"
                    value={filters.paymentMode}
                    options={filterOptions.paymentModes}
                    onChange={(v) => updateFilter('paymentMode', v)}
                  />
                  <div className="min-w-0 flex-1">
                    <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      className="focus:border-brand-gold mt-1 w-full rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none dark:border-white/10 dark:bg-[#0e0e14] dark:text-gray-300"
                    />
                  </div>
                </div>

                {/* Active filter chips */}
                {activeFilterCount > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filters.status && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Status: {STATUS_MAP[filters.status]?.label || filters.status}
                        <button onClick={() => updateFilter('status', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.project && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Project: {filters.project}
                        <button onClick={() => updateFilter('project', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.advisor && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Advisor: {filters.advisor}
                        <button onClick={() => updateFilter('advisor', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.propertyType && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Type: {filters.propertyType}
                        <button onClick={() => updateFilter('propertyType', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.propertySize && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Size: {filters.propertySize}
                        <button onClick={() => updateFilter('propertySize', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.plotPreference && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Plot: {filters.plotPreference}
                        <button onClick={() => updateFilter('plotPreference', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.paymentPlan && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Plan: {filters.paymentPlan}
                        <button onClick={() => updateFilter('paymentPlan', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.paymentMode && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        Mode: {filters.paymentMode}
                        <button onClick={() => updateFilter('paymentMode', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.dateFrom && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        From: {filters.dateFrom}
                        <button onClick={() => updateFilter('dateFrom', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {filters.dateTo && (
                      <span className="bg-brand-gold/10 text-brand-gold flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold">
                        To: {filters.dateTo}
                        <button onClick={() => updateFilter('dateTo', '')}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/8 dark:bg-[#0e0e14]/65">
          <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent" />

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm animate-pulse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                    <th className="w-10 px-4 py-4"></th>
                    {[
                      'Submission ID',
                      'Name',
                      'Email',
                      'Phone',
                      'Project',
                      'Advisor',
                      'Status',
                      'Date',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-400 uppercase"
                      >
                        <div className="h-3 w-16 bg-gray-250 dark:bg-white/5 rounded" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-4.5"></td>
                      {/* Submission ID */}
                      <td className="px-6 py-4.5"><div className="h-4 w-12 bg-gray-200 dark:bg-white/5 rounded font-mono" /></td>
                      {/* Name */}
                      <td className="px-6 py-4.5"><div className="h-4 w-28 bg-gray-200 dark:bg-white/5 rounded font-semibold" /></td>
                      {/* Email */}
                      <td className="px-6 py-4.5"><div className="h-3.5 w-32 bg-gray-200 dark:bg-white/5 rounded" /></td>
                      {/* Phone */}
                      <td className="px-6 py-4.5"><div className="h-3.5 w-24 bg-gray-200 dark:bg-white/5 rounded" /></td>
                      {/* Project */}
                      <td className="px-6 py-4.5"><div className="h-4 w-20 bg-gray-200 dark:bg-white/5 rounded" /></td>
                      {/* Advisor */}
                      <td className="px-6 py-4.5"><div className="h-4 w-20 bg-gray-200 dark:bg-white/5 rounded" /></td>
                      {/* Status */}
                      <td className="px-6 py-4.5"><div className="h-5 w-16 bg-gray-200 dark:bg-white/5 rounded-full" /></td>
                      {/* Date */}
                      <td className="px-6 py-4.5"><div className="h-3.5 w-16 bg-gray-200 dark:bg-white/5 rounded" /></td>
                      {/* Actions */}
                      <td className="px-6 py-4.5"><div className="h-8 w-20 bg-gray-200 dark:bg-white/5 rounded-lg" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-24 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {search || activeFilterCount > 0 ? 'No matches found.' : 'No registrations yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 dark:bg-white/2">
                    <th className="w-10 px-4 py-4"></th>
                    {[
                      'Submission ID',
                      'Name',
                      'Email',
                      'Phone',
                      'Project',
                      'Advisor',
                      'Status',
                      'Date',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, i) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className="group border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-[#111118]/60"
                    >
                      <td className="px-4 py-4.5 text-center">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const nextVal = !reg.is_important;
                            // Optimistic UI update
                            setRegistrations((prev) =>
                              prev.map((r) =>
                                r.id === reg.id ? { ...r, is_important: nextVal } : r
                              )
                            );
                            try {
                              const res = await fetch('/api/admin/registrations', {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ id: reg.id, is_important: nextVal }),
                              });
                              if (!res.ok) throw new Error();
                              showToast(
                                'success',
                                nextVal ? 'Marked as important' : 'Unmarked from important'
                              );
                            } catch {
                              // Rollback on error
                              setRegistrations((prev) =>
                                prev.map((r) =>
                                  r.id === reg.id ? { ...r, is_important: !nextVal } : r
                                )
                              );
                              showToast('error', 'Failed to update status');
                            }
                          }}
                          className="flex items-center justify-center text-gray-300 transition-colors hover:text-amber-500"
                          title={reg.is_important ? 'Important (starred)' : 'Mark as important'}
                        >
                          <Star
                            className={`h-4.5 w-4.5 transition-all ${
                              reg.is_important
                                ? 'scale-110 fill-amber-500 text-amber-500'
                                : 'hover:scale-110 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4.5">
                        {reg.submission_id ? (
                          <span className="bg-brand-gold/10 text-brand-gold inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold tracking-wider">
                            {reg.submission_id}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-semibold tracking-wide text-gray-900 dark:text-white">
                          {reg.name} {reg.last_name || ''}
                        </div>
                        {reg.so_wo_do && (
                          <div className="mt-0.5 text-xs text-gray-400">{reg.so_wo_do}</div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-medium text-gray-700 dark:text-gray-300">
                        {reg.email}
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">{reg.phone}</td>
                      <td className="px-6 py-4.5">
                        <span className="text-brand-gold/90 font-semibold">
                          {reg.project || reg.property_interest || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 dark:text-gray-300">
                        {reg.advisor_name || '—'}
                      </td>
                      <td className="px-6 py-4.5">
                        <select
                          value={reg.status}
                          onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="focus:border-brand-gold appearance-none rounded border border-transparent bg-transparent px-1 py-0.5 text-[10px] font-bold uppercase outline-none hover:border-gray-200 dark:hover:border-white/10"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4.5 text-xs whitespace-nowrap text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="border-brand-gold/20 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase"
                          >
                            <Eye className="h-3 w-3" /> View
                          </button>
                          <button
                            onClick={() => setDeleteTarget(reg)}
                            className="flex cursor-pointer items-center justify-center rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 dark:border-white/8">
              <p className="text-xs text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{startItem}</span>
                {' - '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{endItem}</span>
                {' of '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchRegistrations(token, search, page - 1)}
                  disabled={page <= 1}
                  className="hover:border-brand-gold hover:text-brand-gold flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {page}
                </span>
                <button
                  onClick={() => fetchRegistrations(token, search, page + 1)}
                  disabled={!hasMore}
                  className="hover:border-brand-gold hover:text-brand-gold flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedReg && (
          <DetailModal
            reg={selectedReg}
            onClose={() => setSelectedReg(null)}
            onStatusChange={handleStatusChange}
            onDelete={(r) => {
              setSelectedReg(null);
              setDeleteTarget(r);
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            reg={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-2xl ${
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
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
