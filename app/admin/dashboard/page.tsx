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

function Badge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase ${
        role === 'admin'
          ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/25 border'
          : 'border border-gray-200 bg-gray-100 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
      }`}
    >
      {role === 'admin' ? (
        <Shield className="text-brand-gold h-2.5 w-2.5" />
      ) : (
        <Users className="h-2.5 w-2.5 text-gray-500 transition-colors duration-300 dark:text-gray-400" />
      )}
      {role}
    </span>
  );
}

// ── Create User Modal ────────────────────────────────────────────────────────
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

function CreateUserModal({ onClose, onSuccess, token }: CreateUserModalProps) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    property_interest: '',
    notes: '',
  });
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
    if (!form.email || !form.password || !form.full_name) {
      setError('Name, email and password are required.');
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
              Create Client User
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
              <label className={labelCls}>Email Address *</label>
              <div className="relative">
                <Mail className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
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
              <label className={labelCls}>Phone Number</label>
              <div className="relative">
                <Phone className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98000 00000"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Property Interest</label>
              <div className="relative">
                <Building2 className="text-brand-gold absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                <select
                  name="property_interest"
                  value={form.property_interest}
                  onChange={handleChange}
                  className={`${inputCls} appearance-none rounded-none pr-8 pl-9`}
                >
                  <option value="">Select option</option>
                  <option value="residential_3bhk">3BHK Residential</option>
                  <option value="residential_4bhk">4BHK Residential</option>
                  <option value="residential_plot">Residential Plot</option>
                  <option value="commercial">Commercial Property</option>
                  <option value="investment">Investment / General</option>
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Notes (Internal)</label>
              <div className="relative">
                <FileText className="text-brand-gold absolute top-3 left-3 h-3.5 w-3.5" />
                <textarea
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
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

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      const tkn = session.access_token;
      setToken(tkn);
      setAdminName(profile?.full_name || session.user.email || 'Admin');

      // Fetch all dashboard data in parallel instead of sequentially
      const authHeaders = { Authorization: `Bearer ${tkn}` };
      const [usersRes, analyticsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeaders }),
        fetch('/api/admin/analytics', { headers: authHeaders }),
        fetch('/api/admin/activities?limit=10', { headers: authHeaders }),
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
              Manage authorized client accounts and monitor administrative access permissions.
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
              label: 'Client Profiles',
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
              <RefreshCw className="text-brand-gold mr-3 h-5 w-5 animate-spin" /> Loading client
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
                  <tr className="dark:border-brand-gold/15 border-b border-gray-200 bg-gray-50/50 transition-colors duration-300 dark:bg-white/2">
                    {[
                      'Name & Notes',
                      'Email Address',
                      'Phone Number',
                      'Property Interest',
                      'Access Role',
                      'Created Date',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-[9px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className="group border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/5 dark:hover:bg-[#111118]/60"
                    >
                      <td className="px-6 py-4.5">
                        <div className="font-semibold tracking-wide text-gray-900 transition-colors duration-300 dark:text-white">
                          {u.full_name}
                        </div>
                        {u.notes ? (
                          <div
                            className="mt-1 max-w-[200px] truncate text-xs text-gray-500"
                            title={u.notes}
                          >
                            {u.notes}
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-gray-400 italic transition-colors duration-300 dark:text-gray-600">
                            No notes added
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-medium text-gray-700 transition-colors duration-300 dark:text-gray-300">
                        {u.email}
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 transition-colors duration-300 dark:text-gray-300">
                        {u.phone || <span className="text-gray-400 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-4.5 text-gray-700 transition-colors duration-300 dark:text-gray-300">
                        {u.property_interest ? (
                          <span className="text-brand-gold/90 font-semibold">
                            {PROPERTY_LABELS[u.property_interest] || u.property_interest}
                          </span>
                        ) : (
                          <span className="text-gray-400 transition-colors duration-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge role={u.role} />
                      </td>
                      <td className="px-6 py-4.5 text-xs whitespace-nowrap text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4.5">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="animate-hero-fade-in flex cursor-pointer items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold tracking-wider text-red-400 uppercase opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        )}
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
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              fetchUsers(token);
              showToast('success', 'User created successfully!');
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
