'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ActivityTimeline from '@/src/components/admin/ActivityTimeline';
import QuickActions from '@/src/components/admin/QuickActions';
import type { UserProfile } from '@/src/lib/supabase/types';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';
import { useUsers, useAnalytics, useActivities } from '@/src/hooks/useDashboard';

import { DashboardStatsCards } from '@/src/components/admin/dashboard/DashboardStatsCards';
import { DashboardChartsGrid } from '@/src/components/admin/dashboard/DashboardChartsGrid';
import { DashboardUsersTable } from '@/src/components/admin/dashboard/DashboardUsersTable';
import { DashboardBackground } from '@/src/components/admin/dashboard/DashboardBackground';
import { DashboardHeader } from '@/src/components/admin/dashboard/DashboardHeader';
import { DashboardModalsContainer } from '@/src/components/admin/dashboard/DashboardModalsContainer';
import { useDashboardUserActions } from '@/src/components/admin/dashboard/useDashboardUserActions';

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth state
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
  const [properties, setProperties] = useState<Array<{ name: string; slug: string }>>([]);

  // React Query hooks — data fetching with caching
  const { data: usersData, isLoading: usersLoading } = useUsers(token);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(token);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(token);
  const users = usersData?.users ?? [];
  const activities = activitiesData?.activities ?? [];
  const loading = authLoading || (usersLoading && !usersData);
  const isStatsLoading = authLoading || analyticsLoading || (usersLoading && !usersData);

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const {
    deleteLoading,
    roleLoading,
    activeLoading,
    handleDelete,
    handleRoleChange,
    handleToggleActive,
  } = useDashboardUserActions(token, refreshUsers, currentAdminId);

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

  const clientCount = users.filter((u) => u.role === 'client').length;
  const employeeCount = users.filter((u) => u.role === 'employee').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="relative w-full font-sans">
      <DashboardBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <DashboardHeader />

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
          userGrowthData={analytics?.userGrowth || []}
          documentStatsData={analytics?.documentStats || []}
          isLoading={isStatsLoading}
        />

        {/* Quick Actions & Activity Timeline */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-1">
            <QuickActions />
          </div>
          <div className="min-w-0 xl:col-span-2">
            <ActivityTimeline
              activities={activities}
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
          onRefresh={refreshUsers}
          onAddEmployee={() => setShowAddEmployee(true)}
          onManageTeam={() => setShowAdvisorSettings(true)}
          onAddUser={() => setShowCreate(true)}
          onEditUser={setEditTarget}
          onDeleteUser={setDeleteTarget}
          onRoleChange={handleRoleChange}
          onToggleActive={handleToggleActive}
          activeLoading={activeLoading}
        />
      </div>

      {/* Modals */}
      <DashboardModalsContainer
        token={token}
        properties={properties}
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        showAddEmployee={showAddEmployee}
        setShowAddEmployee={setShowAddEmployee}
        showAdvisorSettings={showAdvisorSettings}
        setShowAdvisorSettings={setShowAdvisorSettings}
        editTarget={editTarget}
        setEditTarget={setEditTarget}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleteLoading={deleteLoading}
        onDelete={() => handleDelete(deleteTarget, () => setDeleteTarget(null))}
        onRefresh={refreshUsers}
      />
    </div>
  );
}
