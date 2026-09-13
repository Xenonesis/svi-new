'use client';

import React from 'react';
import {
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Phone,
  Tag,
  Calendar,
  Layers,
} from 'lucide-react';
import type { AllotmentCandidate } from './types';

export interface PortalAllotmentPendingCardProps {
  candidate: AllotmentCandidate;
  onApprove: (candidate: AllotmentCandidate) => void;
  isApproving: boolean;
}

export function PortalAllotmentPendingCard({
  candidate,
  onApprove,
  isApproving,
}: PortalAllotmentPendingCardProps) {
  return (
    <div className="hover:border-brand-gold/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-700/80 dark:bg-gray-800/90">
      {/* Top Header: Ticket ID & Source Badges */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <span className="dark:text-brand-gold inline-flex items-center gap-1.5 rounded-lg bg-[#0f2942] px-3 py-1 font-mono text-xs font-bold tracking-wide text-white shadow-xs dark:bg-gray-900">
              <Tag className="text-brand-gold h-3 w-3" />
              {candidate.ticketId}
            </span>
            <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Needs Approval
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {candidate.documentCount} {candidate.documentCount === 1 ? 'doc' : 'docs'}
            </span>
          </div>
        </div>

        {/* Client Name & Contact */}
        <div className="mt-3.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {candidate.clientName || 'Unnamed Client'}
          </h3>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-gray-300">
            {candidate.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {candidate.phone}
              </span>
            )}
            {candidate.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                {candidate.email}
              </span>
            )}
          </div>
        </div>

        {/* Property & Allotment Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-gray-700/40 dark:bg-gray-900/40">
          <div>
            <span className="text-slate-500 dark:text-gray-400">Project:</span>
            <p className="mt-0.5 truncate font-semibold text-slate-900 dark:text-white">
              {candidate.projectName || 'Shyam Aangan (Default)'}
            </p>
          </div>

          <div>
            <span className="text-slate-500 dark:text-gray-400">Unit / Plot:</span>
            <p className="dark:text-brand-gold mt-0.5 font-bold text-[#0f2942]">
              {candidate.unitNo || 'To be assigned'}
            </p>
          </div>

          <div>
            <span className="text-slate-500 dark:text-gray-400">Plot Area:</span>
            <p className="mt-0.5 font-medium text-slate-800 dark:text-gray-200">
              {candidate.area ? `${candidate.area} Sq. Yds.` : '—'}
            </p>
          </div>

          <div>
            <span className="text-slate-500 dark:text-gray-400">Total Amount:</span>
            <p className="mt-0.5 font-bold text-emerald-700 dark:text-emerald-400">
              {candidate.totalCost ? `₹${candidate.totalCost.toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
        </div>

        {/* Payment Milestones Summary if present */}
        {candidate.paymentMilestones.length > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {candidate.paymentMilestones.length} Recorded Payment Receipts
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 border-t border-slate-100 pt-3 dark:border-gray-700/60">
        <button
          onClick={() => onApprove(candidate)}
          disabled={isApproving}
          className="dark:from-brand-gold dark:to-brand-gold-light dark:text-brand-navy flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f2942] to-[#1a3d60] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
        >
          {isApproving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Approving Client...
            </>
          ) : (
            <>
              <CheckCircle2 className="text-brand-gold dark:text-brand-navy h-4 w-4" />
              Approve Client & Allotment
            </>
          )}
        </button>
      </div>
    </div>
  );
}
