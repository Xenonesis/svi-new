'use client';

import { toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ActivityTimeline from '@/src/components/admin/ActivityTimeline';
import QuickActions from '@/src/components/admin/QuickActions';
import type { UserProfile } from '@/src/lib/supabase/types';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';
import { useUsers, useAnalytics, useActivities } from '@/src/hooks/useDashboard';
import { CreateUserModal } from '@/src/components/admin/modals/CreateUserModal';
import { EditUserModal } from '@/src/components/admin/modals/EditUserModal';
import { DeleteConfirm } from '@/src/components/admin/modals/DeleteConfirm';
import { AdvisorSettingsModal } from '@/src/components/admin/modals/AdvisorSettingsModal';
import { AddEmployeeModal } from '@/src/components/admin/modals/AddEmployeeModal';

import { DashboardStatsCards } from '@/src/components/admin/dashboard/DashboardStatsCards';
import { DashboardChartsGrid } from '@/src/components/admin/dashboard/DashboardChartsGrid';
import { DashboardUsersTable } from '@/src/components/admin/dashboard/DashboardUsersTable';

const GRID_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.05) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth state (initialized once in app/admin/layout.tsx)
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const authLoading = useAuthStore((s) => s.loading);
  const currentAdminId = userId || '';

  // UI state
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<Record<string, boolean>>({});
  const [properties, setProperties] = useState<Array<{ name: string; slug: string }>>([]);

  // React Query hooks — data fetching with caching
  const { data: usersData, isLoading: usersLoading } = useUsers(token);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(token);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(token);
  const users = usersData?.users ?? [];
  const activities = activitiesData?.activities ?? [];
  const loading = authLoading || (usersLoading && !usersData);
  const isStatsLoading = authLoading || analyticsLoading || (usersLoading && !usersData);

  const showToast = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  // Redirect to login if not authenticated as admin
  useEffect(() => {
    if (authLoading) return;
    if (!token || !isAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, token, isAdmin, router]);

  // Fetch active properties
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    supabase
      .from('properties')
      .select('name, slug')
      .eq('active', true)
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) setProperties(data);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

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
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('success', `${deleteTarget.full_name} has been deleted.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (user: UserProfile, newRole: string) => {
    if (user.role === newRole) return;

    if (user.id === currentAdminId && newRole !== 'admin') {
      showToast('error', 'You cannot remove your own admin role.');
      return;
    }

    setRoleLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || 'Failed to update role');
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      showToast('success', `${user.full_name}'s role updated to ${newRole}.`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setRoleLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const clientCount = users.filter((u) => u.role === 'client').length;
  const employeeCount = users.filter((u) => u.role === 'employee').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

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
        {/* Header section */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight transition-colors duration-300 dark:text-white">
              System{' '}
              <span
                className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
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

        {/* Stats Row */}
        <DashboardStatsCards
          totalUsers={users.length}
          clientCount={clientCount}
          employeeCount={employeeCount}
          adminCount={adminCount}
          trends={analytics?.trends}
          isLoading={isStatsLoading}
        />

        {/* Charts & Analytics Section */}
        <DashboardChartsGrid
          userGrowthData={userGrowthData}
          documentStatsData={documentStatsData}
          isLoading={isStatsLoading}
        />

        {/* Quick Actions & Activity Timeline */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-1">
            <QuickActions />
          </div>
          <div className="min-w-0 xl:col-span-2">
            <ActivityTimeline
              activities={recentActivities}
              isLoading={authLoading || activitiesLoading}
            />
          </div>
        </div>

        {/* Users Table */}
        <DashboardUsersTable
          users={users}
          loading={loading}
          search={search}
          setSearch={setSearch}
          properties={properties}
          roleLoading={roleLoading}
          currentAdminId={currentAdminId}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })}
          onAddEmployee={() => setShowAddEmployee(true)}
          onManageTeam={() => setShowAdvisorSettings(true)}
          onAddUser={() => setShowCreate(true)}
          onEditUser={setEditTarget}
          onDeleteUser={setDeleteTarget}
          onRoleChange={handleRoleChange}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            token={token ?? ''}
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
            token={token ?? ''}
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
        {showAddEmployee && (
          <AddEmployeeModal
            token={token ?? ''}
            onClose={() => setShowAddEmployee(false)}
            onSuccess={() => {
              setShowAddEmployee(false);
              queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
              showToast('success', 'Employee created successfully!');
            }}
          />
        )}
        {showAdvisorSettings && (
          <AdvisorSettingsModal
            onClose={() => setShowAdvisorSettings(false)}
            token={token ?? ''}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
