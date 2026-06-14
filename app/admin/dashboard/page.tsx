'use client';

import {
  Building2,
  CheckCircle2,
  Plus,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Briefcase,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import ActivityTimeline from '@/src/components/admin/ActivityTimeline';
import DocumentStatsChart from '@/src/components/admin/ChartComponents/DocumentStatsChart';
import QuickActions from '@/src/components/admin/QuickActions';
import UserGrowthChart from '@/src/components/admin/ChartComponents/UserGrowthChart';
import type { UserProfile } from '@/src/lib/supabase/types';
import { supabase } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUsers, useAnalytics, useActivities } from '@/src/hooks/useDashboard';
import { Badge } from '@/src/components/admin/helpers/Badge';
import { renderPropertyInterestTags } from '@/src/components/admin/helpers/PropertyInterestTags';
import { CreateUserModal } from '@/src/components/admin/modals/CreateUserModal';
import { EditUserModal } from '@/src/components/admin/modals/EditUserModal';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';
import { AdvisorSettingsModal } from '@/src/components/admin/modals/AdvisorSettingsModal';
import { MakeEmployeeConfirm } from '@/src/components/admin/modals/MakeEmployeeConfirm';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth state
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [employeeTarget, setEmployeeTarget] = useState<UserProfile | null>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [properties, setProperties] = useState<Array<{ name: string; slug: string }>>([]);

  // React Query hooks — data fetching with caching
  const { data: usersData, isLoading: usersLoading } = useUsers(token);
  const { data: analytics } = useAnalytics(token);
  const { data: activitiesData } = useActivities(token);
  const users = usersData?.users ?? [];
  const activities = activitiesData?.activities ?? [];
  const loading = authLoading || (usersLoading && !usersData);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth check + parallel data fetch
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
        return;
      }

      // Profile check + properties fetch in parallel (no dependency between them)
      const [profileResult, propertiesResult] = await Promise.all([
        supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single(),
        supabase
          .from('properties')
          .select('name, slug')
          .eq('active', true)
          .order('name', { ascending: true }),
      ]);

      const { data: profile, error } = profileResult;

      if (error || !profile || profile?.role !== 'admin') {
        router.replace('/admin');
        return;
      }

      setToken(session.access_token);
      setCurrentAdminId(session.user.id);
      setAdminName(profile?.full_name || session.user.email || 'Admin');
      setAuthLoading(false);

      if (propertiesResult.data) setProperties(propertiesResult.data);
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
      // React Query will automatically refetch users on next mount
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('success', `${deleteTarget.full_name} has been deleted.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleMakeEmployee = async () => {
    if (!employeeTarget) return;
    setEmployeeLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${employeeTarget.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'employee' }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Failed to update role');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('success', `${employeeTarget.full_name} is now an employee.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setEmployeeLoading(false);
      setEmployeeTarget(null);
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
              queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={() => router.push('/admin/employees')}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Briefcase className="h-3.5 w-3.5" /> Manage Employees
          </button>
          <button
            onClick={() => setShowAdvisorSettings(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-widest text-gray-700 uppercase transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0e0e14]/85 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            Manage Public Team
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
            <div className="overflow-x-auto">
              <table className="w-full animate-pulse font-sans text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-white/5 dark:bg-white/5">
                    {[
                      'User Profile',
                      'Contact Info',
                      'Property Interests',
                      'Joined Date',
                      'Actions',
                    ].map((h, idx) => (
                      <th
                        key={h}
                        className={`px-6 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase ${idx === 4 ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`h-3 rounded bg-gray-200 dark:bg-white/5 ${idx === 4 ? 'ml-auto w-16' : 'w-24'}`}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-gray-150 divide-y dark:divide-white/5">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {/* User Profile */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200 dark:bg-white/5" />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/5" />
                            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/5" />
                          </div>
                        </div>
                      </td>
                      {/* Contact Info */}
                      <td className="px-6 py-4.5">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-40 rounded bg-gray-200 dark:bg-white/5" />
                          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-white/5" />
                        </div>
                      </td>
                      {/* Property Interests */}
                      <td className="px-6 py-4.5">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-white/5" />
                          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/5" />
                        </div>
                      </td>
                      {/* Joined Date */}
                      <td className="px-6 py-4.5">
                        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/5" />
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/5" />
                          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/5" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                      className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
                    >
                      {/* User Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                            {u.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {u.full_name}
                              </span>
                              <Badge role={u.role} />
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {u.email}
                            </div>
                            {u.notes && (
                              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                <FileText className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                <span className="max-w-[200px] truncate" title={u.notes}>
                                  {u.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          {u.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {u.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                          {u.real_email ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <span className="max-w-[160px] truncate" title={u.real_email}>
                                {u.real_email}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Property Interests */}
                      <td className="w-[300px] px-6 py-4">
                        {u.property_interest ? (
                          renderPropertyInterestTags(u.property_interest, properties)
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="w-[120px] px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.role === 'client' && (
                            <button
                              onClick={() => setEmployeeTarget(u)}
                              className="text-brand-gold hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                              title="Make Employee"
                            >
                              <Briefcase className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditTarget(u)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-300"
                            title="Edit User Profile"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {u.id !== currentAdminId && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
              queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
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
              queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
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
        {employeeTarget && (
          <MakeEmployeeConfirm
            user={employeeTarget}
            onClose={() => setEmployeeTarget(null)}
            onConfirm={handleMakeEmployee}
            loading={employeeLoading}
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
