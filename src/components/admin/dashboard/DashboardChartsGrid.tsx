'use client';

import dynamic from 'next/dynamic';
import type { UserGrowthData, DocumentStatsData } from '@/src/hooks/useDashboard';

const DocumentStatsChart = dynamic(
  () => import('@/src/components/admin/ChartComponents/DocumentStatsChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    ),
  }
);

const UserGrowthChart = dynamic(
  () => import('@/src/components/admin/ChartComponents/UserGrowthChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    ),
  }
);

interface DashboardChartsGridProps {
  userGrowthData: UserGrowthData[];
  documentStatsData: DocumentStatsData[];
  isLoading: boolean;
}

export function DashboardChartsGrid({
  userGrowthData,
  documentStatsData,
  isLoading,
}: DashboardChartsGridProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
      <UserGrowthChart data={userGrowthData} isLoading={isLoading} />
      <DocumentStatsChart data={documentStatsData} isLoading={isLoading} />
    </div>
  );
}
