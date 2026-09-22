'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import ActivityTimeline from '@/src/components/admin/ActivityTimeline';
import QuickActions from '@/src/components/admin/QuickActions';
import type { UserProfile } from '@/src/lib/supabase/types';
import { supabase } from '@/src/lib/supabase/client';
import { useAuthStore } from '@/src/stores/authStore';
import { useUsers, useAnalytics, useActivities } from '@/src/hooks/useDashboard';

import { DashboardChartsGrid } from '@/src/components/admin/dashboard/DashboardChartsGrid';
import { DashboardUsersTable } from '@/src/components/admin/dashboard/DashboardUsersTable';
import { DashboardBackground } from '@/src/components/admin/dashboard/DashboardBackground';
import { DashboardModalsContainer } from '@/src/components/admin/dashboard/DashboardModalsContainer';
import { useDashboardUserActions } from '@/src/components/admin/dashboard/useDashboardUserActions';

import { ExecutiveBriefingBanner } from '@/src/components/admin/dashboard/executive/ExecutiveBriefingBanner';
import { ExecutiveBentoKpis } from '@/src/components/admin/dashboard/executive/ExecutiveBentoKpis';
import { TargetAchievementMeter } from '@/src/components/admin/dashboard/executive/TargetAchievementMeter';
import { InventoryPulseWidget } from '@/src/components/admin/dashboard/executive/InventoryPulseWidget';
import { UrgentAttentionRadar } from '@/src/components/admin/dashboard/executive/UrgentAttentionRadar';
import { PaymentDuesRadar } from '@/src/components/admin/dashboard/executive/PaymentDuesRadar';
import { CommandPaletteModal } from '@/src/components/admin/dashboard/executive/CommandPaletteModal';
import { exportExecutiveDossier } from '@/src/lib/dashboard/exportExecutiveDossier';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

type Timeframe = 'today' | '7d' | '30d' | 'ytd';

const defaultKpis: ExecutiveDashboardData['kpis'] = {
  totalCollections: 0,
  collectionsGrowthPercent: 0,
  collectionsSparkline: [0, 0, 0, 0, 0, 0, 0],
  activeLeads: 0,
  hotLeadsCount: 0,
  leadsSparkline: [0, 0, 0, 0, 0, 0, 0],
  bookedPlots: 0,
  totalPlots: 0,
  plotsSparkline: [0, 0, 0, 0, 0, 0, 0],
  onDutyStaff: 0,
  totalStaff: 0,
  attendanceRate: 0,
};

const defaultTarget: ExecutiveDashboardData['target'] = {
  monthlyTarget: 5000000,
  currentCollections: 0,
  percentage: 0,
  projectedTotal: 0,
  status: 'behind',
  dailyRunRateNeeded: 0,
};

const defaultUrgentActions: ExecutiveDashboardData['urgentActions'] = {
  unverifiedReceipts: [],
  hotLeadsPending: [],
  pendingLeaves: [],
};

export default function AdminDashboard2() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth state
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const authLoading = useAuthStore((s) => s.loading);
  const currentAdminId = userId || '';

  // Timeframe and Command state
  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // User management UI state
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAdvisorSettings, setShowAdvisorSettings] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  // Global keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redirect to login if not authenticated as admin
  useEffect(() => {
    if (authLoading) return;
    if (!token || !isAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, token, isAdmin, router]);

  // Executive Data Query with React Query
  const { data: execData, isLoading: execLoading } = useQuery<ExecutiveDashboardData>({
    queryKey: ['admin', 'executive', timeframe],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/executive', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load executive data');
      return res.json();
    },
    enabled: !!token && isAdmin,
    staleTime: 45 * 1000,
  });

  // Properties Query (15 min cache)
  const { data: propertiesData } = useQuery({
    queryKey: ['admin', 'properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, slug, description, image_url, base_price, is_featured')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const properties = propertiesData || [];

  // User management and activity queries
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

  // PDF Dossier Export Handler
  const handleExportDossier = useCallback(async () => {
    if (!execData) return;
    try {
      await exportExecutiveDossier(execData);
    } catch (err) {
      console.error('Failed to export executive dossier:', err);
    }
  }, [execData]);

  return (
    <div className="relative min-h-screen w-full font-sans text-gray-100">
      <DashboardBackground />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Zone 1: Executive Header with Timeframe selector & Search button */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
                <span className="bg-brand-gold h-1.5 w-1.5 animate-pulse rounded-full" />
                Executive Cockpit
              </span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white md:text-4xl">
              Enterprise{' '}
              <span
                className="text-gradient-gold inline-block pr-2.5 italic"
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage:
                    'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
                }}
              >
                Command Center
              </span>
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Real-time intelligence on financial collections, target pacing, active sales pipeline,
              operational triage & workforce.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Selector */}
            <div className="flex items-center rounded-xl border border-white/10 bg-[#090e17]/80 p-1 shadow-lg backdrop-blur-md">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'ytd', label: 'YTD' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimeframe(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    timeframe === item.id
                      ? 'border-brand-gold/40 bg-brand-gold/20 text-brand-gold border shadow-sm'
                      : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Actions Search Button */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              aria-label="Open Command Palette"
              className="group hover:border-brand-gold/30 flex items-center gap-2 rounded-xl border border-white/10 bg-[#090e17]/80 px-3.5 py-2 text-xs font-medium text-gray-300 shadow-lg backdrop-blur-md transition-all hover:text-white"
            >
              <Search className="group-hover:text-brand-gold h-3.5 w-3.5 text-gray-400 transition-colors" />
              <span>Search</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-400 sm:inline-flex">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>

        {/* Zone 2: Executive Briefing Banner */}
        <ExecutiveBriefingBanner
          collectionsTotal={execData?.kpis.totalCollections ?? 0}
          hotLeadsCount={execData?.kpis.hotLeadsCount ?? 0}
          onDutyCount={execData?.kpis.onDutyStaff ?? 0}
          onOpenCommand={() => setIsCommandOpen(true)}
          onExportPdf={handleExportDossier}
        />

        {/* Zone 3: 4-Pillar Executive Bento KPIs */}
        <ExecutiveBentoKpis kpis={execData?.kpis ?? defaultKpis} isLoading={execLoading} />

        {/* Zone 4: Dual Cockpit (Target Achievement & Inventory Pulse) */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TargetAchievementMeter target={execData?.target ?? defaultTarget} />
          <InventoryPulseWidget properties={properties} />
        </div>

        {/* Zone 5: Operational Triage (Urgent Attention & Payment Dues) */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UrgentAttentionRadar urgentActions={execData?.urgentActions ?? defaultUrgentActions} />
          <PaymentDuesRadar paymentDues={execData?.paymentDues ?? []} />
        </div>

        {/* Zone 6: Analytics & Actions */}
        <DashboardChartsGrid
          userGrowthData={analytics?.userGrowth || []}
          documentStatsData={analytics?.documentStats || []}
          isLoading={isStatsLoading}
        />

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

        {/* Zone 7: Account Management Table */}
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

      {/* Modals Container */}
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

      {/* Global Command Palette Spotlight */}
      <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
}
