import React from 'react';
import { CheckCircle2, Loader2, Search } from 'lucide-react';
import { PortalAllotmentPendingCard } from './PortalAllotmentPendingCard';
import type { AllotmentCandidate } from './types';

export interface PortalAllotmentsPendingViewProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  candidates: AllotmentCandidate[];
  filteredCandidates: AllotmentCandidate[];
  onApproveCandidate: (candidate: AllotmentCandidate) => void;
  approvingTicketId: string | null;
}

export function PortalAllotmentsPendingView({
  searchTerm,
  onSearchChange,
  loading,
  candidates,
  filteredCandidates,
  onApproveCandidate,
  approvingTicketId,
}: PortalAllotmentsPendingViewProps): React.JSX.Element {
  return (
    <div>
      {/* Search Filter */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search pending client tickets by name, ID, phone, project..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <Loader2 className="text-brand-gold mb-3 h-8 w-8 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Checking unique ticket clients...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {candidates.length === 0
              ? 'All Unique Tickets Approved'
              : 'No matching pending tickets found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {candidates.length === 0
              ? 'Every unique client Ticket / Ref ID has already received its one-time approval.'
              : 'Try searching with a different client name or ticket ID.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((c) => (
            <PortalAllotmentPendingCard
              key={c.normalizedId}
              candidate={c}
              onApprove={onApproveCandidate}
              isApproving={approvingTicketId === c.ticketId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
