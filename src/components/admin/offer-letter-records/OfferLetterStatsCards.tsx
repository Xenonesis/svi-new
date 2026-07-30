'use client';

import { FileSignature, IndianRupee, Briefcase, BadgeCheck } from 'lucide-react';
import { StatCardSkeleton } from '@/src/components/admin/Shared/AdminSkeleton';
import { AdminStatsCard } from '@/src/components/admin/Shared/AdminStatsCard';

interface OfferLetterStatsCardsProps {
  loading: boolean;
  totalCount: number;
  totalCtc: number;
  uniqueDesignations: number;
  completedCount: number;
}

export function OfferLetterStatsCards({
  loading,
  totalCount,
  totalCtc,
  uniqueDesignations,
  completedCount,
}: OfferLetterStatsCardsProps) {
  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatsCard icon={FileSignature} label="Total Letters" value={totalCount} delay={0} />
      <AdminStatsCard
        icon={IndianRupee}
        label="Total CTC (Monthly)"
        value={`₹${totalCtc.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        delay={0.05}
      />
      <AdminStatsCard
        icon={Briefcase}
        label="Unique Roles"
        value={uniqueDesignations}
        delay={0.1}
      />
      <AdminStatsCard icon={BadgeCheck} label="Completed" value={completedCount} delay={0.15} />
    </div>
  );
}
