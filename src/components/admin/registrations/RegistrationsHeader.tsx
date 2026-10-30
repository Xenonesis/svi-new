'use client';

import type { ReactElement } from 'react';
import { FileText, Clock, CheckCheck } from 'lucide-react';

interface RegistrationsHeaderProps {
  total: number;
  loading: boolean;
  analyticsLoading: boolean;
  pendingCount: number | string;
  approvedCount: number | string;
  onFilterPending: () => void;
  onFilterApproved: () => void;
}

export function RegistrationsHeader({
  total,
  loading,
  analyticsLoading,
  pendingCount,
  approvedCount,
  onFilterPending,
  onFilterApproved,
}: RegistrationsHeaderProps): ReactElement {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight dark:text-white">
          Property{' '}
          <span
            className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
            style={{
              backgroundSize: '200% 200%',
              backgroundImage:
                'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
            }}
          >
            Registrations
          </span>
        </h1>
        <p className="text-xs tracking-wide text-gray-600 dark:text-gray-400">
          View and manage all property registration submissions.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="dark:border-brand-gold/15 dark:bg-brand-dark-surface/65 relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="via-brand-gold/50 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-brand-gold/10 border-brand-gold/25 flex h-11 w-11 items-center justify-center rounded-lg border">
              <FileText className="text-brand-gold h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          ) : (
            <p className="text-brand-navy text-3xl font-bold tracking-tight dark:text-white">
              {total}
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Total Registrations
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          title="Show pending registrations"
          onClick={onFilterPending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onFilterPending();
          }}
          className="hover-lift-sm btn-tactile dark:bg-brand-dark-surface/65 relative cursor-pointer overflow-hidden rounded-xl border border-amber-200/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-amber-500/20"
        >
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200/60 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-900/20">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          {analyticsLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Pending Approval
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          title="Show approved registrations"
          onClick={onFilterApproved}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onFilterApproved();
          }}
          className="hover-lift-sm btn-tactile dark:bg-brand-dark-surface/65 relative cursor-pointer overflow-hidden rounded-xl border border-emerald-200/60 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:border-emerald-500/20"
        >
          <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200/60 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-900/20">
              <CheckCheck className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          {analyticsLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Approved
          </p>
        </div>
      </div>
    </>
  );
}
